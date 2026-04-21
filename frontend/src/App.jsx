import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './comp/Login';
import CreateQuizPage from './comp/CreateQuizPage';
import TeacherDashboard from './comp/TeacherDashboard';
import StudentDashboard from './comp/StudentDashboard';
import TakeQuizPage from './comp/TakeQuizPage';
import ProtectedRoute from './comp/ProtectedRoute';
import QuizResultsPage from './comp/QuizResultsPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Routes Enseignant */}
      <Route path="/teacher" element={
        <ProtectedRoute role="Enseignant">
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/teacher/create-quiz" element={
        <ProtectedRoute role="Enseignant">
          <CreateQuizPage />
        </ProtectedRoute>
      } />
      <Route path="/teacher/quiz/:id/results" element={
        <ProtectedRoute role="Enseignant">
          <QuizResultsPage />
        </ProtectedRoute>
      } />

      {/* Routes Etudiant */}
      <Route path="/student" element={
        <ProtectedRoute role="Etudiant">
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/quiz/:id" element={
        <ProtectedRoute role="Etudiant">
          <TakeQuizPage />
        </ProtectedRoute>
      } />

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
