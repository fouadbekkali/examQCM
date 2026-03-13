<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Enseignant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ← زيد هاد السطر فقط
    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
