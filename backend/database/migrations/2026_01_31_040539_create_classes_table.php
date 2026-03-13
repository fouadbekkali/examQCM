<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('classes', function (Blueprint $table) {
        $table->id();
        $table->string('name');              // ex: "DEV101"
        $table->string('level');             // ex: "1ère année"
        $table->string('academic_year');     // ex: "2025-2026"
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
