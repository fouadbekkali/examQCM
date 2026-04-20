# Project Execution Guide

This project consists of a frontend (Vite) and a backend (Laravel). Below are the instructions to get everything running locally.

## Prerequisite
Ensure you have the following installed on your machine:
- PHP & Composer
- Node.js & npm

## Backend (Laravel)

1. **Navigate to the `backend` directory:**
   ```bash
   cd backend
   ```
2. **Install PHP dependencies:**
   ```bash
   composer install
   ```
3. **Set up the environment file:**
   If you don't have a `.env` file, copy it from the example file:
   ```bash
   cp .env.example .env
   ```
   *(Ensure you configure your database connection inside the `.env` file, e.g., using sqlite for easy local development).*
4. **Generate the application key:**
   ```bash
   php artisan key:generate
   ```
5. **Run database migrations:**
   Run the following to create the database schema:
   ```bash
   php artisan migrate
   ```
   *(If you want to seed the database with initial data, run: `php artisan migrate --seed`)*
6. **Start the Laravel server:**
   ```bash
   php artisan serve
   ```
   The API should now be available at `http://127.0.0.1:8000`.

## Frontend (Vite)

1. **Open a new terminal session and navigate to the `frontend` directory:**
   ```bash
   cd frontend
   ```
2. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend application should now be accessible. In the terminal, it will show you the exact local URL (typically `http://localhost:5173`).

You are now ready to test and continue developing the project!
