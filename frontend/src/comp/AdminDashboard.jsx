import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, isEditing: false, userId: null });
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', password: '', role: 'Etudiant', class_id: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, classesRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/classes')
            ]);
            setUsers(usersRes.data);
            setClasses(classesRes.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des données', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const openAddModal = () => {
        setFormData({ nom: '', prenom: '', email: '', password: '', role: 'Etudiant', class_id: '' });
        setModalConfig({ isOpen: true, isEditing: false, userId: null });
    };

    const openEditModal = (targetUser) => {
        setFormData({
            nom: targetUser.nom,
            prenom: targetUser.prenom,
            email: targetUser.email,
            password: '', // Leave blank unless they want to change it
            role: targetUser.role,
            class_id: targetUser.etudiant?.class_id || ''
        });
        setModalConfig({ isOpen: true, isEditing: true, userId: targetUser.id });
    };

    const closeMenu = () => {
        setModalConfig({ ...modalConfig, isOpen: false });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            alert(e.response?.data?.message || 'Erreur lors de la suppression.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalConfig.isEditing) {
                // Pass everything except role.
                const updatePayload = {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email
                };
                if (formData.password) updatePayload.password = formData.password;

                const res = await axios.put(`/api/admin/users/${modalConfig.userId}`, updatePayload);
                setUsers(users.map(u => (u.id === modalConfig.userId ? res.data.user : u)));
            } else {
                const res = await axios.post('/api/admin/users', formData);
                setUsers([res.data.user, ...users]);
            }
            closeMenu();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de la sauvegarde.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-base font-bold text-slate-800">Espace Administrateur</h1>
                    <p className="text-xs text-slate-400">Bienvenue, {user?.prenom} {user?.nom}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={openAddModal}
                        className="py-2 px-4 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
                    >
                        + Nouvel Utilisateur
                    </button>
                    <button
                        onClick={handleLogout}
                        className="py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-bold text-slate-800">Gestion des utilisateurs</h2>
                        <div className="text-sm text-slate-500">
                            Total: <span className="font-semibold text-slate-700">{users.length}</span> utilisateurs
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                    <th className="py-4 px-6 font-semibold">Nom Complet</th>
                                    <th className="py-4 px-6 font-semibold">Email</th>
                                    <th className="py-4 px-6 font-semibold">Rôle</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Chargement...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="4" className="py-8 text-center text-slate-400">Aucun utilisateur trouvé</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-4 px-6 font-medium text-slate-800">{u.nom} {u.prenom}</td>
                                            <td className="py-4 px-6 text-slate-500">{u.email}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    u.role === 'Administrateur' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'Enseignant' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button 
                                                    onClick={() => openEditModal(u)}
                                                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition"
                                                >
                                                    Éditer
                                                </button>
                                                {u.role !== 'Administrateur' && (
                                                    <button 
                                                        onClick={() => handleDelete(u.id)}
                                                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* MODAL CREATE/EDIT USER */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {modalConfig.isEditing ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nom</label>
                                    <input required type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prénom</label>
                                    <input required type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full border rounded p-2" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded p-2" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Mot de passe {modalConfig.isEditing && <span className="text-gray-400 text-xs font-normal">(laisser vide pour ne pas modifier)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    required={!modalConfig.isEditing} 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                    className="w-full border rounded p-2" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Rôle</label>
                                <select 
                                    className="w-full border rounded p-2 bg-gray-50"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                    disabled={modalConfig.isEditing}
                                >
                                    <option value="Etudiant">Étudiant</option>
                                    <option value="Enseignant">Enseignant</option>
                                    {formData.role === 'Administrateur' && <option value="Administrateur">Administrateur</option>}
                                </select>
                                {modalConfig.isEditing && <p className="text-xs text-gray-500 mt-1">Le rôle ne peut pas être modifié après la création.</p>}
                            </div>

                            {/* SELECT CLASS CONSTRAINED STRICTLY FOR CREATION OF STUDENT */}
                            {!modalConfig.isEditing && formData.role === 'Etudiant' && (
                                <div>
                                    <label className="block text-sm font-bold mb-1 border-t pt-4 mt-2">
                                        Classe Associée (Requise)
                                    </label>
                                    <select 
                                        required 
                                        className="w-full border rounded p-2"
                                        value={formData.class_id}
                                        onChange={e => setFormData({...formData, class_id: e.target.value})}
                                    >
                                        <option value="">-- Sélectionnez une classe --</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={closeMenu} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Annuler</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
