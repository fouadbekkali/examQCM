<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $fillable = [
        'name',
        'level',
        'academic_year',
    ];

    public function etudiants()
    {
        return $this->hasMany(Etudiant::class, 'class_id');
    }

    // ← زيد هاد السطر فقط
    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'class_id');
    }
}