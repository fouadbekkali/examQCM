import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        try {
            const { data } = await axios.get('/api/teacher/quizzes');
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
                    <h1 className="text-base font-bold text-slate-800">Espace Enseignant</h1>
                    <p className="text-xs text-slate-400">Bienvenue, {user?.prenom} {user?.nom}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/teacher/create-quiz')}
                        className="py-2 px-4 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
                    >
                        + Nouveau Quiz
                    </button>
                    <button
                        onClick={handleLogout}
                        className="py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Vos Quiz</h2>

                {loading ? (
                    <div className="text-center py-10">Chargement...</div>
                ) : quizzes.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                        <p className="text-slate-400 text-sm">Aucun quiz créé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-2 truncate" title={quiz.title}>{quiz.title}</h3>
                                    <p className="text-xs text-slate-500 mb-1">Module: <span className="font-semibold">{quiz.module?.name}</span></p>
                                    <p className="text-xs text-slate-500 mb-4">Classe: <span className="font-semibold">{quiz.classe?.name}</span></p>
                                    <div className="flex justify-between items-center text-xs text-slate-400">
                                        <span>{quiz.questions_count} Qs</span>
                                        <span>{quiz.duration_minutes} min</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <button className="w-full text-center text-sm font-medium text-slate-700 hover:text-slate-900">
                                        Voir les résultats
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
