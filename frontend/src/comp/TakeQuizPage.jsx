import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';

export default function TakeQuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState('');

    const [timeLeft, setTimeLeft] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const latestSubmitQuiz = useRef(null);

    const startQuiz = useCallback(async () => {
        try {
            const { data } = await axios.post(`/api/quiz/${id}/start`);
            setQuiz(data.quiz);
            setSession(data.session);
            setQuestions(data.questions);

            // Initialize empty answers
            const initialAnswers = {};
            data.questions.forEach(q => {
                initialAnswers[q.id] = q.type === 'qcm' ? { option_id: null } : { text: '' };
            });
            setAnswers(initialAnswers);

            // Calculate time left based on started_at and duration
            const startedAt = new Date(data.session.started_at).getTime();
            const now = new Date().getTime();
            const elapsedMinutes = (now - startedAt) / 60000;
            const remainingMinutes = data.quiz.duration_minutes - elapsedMinutes;

            if (remainingMinutes > 0) {
                setTimeLeft(Math.floor(remainingMinutes * 60)); // in seconds
            } else {
                setTimeLeft(0);
                submitQuiz(); // Auto submit if time is already up
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors du démarrage du quiz');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        startQuiz();
    }, [startQuiz]);

    // Timer logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || !session || session.statut !== 'en_cours') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, session]);

    // Anti-cheat: Track visibility change and blur
    useEffect(() => {
        if (!session || session.statut !== 'en_cours' || questions.length === 0) return;

        let navigating = false;
        const handleCheat = async () => {
            if (navigating) return;
            navigating = true;
            try {
                const { data } = await axios.patch(`/api/quiz/session/${session.id}/tentative`);
                if (data.statut === 'bloque' || data.statut === 'soumis') {
                    setSession(prev => ({ ...prev, statut: data.statut }));
                    setWarning('Votre session a été verrouillée suite à de multiples sorties.');
                } else {
                    setWarning(`Attention: Vous avez quitté la page. Vous avez été déplacé à la question suivante. ${data.tentatives_restantes} tentatives restantes.`);
                    setTimeout(() => setWarning(''), 5000);
                    
                    setCurrentQuestionIndex(prev => {
                        const nextIndex = prev + 1;
                        if (nextIndex >= questions.length) {
                            if (latestSubmitQuiz.current) latestSubmitQuiz.current();
                            return prev;
                        }
                        return nextIndex;
                    });
                }
            } catch (e) {
                console.error('Anti-cheat error', e);
            }
            setTimeout(() => { navigating = false; }, 1000);
        };

        const onVisibilityChange = () => { if (document.hidden) handleCheat(); };
        const onBlur = () => { handleCheat(); };

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('blur', onBlur);
        };
    }, [session, questions.length]);

    const handleAnswerChange = (questionId, value, isQcm = true) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: isQcm ? { option_id: value } : { text: value }
        }));
    };

    const submitQuiz = async () => {
        if (!session) return;
        try {
            const { data } = await axios.post(`/api/quiz/session/${session.id}/submit`, { answers });
            setSession(prev => ({ ...prev, statut: 'soumis', score: data.score }));
            setWarning('');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de soumission');
        }
    };

    useEffect(() => {
        latestSubmitQuiz.current = submitQuiz;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;
    if (error) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-md w-full text-center">
                <h2 className="font-bold text-lg mb-2">Impossible de démarrer</h2>
                <p className="text-sm">{error}</p>
                <button onClick={() => navigate('/student')} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                    Retour au tableau de bord
                </button>
            </div>
        </div>
    );

    if (session?.statut === 'soumis') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-sm w-full text-center shadow-sm">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    ✓
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Quiz terminé</h1>
                <p className="text-slate-500 mb-6 text-sm">Vos réponses ont été enregistrées avec succès.</p>
                {session.score !== null && (
                    <div className="bg-slate-50 py-3 rounded-xl border border-slate-100 mb-6 font-semibold text-slate-700">
                        Score final: <span className="text-emerald-600 ml-1">{session.score} / {quiz.questions_count}</span>
                    </div>
                )}
                <button onClick={() => navigate('/student')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition">
                    Retour au tableau de bord
                </button>
            </div>
        </div>
    );

    if (session?.statut === 'bloque') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-sm w-full text-center shadow-sm">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    !
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Quiz Bloqué</h1>
                <p className="text-slate-500 mb-6 text-sm">Le quiz a été verrouillé suite au dépassement de la limite de tentatives autorisée.</p>
                <button onClick={() => navigate('/student')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition">
                    Retour au tableau de bord
                </button>
            </div>
        </div>
    );

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="font-bold text-slate-800 truncate max-w-xs">{quiz?.title}</h1>
                    <p className="text-xs text-slate-400">Question(s): {questions.length}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wider ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </header>

            {warning && (
                <div className="bg-red-50 text-red-700 p-3 text-center text-sm font-semibold border-b border-red-200 sticky top-[73px] z-10">
                    {warning}
                </div>
            )}

            <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
                {questions.length > 0 && (
                    <div key={questions[currentQuestionIndex].id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex gap-3 mb-6">
                            <span className="w-7 h-7 bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {currentQuestionIndex + 1}
                            </span>
                            <h3 className="text-slate-800 font-medium leading-relaxed">{questions[currentQuestionIndex].text}</h3>
                        </div>

                        {questions[currentQuestionIndex].type === 'qcm' ? (
                            <div className="space-y-3">
                                {questions[currentQuestionIndex].options.map((opt) => (
                                    <label key={opt.id} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${answers[questions[currentQuestionIndex].id]?.option_id === opt.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name={`question-${questions[currentQuestionIndex].id}`}
                                            value={opt.id}
                                            checked={answers[questions[currentQuestionIndex].id]?.option_id === opt.id}
                                            onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, opt.id, true)}
                                            className="w-4 h-4 text-slate-800 cursor-pointer"
                                        />
                                        <span className="font-bold text-slate-400 text-xs w-4">{opt.label}</span>
                                        <span className="text-sm text-slate-700">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                rows={4}
                                placeholder="Votre réponse ici..."
                                value={answers[questions[currentQuestionIndex].id]?.text || ''}
                                onChange={(e) => handleAnswerChange(questions[currentQuestionIndex].id, e.target.value, false)}
                                className="w-full p-4 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-slate-800 resize-y"
                            />
                        )}
                    </div>
                )}

                <div className="text-right pt-4 flex justify-end gap-3">
                    {questions.length > 0 && currentQuestionIndex < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition shadow-md"
                        >
                            Suivant
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir soumettre ? Vous ne pourrez plus modifier vos réponses.')) {
                                    submitQuiz();
                                }
                            }}
                            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-md"
                        >
                            Soumettre le quiz
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
