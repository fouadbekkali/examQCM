<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\QuizController;

// ── Auth (public) ──────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Auth (protected) ───────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/classes', [QuizController::class, 'getClasses']);
    Route::get('/modules', [QuizController::class, 'getModules']);

    // ── Administrateur ─────────────────────────────────────
    Route::middleware('role:Administrateur')->group(function () {
        Route::get('/admin/users',       [\App\Http\Controllers\AdminController::class, 'index']);
        Route::post('/admin/users',      [\App\Http\Controllers\AdminController::class, 'store']);
        Route::put('/admin/users/{id}',  [\App\Http\Controllers\AdminController::class, 'update']);
        Route::delete('/admin/users/{id}',[\App\Http\Controllers\AdminController::class, 'destroy']);
    });

    // ── Enseignant ─────────────────────────────────────────
    Route::middleware('role:Enseignant')->group(function () {
        Route::get('/teacher/quizzes',   [QuizController::class, 'teacherQuizzes']);
        Route::post('/quiz',             [QuizController::class, 'store']);
        Route::get('/quiz/{id}/results', [QuizController::class, 'results']);
        Route::delete('/quiz/{id}',      [QuizController::class, 'destroy']);
    });

    // ── Etudiant ───────────────────────────────────────────
    Route::middleware('role:Etudiant')->group(function () {
        Route::get('/quiz',                                 [QuizController::class, 'index']);
        Route::post('/quiz/{id}/start',                     [QuizController::class, 'start']);
        Route::patch('/quiz/session/{sessionId}/tentative', [QuizController::class, 'enregistrerTentative']);
        Route::post('/quiz/session/{sessionId}/submit',     [QuizController::class, 'soumettre']);
    });

});
