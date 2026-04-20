<?php
// database/migrations/2026_03_01_000001_create_modules_table.php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration {
    public function up(): void {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // ex: "Mathématiques"
            $table->string('code')->nullable(); // ex: "MATH101"
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
 
    public function down(): void {
        Schema::dropIfExists('modules');
    }
};
 