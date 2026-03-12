import { useState, useRef } from "react";

const CLASSES = [
  { id: 1, name: "2ème Année Informatique" },
  { id: 2, name: "1ère Année Gestion" },
  { id: 3, name: "3ème Année Marketing" },
];

const MODULES = [
  { id: 1, name: "Français" },
  { id: 2, name: "Mathématiques" },
  { id: 3, name: "Informatique" },
];

function generateId() {
  return Date.now() + Math.random();
}

function emptyQuestion(type = "qcm") {
  return {
    id: generateId(),
    type,
    text: "",
    options: type === "qcm" ? ["", "", "", ""] : [],
    correct: 0,
  };
}

function StepHeader({ step, current, label }) {
  const done   = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
        done   ? "bg-slate-800 border-slate-800 text-white" :
        active ? "bg-white border-slate-800 text-slate-800" :
                 "bg-transparent border-slate-300 text-slate-400"
      }`}>
        {done ? "✓" : step}
      </div>
      <span className={`text-sm font-medium ${
        active ? "text-slate-800" : done ? "text-slate-500" : "text-slate-400"
      }`}>{label}</span>
    </div>
  );
}

function FormatInfo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
        <span className="font-medium">Format CSV / JSON attendu</span>
        <span className="text-slate-400 text-xs">{open ? "Masquer ▲" : "Afficher ▼"}</span>
      </button>
      {open && (
        <div className="px-4 py-4 bg-white border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1">CSV</p>
            <code className="block text-xs text-emerald-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded font-mono">
              type,text,optionA,optionB,optionC,optionD,correct(0-3)
            </code>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1">JSON</p>
            <code className="block text-xs text-emerald-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded font-mono break-all">
              {`[{"type":"qcm","text":"...","options":["A","B","C","D"],"correct":0}]`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}

function QCMQuestionCard({ q, index, onChange, onDelete }) {
  const updateOption = (i, val) => {
    const opts = [...q.options];
    opts[i] = val;
    onChange({ ...q, options: opts });
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 group shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Choix multiple</span>
        </div>
        <button type="button" onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-sm text-slate-400 hover:text-red-500 transition-all font-medium">
          Supprimer
        </button>
      </div>

      <input type="text" value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
        placeholder="Rédigez votre question..."
        className="w-full border-b-2 border-slate-200 focus:border-slate-800 bg-transparent py-2 text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-colors mb-5 font-medium" />

      <div className="space-y-2">
        {q.options.map((opt, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
            q.correct === i ? "border-slate-800 bg-slate-50" : "border-slate-200 hover:border-slate-300"
          }`}>
            <button type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onChange({ ...q, correct: i }); }}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                q.correct === i ? "border-slate-800 bg-slate-800" : "border-slate-300 hover:border-slate-600"
              }`}>
              {q.correct === i && <div className="w-2 h-2 rounded-full bg-white" />}
            </button>
            <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + i)}</span>
            <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + i)}`}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none" />
            {q.correct === i && <span className="text-xs text-slate-500 font-semibold">Correcte</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextQuestionCard({ q, index, onChange, onDelete }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 group shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Réponse libre</span>
        </div>
        <button type="button" onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-sm text-slate-400 hover:text-red-500 transition-all font-medium">
          Supprimer
        </button>
      </div>
      <input type="text" value={q.text} onChange={e => onChange({ ...q, text: e.target.value })}
        placeholder="Rédigez votre question..."
        className="w-full border-b-2 border-slate-200 focus:border-slate-800 bg-transparent py-2 text-slate-800 text-sm placeholder-slate-400 focus:outline-none transition-colors mb-5 font-medium" />
      <div className="border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-400 italic">
        L'étudiant saisira sa réponse librement
      </div>
    </div>
  );
}

