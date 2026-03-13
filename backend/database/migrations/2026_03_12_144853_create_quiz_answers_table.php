<?php
// database/migrations/2026_03_01_000010_create_quiz_answers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')
                  ->constrained('quiz_sessions')
                  ->cascadeOnDelete();
            $table->foreignId('question_id')
                  ->constrained('quiz_questions')
                  ->cascadeOnDelete();
            $table->foreignId('option_id')
                  ->nullable()
                  ->constrained('quiz_options')
                  ->nullOnDelete();   // QCM
            $table->text('answer_text')->nullable();      // texte libre
            $table->boolean('is_correct')->nullable();    // calculé auto pour QCM

            // une réponse par question par session
            $table->unique(['session_id', 'question_id']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quiz_answers');
    }
};