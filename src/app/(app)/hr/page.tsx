"use client";

import { useState } from "react";
import { Users, Shield, Plus, Search, Edit2, Trash2, UserPlus, Crown, Eye, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type Role = "Administrateur" | "Comptable" | "Commercial" | "Logisticien" | "Lecture seule";

interface AppUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: "Actif" | "Inactif";
  avatar: string;
}

const ROLE_COLORS: Record<Role, string> = {
  "Administrateur": "bg-purple-100 text-purple-700",
  "Comptable": "bg-blue-100 text-blue-700",
  "Commercial": "bg-green-100 text-green-700",
  "Logisticien": "bg-amber-100 text-amber-700",
  "Lecture seule": "bg-gray-100 text-gray-600",
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  "Administrateur": ["Accès total à toutes les fonctionnalités", "Gestion des utilisateurs et rôles", "Paramètres du compte", "Export de données"],
  "Comptable": ["Accès à la comptabilité", "Lecture des factures et achats", "Génération de rapports", "Envoi au comptable"],
  "Commercial": ["Création et modification de factures", "Gestion des devis", "Accès au POS", "Gestion des contacts"],
  "Logisticien": ["Gestion des livraisons", "Accès à l'inventaire", "Suivi des commandes", "Lecture des achats"],
  "Lecture seule": ["Visualisation uniquement", "Aucune modification possible", "Export limité"],
};

const initialUsers: AppUser[] = [
  { id: "u1", name: "Emma Johnson", email: "design@opondoo.com", roles: ["Administrateur", "Commercial"], status: "Actif", avatar: "EJ" },
  { id: "u2", name: "Moussa Diallo", email: "moussa.diallo@wifacture.sn", roles: ["Commercial"], status: "Actif", avatar: "MD" },
  { id: "u3", name: "Fatou Sow", email: "fatou.sow@wifacture.sn", roles: ["Comptable"], status: "Actif", avatar: "FS" },
  { id: "u4", name: "Alioune Ba", email: "alioune.ba@wifacture.sn", roles: ["Logisticien"], status: "Inactif", avatar: "AB" },
];

export default function HRPage() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", roles: ["Lecture seule"] as Role[] });
  
  // Simulated subscription plan for demo purposes
  const currentPlan = "Gratuit"; 
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.roles.some(r => r.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleInviteRole = (role: Role) => {
    setInviteForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role) 
        : [...prev.roles, role]
    }));
  };

  const handleInvite = () => {
    if (inviteForm.roles.length === 0) return;

    if (currentPlan === "Gratuit" && users.length >= 1) {
      setShowUpgradeModal(true);
      setIsInviteModalOpen(false);
      return;
    }

    const newUser: AppUser = {
      id: Date.now().toString(),
      name: inviteForm.name || "Nouvel utilisateur",
      email: inviteForm.email || "user@exemple.sn",
      roles: inviteForm.roles,
      status: "Actif",
      avatar: (inviteForm.name || "NU").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    };
    setUsers([...users, newUser]);
    setIsInviteModalOpen(false);
    setInviteForm({ name: "", email: "", roles: ["Lecture seule"] });
  };

  const openEditModal = (user: AppUser) => {
    setEditUser(user);
    setSelectedRoles([...user.roles]);
  };

  const toggleEditRole = (role: Role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const saveEditRole = () => {
    if (editUser && selectedRoles.length > 0) {
      setUsers(users.map(u => u.id === editUser.id ? { ...u, roles: selectedRoles } : u));
      setEditUser(null);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Modal */}
      <Modal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Passez à la version supérieure">
        <div className="space-y-4 max-w-md mx-auto text-center py-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Limite d'utilisateurs atteinte</h3>
          <p className="text-gray-500">
            La formule <strong>Gratuite</strong> est limitée à 1 utilisateur. 
            Pour ajouter votre équipe, cette fonctionnalité est réservée aux versions payantes.
          </p>
          <div className="pt-4 border-t border-gray-100">
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-lg text-white" onClick={() => setShowUpgradeModal(false)}>
              Essayer Pro (15 jours gratuits)
            </Button>
            <p className="text-xs text-gray-400 mt-3">Dans 15 jours, la facturation s'activera.</p>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Inviter un utilisateur">
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <Input placeholder="Prénom Nom" value={inviteForm.name} onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <Input type="email" placeholder="email@entreprise.sn" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigner des rôles</label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {(Object.keys(ROLE_COLORS) as Role[]).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleInviteRole(role)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    inviteForm.roles.includes(role)
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-100 hover:border-sky-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>{role}</span>
                  </div>
                  {inviteForm.roles.includes(role) ? <CheckSquare className="h-5 w-5 text-sky-500" /> : <Square className="h-5 w-5 text-gray-300" />}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleInvite} disabled={inviteForm.roles.length === 0} className="w-full bg-sky-600 hover:bg-sky-700 gap-2">
            <UserPlus className="h-4 w-4" /> Envoyer l'invitation
          </Button>
        </div>
      </Modal>

      {/* Edit Roles Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title={`Modifier les rôles de ${editUser?.name}`}>
        <div className="space-y-3 max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-2">Sélectionnez un ou plusieurs rôles :</p>
          <div className="space-y-2 mb-4">
            {(Object.keys(ROLE_COLORS) as Role[]).map(role => (
              <button
                key={role}
                onClick={() => toggleEditRole(role)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedRoles.includes(role)
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-100 hover:border-sky-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>{role}</span>
                </div>
                {selectedRoles.includes(role) ? <CheckSquare className="h-5 w-5 text-sky-500" /> : <Square className="h-5 w-5 text-gray-300" />}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setEditUser(null)}>Annuler</Button>
            <Button onClick={saveEditRole} disabled={selectedRoles.length === 0}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      {/* View Role Permissions Modal */}
      <Modal isOpen={!!viewRole} onClose={() => setViewRole(null)} title={`Permissions: ${viewRole}`}>
        {viewRole && (
          <div className="max-w-md mx-auto space-y-4">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${ROLE_COLORS[viewRole]}`}>
              {viewRole}
            </div>
            <ul className="space-y-2">
              {ROLE_PERMISSIONS[viewRole].map((perm, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-sm text-gray-700">{perm}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Retirer l'utilisateur"
        message={`Êtes-vous sûr de vouloir retirer ${deleteTarget?.name} de l'application ?`}
        confirmLabel="Retirer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-sky-500" />
          Rôles & Utilisateurs
        </h1>
        <Button onClick={() => setIsInviteModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <UserPlus className="h-4 w-4" /> Inviter un utilisateur
        </Button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.keys(ROLE_COLORS) as Role[]).map(role => {
          const count = users.filter(u => u.roles.includes(role)).length;
          return (
            <button
              key={role}
              onClick={() => setViewRole(role)}
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group"
            >
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[role]}`}>{role}</span>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-xs text-gray-400 group-hover:text-sky-500 transition-colors mt-1">Voir permissions →</p>
            </button>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            Utilisateurs ({users.length})
          </h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border-b border-gray-200">Utilisateur</th>
                <th className="py-3 px-4 border-b border-gray-200">Email</th>
                <th className="py-3 px-4 border-b border-gray-200">Rôles</th>
                <th className="py-3 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {user.avatar}
                      </div>
                      <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map(r => (
                        <span key={r} className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${ROLE_COLORS[r]}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${user.status === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Actif' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(user)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-all" title="Modifier les rôles">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {user.email !== "design@opondoo.com" && (
                        <button onClick={() => setDeleteTarget(user)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all" title="Retirer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

