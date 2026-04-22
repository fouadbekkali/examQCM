<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Etudiant;
use App\Models\Enseignant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index()
    {
        // Return mostly students and teachers, or all users
        $users = User::with(['etudiant.classe', 'enseignant'])->orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:Etudiant,Enseignant',
            'class_id' => 'required_if:role,Etudiant|exists:classes,id',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'status' => 'active',
            ]);

            if ($request->role === 'Etudiant') {
                Etudiant::create([
                    'user_id' => $user->id,
                    'class_id' => $request->class_id,
                    'registration_num' => 'ETU' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                ]);
            } else if ($request->role === 'Enseignant') {
                Enseignant::create([
                    'user_id' => $user->id,
                    'specialization' => $request->specialization ?? 'Générale',
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Utilisateur créé', 'user' => $user->load(['etudiant.classe', 'enseignant'])], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'nom' => 'sometimes|required|string',
            'prenom' => 'sometimes|required|string',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'sometimes|nullable|string|min:6',
        ]);

        $data = $request->only(['nom', 'prenom', 'email']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user->load(['etudiant.classe', 'enseignant'])]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'Administrateur') {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }
        
        DB::beginTransaction();
        try {
            if ($user->role === 'Etudiant') {
                $user->etudiant()->delete();
            } else if ($user->role === 'Enseignant') {
                $user->enseignant()->delete();
            }
            $user->delete();
            
            DB::commit();
            return response()->json(['message' => 'Utilisateur supprimé avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }
}
