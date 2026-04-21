<?php
// app/Http/Controllers/QuizController.php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\QuizSession;
use App\Models\QuizAnswer;
use App\Models\Etudiant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class QuizController extends Controller {

    private function enseignant() {
        return Auth::user()->enseignant;
    }

    private function etudiant() {
        return Auth::user()->etudiant;
    }

    // ─────────────────────────────────────────────────────
    // ENSEIGNANT — Liste des quiz créés
    // GET /api/teacher/quizzes
    // ─────────────────────────────────────────────────────
    public function teacherQuizzes() {
        $quizzes = Quiz::where('enseignant_id', $this->enseignant()->id)
            ->with(['module', 'classe'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($quizzes);
    }

    // ─────────────────────────────────────────────────────
    // ENSEIGNANT — Créer et publier un quiz
    // POST /api/quiz
    // ─────────────────────────────────────────────────────
    public function store(Request $request) {
        $request->validate([
            'title'            => 'required|string|max:255',
            'class_id'         => 'required|exists:classes,id',
            'module_id'        => 'required|exists:modules,id',
            'duration_minutes' => 'required|integer|min:1',
            'max_tentatives'   => 'required|integer|min:1',
            'questions_count'  => 'required|integer|min:1',
            'questions'        => 'required|array|min:1',
            'questions.*.type' => 'required|in:qcm,texte',
            'questions.*.text' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $quiz = Quiz::create([
                'title'            => $request->title,
                'class_id'         => $request->class_id,
                'module_id'        => $request->module_id,
                'enseignant_id'    => $this->enseignant()->id,
                'duration_minutes' => $request->duration_minutes,
                'max_tentatives'   => $request->max_tentatives,
                'questions_count'  => $request->questions_count,
                'action_finale'    => 'auto_submit',
                'statut'           => 'published',
            ]);

            foreach ($request->questions as $index => $q) {
                $question = QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'type'    => $q['type'],
                    'text'    => $q['text'],
                    'order'   => $index + 1,
                ]);

                if ($q['type'] === 'qcm') {
                    $labels = ['A', 'B', 'C', 'D'];
                    foreach ($q['options'] as $i => $optText) {
                        QuizOption::create([
                            'question_id' => $question->id,
                            'text'        => $optText,
                            'is_correct'  => ($i === (int)$q['correct']),
                            'label'       => $labels[$i] ?? 'A',
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Quiz créé et publié avec succès',
                'quiz'    => $quiz->load('questions.options'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────
    // ETUDIANT — Liste des quiz disponibles
    // GET /api/quiz
    // ─────────────────────────────────────────────────────
    public function index() {
        $etudiant = $this->etudiant();

        $quizzes = Quiz::where('class_id', $etudiant->class_id)
            ->where('statut', 'published')
            ->with('module')
            ->get()
            ->map(function ($quiz) use ($etudiant) {
                $session = QuizSession::where('quiz_id', $quiz->id)
                    ->where('etudiant_id', $etudiant->id)
                    ->first();
                return [
                    'id'               => $quiz->id,
                    'title'            => $quiz->title,
                    'module'           => $quiz->module->name,
                    'duration_minutes' => $quiz->duration_minutes,
                    'questions_count'  => $quiz->questions_count,
                    'statut_session'   => $session?->statut ?? 'non_commence',
                    'score'            => $session?->score,
                ];
            });

        return response()->json($quizzes);
    }

    // ─────────────────────────────────────────────────────
    // ETUDIANT — Démarrer un quiz
    // POST /api/quiz/{id}/start
    // ─────────────────────────────────────────────────────
    public function start($id) {
        $quiz     = Quiz::findOrFail($id);
        $etudiant = $this->etudiant();

        $session = QuizSession::where('quiz_id', $quiz->id)
            ->where('etudiant_id', $etudiant->id)
            ->first();

        if ($session) {
            if ($session->statut === 'soumis') {
                return response()->json(['message' => 'Quiz déjà soumis'], 403);
            }
            if ($session->statut === 'bloque') {
                return response()->json(['message' => 'Quiz bloqué — trop de tentatives'], 403);
            }
            $questions = QuizQuestion::with('options')
                ->whereIn('id', $session->question_ids)
                ->get();
            return response()->json([
                'session'   => $session,
                'quiz'      => $quiz->only(['id','title','duration_minutes','max_tentatives','action_finale']),
                'questions' => $questions,
            ]);
        }

        // Nouvelle session — questions aléatoires
        $randomQuestions = QuizQuestion::where('quiz_id', $quiz->id)
            ->inRandomOrder()
            ->limit($quiz->questions_count)
            ->get();

        $session = QuizSession::create([
            'quiz_id'      => $quiz->id,
            'etudiant_id'  => $etudiant->id,
            'question_ids' => $randomQuestions->pluck('id')->toArray(),
            'tentatives'   => 0,
            'statut'       => 'en_cours',
            'started_at'   => now(),
        ]);

        return response()->json([
            'session'   => $session,
            'quiz'      => $quiz->only(['id','title','duration_minutes','max_tentatives','action_finale']),
            'questions' => $randomQuestions->load('options'),
        ], 201);
    }

    // ─────────────────────────────────────────────────────
    // ETUDIANT — Anti-triche: enregistrer sortie de page
    // PATCH /api/quiz/session/{sessionId}/tentative
    // ─────────────────────────────────────────────────────
    public function enregistrerTentative(Request $request, $sessionId) {
        $session = QuizSession::findOrFail($sessionId);
        $quiz    = $session->quiz;

        if ($session->statut !== 'en_cours') {
            return response()->json(['message' => 'Session déjà terminée'], 403);
        }

        $session->increment('tentatives');

        if ($session->tentatives >= $quiz->max_tentatives) {
            if ($quiz->action_finale === 'auto_submit') {
                return $this->soumettre($request, $sessionId);
            }
            $session->update(['statut' => 'bloque']);
            return response()->json(['statut' => 'bloque', 'message' => 'Quiz bloqué'], 403);
        }

        return response()->json([
            'statut'               => 'en_cours',
            'tentatives'           => $session->tentatives,
            'tentatives_restantes' => $quiz->max_tentatives - $session->tentatives,
        ]);
    }

    // ─────────────────────────────────────────────────────
    // ETUDIANT — Soumettre le quiz
    // POST /api/quiz/session/{sessionId}/submit
    // ─────────────────────────────────────────────────────
    public function soumettre(Request $request, $sessionId) {
        $session = QuizSession::findOrFail($sessionId);

        if ($session->statut === 'soumis') {
            return response()->json(['message' => 'Quiz déjà soumis'], 403);
        }

        DB::beginTransaction();
        try {
            if ($request->has('answers')) {
                foreach ($request->answers as $questionId => $answer) {
                    $question = QuizQuestion::find($questionId);
                    if (!$question) continue;

                    $isCorrect  = null;
                    $optionId   = null;
                    $answerText = null;

                    if ($question->type === 'qcm') {
                        $optionId  = $answer['option_id'] ?? null;
                        $option    = QuizOption::find($optionId);
                        $isCorrect = $option?->is_correct ?? false;
                    } else {
                        $answerText = $answer['text'] ?? null;
                    }

                    QuizAnswer::updateOrCreate(
                        ['session_id' => $session->id, 'question_id' => $questionId],
                        ['option_id' => $optionId, 'answer_text' => $answerText, 'is_correct' => $isCorrect]
                    );
                }
            }

            $score = QuizAnswer::where('session_id', $session->id)
                ->where('is_correct', true)
                ->count();

            $session->update([
                'statut'       => 'soumis',
                'submitted_at' => now(),
                'score'        => $score,
            ]);

            DB::commit();
            return response()->json(['message' => 'Quiz soumis', 'score' => $score, 'statut' => 'soumis']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────
    // ENSEIGNANT — Résultats d'un quiz
    // GET /api/quiz/{id}/results
    // ─────────────────────────────────────────────────────
    public function results($id) {
        $quiz = Quiz::with([
            'sessions.etudiant.user',
            'sessions.answers.question',
            'sessions.answers.option',
            'questions.options',
            'module',
            'classe'
        ])->findOrFail($id);

        $qcmTotal = $quiz->questions()->where('type', 'qcm')->count();

        // Safely extract class properties or defaults
        $classeLevel = $quiz->classe?->level ?? 'Non assigné';
        $currentMonth = (int)date('m');
        $currentYear = (int)date('Y');
        $fallbackYear = $currentMonth >= 9 ? $currentYear . '/' . ($currentYear + 1) : ($currentYear - 1) . '/' . $currentYear;
        $classeYear = $quiz->classe?->academic_year ?? $fallbackYear;
        
        // Infer filiere based on class name or default
        $className = $quiz->classe?->name ?? '';
        $filiere = str_contains(strtoupper($className), 'DEV') ? 'Développement Informatique' : 'Non assignée';

        $results = $quiz->sessions->map(function ($session) use ($qcmTotal) {
            $user = $session->etudiant->user;
            return [
                'session_id' => $session->id,
                'etudiant'   => $user->prenom . ' ' . $user->nom,
                'score'      => $session->score ?? 0,
                'qcm_total'  => $qcmTotal,
                'tentatives' => $session->tentatives,
                'statut'     => $session->statut,
                'duree'      => $session->submitted_at
                    ? $session->started_at->diffInMinutes($session->submitted_at) . ' min'
                    : 'En cours',
                'answers'    => $session->answers,
            ];
        });

        return response()->json([
            'quiz'    => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'duration_minutes' => $quiz->duration_minutes,
                'questions_count' => $quiz->questions_count,
                'module' => $quiz->module?->name,
                'classe' => $quiz->classe?->name,
                'questions' => $quiz->questions,
            ],
            'filiere'       => $filiere,
            'niveau'        => $classeLevel,
            'annee'         => $classeYear,
            'bareme'        => $qcmTotal, 
            'total'         => $quiz->sessions->count(),
            'results'       => $results,
        ]);
    }

    // ─────────────────────────────────────────────────────
    // ENSEIGNANT — Supprimer un quiz
    // DELETE /api/quiz/{id}
    // ─────────────────────────────────────────────────────
    public function destroy($id) {
        $quiz = Quiz::findOrFail($id);
        
        // Ensure the logged-in teacher owns the quiz
        if ($quiz->enseignant_id !== $this->enseignant()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        DB::beginTransaction();
        try {
            // Because of cascading deletes or relations, deleting the quiz might need manual cleaning,
            // but standard Laravel setup usually deletes via foreign keys if migrations are cascaded.
            // If not, we'll explicitly delete related data to be safe:
            QuizQuestion::where('quiz_id', $quiz->id)->delete();
            // QuizSession will cascade or can be explicitly deleted:
            QuizSession::where('quiz_id', $quiz->id)->delete();

            $quiz->delete();
            DB::commit();

            return response()->json(['message' => 'Quiz supprimé avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression', 'error' => $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────
    // OBTENIR Classes et Modules 
    // ─────────────────────────────────────────────────────
    public function getClasses() {
        return response()->json(\App\Models\Classe::all());
    }

    public function getModules() {
        return response()->json(\App\Models\Module::all());
    }
}