<?php
// database/migrations/2026_03_01_000002_create_quizzes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('title');

            // FK vers classes (table existante ✅)
            $table->foreignId('class_id')
                  ->constrained('classes')
                  ->cascadeOnDelete();

            // FK vers modules (table qu'on vient de créer ✅)
            $table->foreignId('module_id')
                  ->constrained('modules')
                  ->cascadeOnDelete();

            // FK vers enseignants (table existante ✅)
            // on pointe sur enseignants.id, pas users.id
            $table->foreignId('enseignant_id')
                  ->constrained('enseignants')
                  ->cascadeOnDelete();

            $table->integer('duration_minutes');
            $table->integer('max_tentatives')->default(2);
            $table->integer('questions_count');            // nb questions par étudiant
            $table->enum('action_finale', ['auto_submit', 'bloquer'])->default('auto_submit');
            $table->enum('statut', ['draft', 'published', 'closed'])->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('quizzes');
    }
};