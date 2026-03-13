<?php
//test

// routes/api.php — زيد هاد الroutes فالملف الموجود

use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    // ENSEIGNANT
    Route::middleware('role:Enseignant')->group(function () {
        Route::post('/quiz',                [QuizController::class, 'store']);
        Route::get('/quiz/{id}/results',    [QuizController::class, 'results']);
    });

    // ETUDIANT
    Route::middleware('role:Etudiant')->group(function () {
        Route::get('/quiz',                                        [QuizController::class, 'index']);
        Route::post('/quiz/{id}/start',                            [QuizController::class, 'start']);
        Route::patch('/quiz/session/{sessionId}/tentative',        [QuizController::class, 'enregistrerTentative']);
        Route::post('/quiz/session/{sessionId}/submit',            [QuizController::class, 'soumettre']);
    });

});

/*
ENDPOINTS:
POST   /api/quiz                              → Créer quiz (Enseignant)
GET    /api/quiz/{id}/results                 → Résultats quiz (Enseignant)
GET    /api/quiz                              → Liste quiz disponibles (Etudiant)
POST   /api/quiz/{id}/start                   → Démarrer quiz (Etudiant)
PATCH  /api/quiz/session/{id}/tentative       → Anti-triche (Etudiant)
POST   /api/quiz/session/{id}/submit          → Soumettre (Etudiant)
*/