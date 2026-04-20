<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Enseignant;
use App\Models\Etudiant;
use App\Models\Administrateur;
use App\Models\Classe;
use App\Models\Module;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Administrateur ──────────────────────────────
        $adminUser = User::create([
            'nom'      => 'Admin',
            'prenom'   => 'Super',
            'email'    => 'admin@test.com',
            'password' => Hash::make('password'),
            'role'     => 'Administrateur',
            'status'   => 'active',
        ]);
        Administrateur::create(['user_id' => $adminUser->id]);

        // ── 2. Enseignant ──────────────────────────────────
        $enseignantUser = User::create([
            'nom'      => 'Dupont',
            'prenom'   => 'Jean',
            'email'    => 'enseignant@test.com',
            'password' => Hash::make('password'),
            'role'     => 'Enseignant',
            'status'   => 'active',
        ]);
        $enseignant = Enseignant::create([
            'user_id'        => $enseignantUser->id,
            'specialization' => 'Mathématiques',
        ]);

        // ── 3. Classe ──────────────────────────────────────
        $classe = Classe::create([
            'name'          => 'DEV101',
            'level'         => '2ème année',
            'academic_year' => '2025-2026',
        ]);

        // ── 4. Module ──────────────────────────────────────
        $module = Module::create([
            'name' => 'Mathématiques',
            'code' => 'MATH101',
        ]);

        // ── 5. Etudiants (3 étudiants) ────────────────────
        $etudiants = [
            ['nom' => 'Martin',  'prenom' => 'Alice', 'email' => 'alice@test.com',   'num' => 'ETU001'],
            ['nom' => 'Bernard', 'prenom' => 'Bob',   'email' => 'bob@test.com',     'num' => 'ETU002'],
            ['nom' => 'Durand',  'prenom' => 'Clara', 'email' => 'clara@test.com',   'num' => 'ETU003'],
        ];

        foreach ($etudiants as $e) {
            $user = User::create([
                'nom'      => $e['nom'],
                'prenom'   => $e['prenom'],
                'email'    => $e['email'],
                'password' => Hash::make('password'),
                'role'     => 'Etudiant',
                'status'   => 'active',
            ]);
            Etudiant::create([
                'user_id'          => $user->id,
                'class_id'         => $classe->id,
                'registration_num' => $e['num'],
            ]);
        }

        $this->command->info('✅ Seeder terminé!');
        $this->command->info('👤 Admin      : admin@test.com / password');
        $this->command->info('👨‍🏫 Enseignant : enseignant@test.com / password');
        $this->command->info('👨‍🎓 Etudiants  : alice@test.com, bob@test.com, clara@test.com / password');
    }
}