const inputCls  = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-slate-800 transition-colors placeholder-slate-400";
const selectCls = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-slate-800 transition-colors appearance-none cursor-pointer";

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function CreateQuizPage() {
  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState({ title:"", class_id:"", module_id:"", duration:30, max_tentatives:2, questions_count:10 });
  const [questions, setQuestions]     = useState([]);
  const [uploadError, setUploadError] = useState("");
  const [published, setPublished]     = useState(false);
  const fileRef = useRef();

  const updateForm     = (k, v)    => setForm(p => ({ ...p, [k]: v }));
  const addQuestion    = (type)    => setQuestions(p => [emptyQuestion(type), ...p]);
  const updateQuestion = (id, d)   => setQuestions(p => p.map(q => q.id === id ? d : q));
  const deleteQuestion = (id)      => setQuestions(p => p.filter(q => q.id !== id));

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    // 🕸 HADD " new FileReader() " ASADI9I KANSTA3MLOHA BAX : 
    //          -   
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(ev.target.result);
          setQuestions(p => [...p, ...data.map(q => ({ ...q, id: generateId() }))]);
        } else if (file.name.endsWith(".csv")) {
          const lines = ev.target.result.trim().split("\n").slice(1);
          setQuestions(p => [...p, ...lines.map(line => {
            const [type, text, a, b, c, d, correct] = line.split(",");
            return { id: generateId(), type: type?.trim()||"qcm", text: text?.trim()||"",
              options: [a,b,c,d].map(o => o?.trim()||""), correct: parseInt(correct?.trim()||"0") };
          })]);
        } else {
          setUploadError("Format non supporté. Utilisez JSON ou CSV.");
        }
      } catch { setUploadError("Fichier invalide. Vérifiez le format."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const step1Valid = form.title.trim() && form.class_id && form.module_id && form.duration > 0;
  const step2Valid = questions.length > 0;
  const publier    = () => { console.log("Publié:", { ...form, questions }); setPublished(true); };
  const reset      = () => { setPublished(false); setStep(1); setForm({ title:"", class_id:"", module_id:"", duration:30, max_tentatives:2, questions_count:10 }); setQuestions([]); };

  if (published) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-sm w-full shadow-sm">
        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Quiz publié</h1>
        <p className="text-sm text-slate-500 mb-8">
          Notification envoyée à{" "}
          <span className="font-semibold text-slate-700">{CLASSES.find(c => c.id == form.class_id)?.name}</span>
        </p>
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-8">
          {[["Titre", form.title], ["Durée", `${form.duration} min`], ["Questions/étudiant", `${form.questions_count} / ${questions.length}`]].map(([k,v]) => (
            <div key={k} className="flex justify-between px-4 py-3 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-500">{k}</span>
              <span className="text-xs font-semibold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={reset} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors">
          Nouveau quiz
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">Création d'un quiz</h1>
            <p className="text-xs text-slate-400">Configurez et publiez votre évaluation</p>
          </div>
          <div className="flex items-center gap-3">
            <StepHeader step={1} current={step} label="Paramètres" />
            <div className="w-8 h-px bg-slate-300" />
            <StepHeader step={2} current={step} label="Questions" />
            <div className="w-8 h-px bg-slate-300" />
            <StepHeader step={3} current={step} label="Révision" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
    {/* LES STEEPS KIMXIW BHAD LAMANIER IDA KAN KISAWI WA7D AFFICHIER FORMULE IDA KAN KISAWI 2 AFICHIER ...  */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Paramètres du quiz</h2>
              <p className="text-sm text-slate-500 mt-1">Définissez les informations générales de l'évaluation</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
              <Field label="Intitulé">
                <input type="text" value={form.title} onChange={e => updateForm("title", e.target.value)}
                  placeholder="Ex : Évaluation de Français — Semestre 1" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Classe">
                  <select value={form.class_id} onChange={e => updateForm("class_id", e.target.value)} className={selectCls}>
                    <option value="">Sélectionner...</option>
                    {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Module">
                  <select value={form.module_id} onChange={e => updateForm("module_id", e.target.value)} className={selectCls}>
                    <option value="">Sélectionner...</option>
                    {MODULES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Durée" hint="minutes">
                  <input type="number" min={1} max={300} value={form.duration}
                    onChange={e => updateForm("duration", parseInt(e.target.value)||1)} className={inputCls} />
                </Field>
                <Field label="Tentatives" hint="max">
                  <input type="number" min={1} max={10} value={form.max_tentatives}
                    onChange={e => updateForm("max_tentatives", parseInt(e.target.value)||1)} className={inputCls} />
                </Field>
                <Field label="Questions" hint="par étudiant">
                  <input type="number" min={1} value={form.questions_count}
                    onChange={e => updateForm("questions_count", parseInt(e.target.value)||1)} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="flex items-start gap-3 border border-slate-200 bg-white rounded-xl px-5 py-4">
              <span className="text-slate-400 font-bold text-sm mt-0.5">i</span>
              <p className="text-sm text-slate-600 leading-relaxed">
                La soumission est automatique à l'expiration du temps ou au dépassement des tentatives autorisées.
              </p>
            </div>

            <button disabled={!step1Valid} onClick={() => setStep(2)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Banque de questions</h2>
                <p className="text-sm text-slate-500 mt-1">{questions.length} question{questions.length !== 1 ? "s" : ""} ajoutée{questions.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800 transition-colors mt-1">← Retour</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={() => addQuestion("qcm")}
                className="py-4 bg-white border border-slate-200 hover:border-slate-800 rounded-xl text-sm font-medium text-slate-700 transition-all hover:shadow-sm">
                Choix multiple
              </button>
              <button type="button" onClick={() => addQuestion("texte")}
                className="py-4 bg-white border border-slate-200 hover:border-slate-800 rounded-xl text-sm font-medium text-slate-700 transition-all hover:shadow-sm">
                Réponse libre
              </button>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="py-4 bg-white border border-slate-200 hover:border-slate-800 rounded-xl text-sm font-medium text-slate-700 transition-all hover:shadow-sm">
                Import CSV / JSON
              </button>
              <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleUpload} className="hidden" />
            </div>

            {uploadError && (
              <div className="border border-red-200 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-600">{uploadError}</div>
            )}

            <FormatInfo />

            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-sm">Aucune question ajoutée</p>
                  <p className="text-slate-300 text-xs mt-1">Utilisez les boutons ci-dessus pour commencer</p>
                </div>
              ) : questions.map((q, i) =>
                q.type === "qcm"
                  ? <QCMQuestionCard key={q.id} q={q} index={i} onChange={d => updateQuestion(q.id, d)} onDelete={() => deleteQuestion(q.id)} />
                  : <TextQuestionCard key={q.id} q={q} index={i} onChange={d => updateQuestion(q.id, d)} onDelete={() => deleteQuestion(q.id)} />
              )}
            </div>

            <button disabled={!step2Valid} onClick={() => setStep(3)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              Continuer
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Récapitulatif</h2>
                <p className="text-sm text-slate-500 mt-1">Vérifiez avant publication</p>
              </div>
              <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-slate-800 transition-colors mt-1">← Modifier</button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Paramètres</p>
              </div>
              {[
                ["Intitulé", form.title],
                ["Classe", CLASSES.find(c => c.id == form.class_id)?.name],
                ["Module", MODULES.find(m => m.id == form.module_id)?.name],
                ["Durée", `${form.duration} minutes`],
                ["Tentatives max", form.max_tentatives],
                ["Questions / étudiant", `${form.questions_count} sur ${questions.length}`],
                ["Soumission", "Automatique"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center px-6 py-3.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Questions</p>
                <span className="text-xs text-slate-400">{questions.length} au total</span>
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center gap-4 px-6 py-3">
                    <span className="text-xs text-slate-400 w-5 flex-shrink-0 font-medium">{i+1}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium flex-shrink-0">
                      {q.type === "qcm" ? "QCM" : "Libre"}
                    </span>
                    <p className="text-sm text-slate-600 truncate">
                      {q.text || <span className="italic text-slate-400">Question vide</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 border border-slate-200 bg-white rounded-xl px-5 py-4">
              <span className="text-slate-400 font-bold text-sm mt-0.5">i</span>
              <p className="text-sm text-slate-600">
                La publication enverra une notification à tous les étudiants de la classe sélectionnée.
              </p>
            </div>

            <button onClick={publier}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors">
              Publier le quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}