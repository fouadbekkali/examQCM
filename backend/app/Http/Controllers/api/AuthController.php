<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1) Validate input si vide pas envoyé
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // 2) Search user by email
        $user = User::where('email', $data['email'])->first();

        // 3) Check credentials
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
        }

        // 4) Check status optionnelle
        if ($user->status !== 'active') {
            return response()->json(['message' => 'Compte inactive/suspendu'], 403);
        }

        // 5) Create Sanctum token (hada pour utiliser sur  Authorization Bearer)
        $token = $user->createToken('api-token')->plainTextToken;

        // 6) Return token + basic user info (pour front-end y3rf role )
        return response()->json([
            'message' => 'Login success',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }


    public function me(Request $request)
    {
        // Return authenticated user info
        return response()->json([
            'user' => $request->user()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

}
