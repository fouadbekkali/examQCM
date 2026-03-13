<?php
// database/migrations/2026_03_01_000008_create_quiz_sessions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quiz_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')
                  ->constrained('quizzes')
                  ->cascadeOnDelete();

            // FK vers etudiants.id (table existante ✅)
            $table->foreignId('etudiant_id')
                  ->constrained('etudiants')
                  ->cascadeOnDelete();

            $table->json('question_ids');   // les IDs des questions aléatoires de cet étudiant
            $table->integer('tentatives')->default(0);
            $table->enum('statut', ['en_cours', 'soumis', 'bloque'])->default('en_cours');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->integer('score')->nullable();

            // un étudiant = une seule session par quiz
            $table->unique(['quiz_id', 'etudiant_id']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quiz_sessions');
    }
};