import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import headerImg from '../../images/headerquiz.png';

export default function QuizResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`/api/quiz/${id}/results`);
                setData(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des résultats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Chargement...</div>;
    }

    if (!data) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Erreur lors du chargement des données.</div>;
    }

    const { quiz, results, academic_year, bareme } = data;

    return (
        <div className="bg-slate-50 min-h-screen pb-10">
            {/* NO-PRINT HEADER */}
            <header className="no-print bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/teacher')}
                        className="text-slate-500 hover:text-slate-800"
                    >
                        ← Retour
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-800">Résultats : {quiz.title}</h1>
                        <p className="text-xs text-slate-400">Classe: {quiz.classe} | Module: {quiz.module}</p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handlePrint}
                        className="py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                    >
                        🖨️ Imprimer les résultats
                    </button>
                </div>
            </header>

            {/* SCREEN VIEW */}
            <main className="no-print max-w-6xl mx-auto px-6 py-10">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Liste des étudiants</h2>
                        <div className="text-sm text-slate-500">
                            Total: <span className="font-semibold text-slate-700">{results.length}</span> soumissions
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                    <th className="py-4 px-6 font-semibold">Étudiant</th>
                                    <th className="py-4 px-6 font-semibold">Statut</th>
                                    <th className="py-4 px-6 font-semibold">Score</th>
                                    <th className="py-4 px-6 font-semibold">Durée</th>
                                    <th className="py-4 px-6 font-semibold">Tentatives</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-400">
                                            Aucun étudiant n'a encore pris ce quiz.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((res, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-6 font-medium text-slate-800">{res.etudiant}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    res.statut === 'soumis' ? 'bg-green-100 text-green-700' :
                                                    res.statut === 'bloque' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {res.statut}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-slate-800">{res.score}</span> / {res.qcm_total}
                                            </td>
                                            <td className="py-4 px-6 text-slate-500">{res.duree}</td>
                                            <td className="py-4 px-6 text-slate-500">{res.tentatives}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* PRINT VIEW */}
            <div className="print-only">
                {results.map((studentResult, idx) => (
                    <div key={idx} className="print-page pb-8 text-black">
                        {/* STATIC HEADER */}
                        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                            {/* <div className="flex-1"> */}
                                {/* Using provided image as OFPPT Logo */}
                                {/* <img src={headerImg} alt="OFPPT Logo" className="h-16 object-contain" /> */}
                            
                            {/* </div> */}
                            <div className="h-16 w-32 border-2 border-gray-800 flex items-center justify-center font-bold text-gray-600 bg-gray-100 uppercase text-xs">
                                    Logo CMC
                            </div>
                            <div className="flex-[2] text-center">
                                <h2 className="text-xl font-bold">Direction Régionale de Tanger-Tétouan-Al Hoceima</h2>
                            </div>
                            <div className="flex-1 flex justify-end">
                                {/* CMC Logo Placeholder / Box */}
                                <div className="h-16 w-32 border-2 border-gray-800 flex items-center justify-center font-bold text-gray-600 bg-gray-100 uppercase text-xs">
                                    Logo CMC
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC INFORMATION TABLE */}
                        {/* <div className="mb-6">
                            <table className="w-full border-collapse border border-black text-sm">
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100 w-1/3">Filière</td>
                                        <td className="border border-black p-2 w-2/3">{data.filiere}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Groupe</td>
                                        <td className="border border-black p-2">{quiz.classe}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Module</td>
                                        <td className="border border-black p-2">{quiz.module}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Niveau</td>
                                        <td className="border border-black p-2">{data.niveau}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Durée</td>
                                        <td className="border border-black p-2">{quiz.duration_minutes}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Année</td>
                                        <td className="border border-black p-2">{data.annee}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2 font-bold bg-gray-100">Barème</td>
                                        <td className="border border-black p-2">{bareme}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> */}
{/*  */}
<div className="mb-6">
  <table className="w-full border-collapse border border-black text-sm">
    <tbody>

      {/* Filière + Durée */}
      <tr>
        <td className="border border-black p font-bold w-1/5">Filière</td>
        <td className="border border-black p w-2/5">{data.filiere}</td>
        <td className="border border-black p font-bold w-1/5">Durée :</td>
        <td className="border border-black p w-1/5">{quiz.duration_minutes} min</td>
      </tr>

      {/* Groupe + Année */}
      <tr>
        <td className="border border-black p font-bold">Groupe</td>
        <td className="border border-black p">{quiz.classe}</td>
        <td className="border border-black p font-bold">Année :</td>
        <td className="border border-black p">{data.annee}</td>
      </tr>

      {/* Module (full width) */}
      <tr>
        <td className="border border-black p font-bold">Module</td>
        <td colSpan="3" className="border border-black p">
          {quiz.module}
        </td>
      </tr>

      {/* Niveau + Barème */}
      <tr>
        <td className="border border-black p font-bold">Niveau</td>
        <td className="border border-black p">{data.niveau}</td>
        <td className="border border-black p font-bold">Barème :</td>
        <td className="border border-black p">
          {bareme} /20
        </td>
      </tr>

      {/* Contrôle (center full row) */}
      <tr>
        <td colSpan="4" className="border border-black p text-center font-bold">
          Contrôle 1
        </td>
      </tr>

    </tbody>
  </table>
</div>


{/*  */}
                        {/* STUDENT RESULT SECTION */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Étudiant: <span className="font-normal underline decoration-dashed underline-offset-4">{studentResult.etudiant}</span></h3>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-bold text-lg">Score final: <span className="text-xl">{studentResult.score} / {bareme}</span></h3>
                                </div>
                            </div>
                            
                            {/* QUESTIONS & ANSWERS ONLY */}
                            <div className="columns-2 gap-x-8 text-sm print:text-xs leading-snug">
                                {quiz.questions.map((question, qIdx) => {
                                    const studentAns = studentResult.answers?.find(a => a.question_id === question.id);
                                    let answerText = "";

                                    if (question.type === 'qcm') {
                                        answerText = studentAns?.option ? studentAns.option.text : 'Aucune réponse';
                                    } else {
                                        answerText = studentAns?.answer_text || 'Aucune réponse';
                                    }

                                    return (
                                        <div key={qIdx} className="mb-3 break-inside-avoid">
                                            <span className="font-bold">Question {qIdx + 1}:</span> {question.text} <br/>
                                            {answerText}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {idx !== results.length - 1 && (
                            <div className="page-break-after"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
