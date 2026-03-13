<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuizAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'question_id',
        'option_id',
        'answer_text',
        'is_correct',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class);
    }

    public function question()
    {
        return $this->belongsTo(QuizQuestion::class);
    }

    public function option()
    {
        return $this->belongsTo(QuizOption::class);
    }
}
