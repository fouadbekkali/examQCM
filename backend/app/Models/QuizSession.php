<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuizSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'etudiant_id',
        'question_ids',
        'tentatives',
        'statut',
        'started_at',
        'submitted_at',
        'score',
    ];

    protected $casts = [
        'question_ids' => 'array',      // JSON → array تلقائياً
        'started_at'   => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function answers()
    {
        return $this->hasMany(QuizAnswer::class, 'session_id');
    }
}
