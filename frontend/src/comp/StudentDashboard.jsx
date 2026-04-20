import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        try {
            const { data } = await axios.get('/api/quiz');
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors de la récupération des quiz', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-base font-bold text-slate-800">Espace Étudiant</h1>
                    <p className="text-xs text-slate-400">Bienvenue, {user?.prenom} {user?.nom}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                >
                    Déconnexion
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Quiz Disponibles</h2>

                {loading ? (
                    <div className="text-center py-10">Chargement...</div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                        <p className="text-slate-400 text-sm">Aucun quiz disponible pour votre classe actuellement.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 truncate pr-4" title={quiz.title}>{quiz.title}</h3>
                                        {quiz.statut_session === 'soumis' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">Terminé</span>
                                        ) : quiz.statut_session === 'bloque' ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">Bloqué</span>
                                        ) : quiz.statut_session === 'en_cours' ? (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded">En cours</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">Nouveau</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Module: <span className="font-semibold">{quiz.module}</span></p>

                                    <div className="flex gap-4 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div>
                                            <span className="block font-semibold text-slate-700">{quiz.questions_count}</span>
                                            Questions
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-700">{quiz.duration_minutes}</span>
                                            Minutes
                                        </div>
                                        {quiz.score !== null && quiz.score !== undefined && (
                                            <div className="ml-auto text-right">
                                                <span className="block font-bold text-emerald-600">
                                                    {quiz.score}/{quiz.questions_count}
                                                </span>
                                                Score
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        disabled={quiz.statut_session === 'soumis' || quiz.statut_session === 'bloque'}
                                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {quiz.statut_session === 'en_cours' ? 'Reprendre le quiz' :
                                            (quiz.statut_session === 'soumis' || quiz.statut_session === 'bloque') ? 'Voir les détails' : 'Démarrer le quiz'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
