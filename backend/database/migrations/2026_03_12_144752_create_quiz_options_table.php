<?php
// database/migrations/2026_03_01_000006_create_quiz_options_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quiz_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')
                  ->constrained('quiz_questions')
                  ->cascadeOnDelete();
            $table->string('text');
            $table->boolean('is_correct')->default(false);
            $table->char('label', 1);   // A, B, C, D
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quiz_options');
    }
};