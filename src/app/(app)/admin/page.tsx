"use client";

import { useState, useEffect } from "react";
import { Users, Store, CreditCard, TrendingUp, ShieldAlert, CheckCircle, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  subscription_plan: string;
  stores_limit: number;
  status: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== "khadimdiene47@gmail.com") {
        router.push("/dashboard");
        return;
      }
      setIsAdmin(true);
      fetchProfiles();
    };

    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setProfiles(data);
      } else {
        // Fallback mock data since auth isn't fully wired for this demo
        setProfiles([
          { id: "1", full_name: "Ousmane Diallo", email: "ousmane@example.com", subscription_plan: "20000 FCFA", stores_limit: 999, status: "Actif", created_at: "2026-07-01T10:00:00Z" },
          { id: "2", full_name: "Awa Ndiaye", email: "awa@example.com", subscription_plan: "5000 FCFA", stores_limit: 2, status: "Actif", created_at: "2026-07-05T12:00:00Z" },
          { id: "3", full_name: "Tech Solutions", email: "contact@tech.sn", subscription_plan: "10000 FCFA", stores_limit: 5, status: "Suspendu", created_at: "2026-07-08T09:00:00Z" },
        ]);
      }
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (!isAdmin) {
    return <div className="p-8 text-center text-gray-500">Vérification des droits d'accès...</div>;
  }

  const kpis = [
    { title: "Utilisateurs Inscrits", value: profiles.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Boutiques Créées", value: 12, icon: Store, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "Abonnements Actifs", value: profiles.filter(p => p.status === "Actif" && p.subscription_plan !== "Gratuit").length, icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "MRR (Revenu Mensuel)", value: "35 000 FCFA", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const filteredProfiles = profiles.filter(p => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Actif" ? "Suspendu" : "Actif";
    // Optimistic UI update
    setProfiles(profiles.map(p => p.id === id ? { ...p, status: newStatus } : p));
    // Db update
    await supabase.from("profiles").update({ status: newStatus }).eq("id", id);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-sky-600" />
            Dashboard SaaS (Super Admin)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Supervisez l'activité de vos utilisateurs et gérez les abonnements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-gray-900">Comptes Utilisateurs</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un compte..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border-b border-gray-200">Utilisateur</th>
                <th className="py-3 px-4 border-b border-gray-200">Email</th>
                <th className="py-3 px-4 border-b border-gray-200">Abonnement</th>
                <th className="py-3 px-4 border-b border-gray-200">Boutiques max</th>
                <th className="py-3 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{profile.full_name}</td>
                  <td className="py-3 px-4">{profile.email}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded-md text-xs">{profile.subscription_plan}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{profile.stores_limit === 999 ? 'Illimité' : profile.stores_limit}</td>
                  <td className="py-3 px-4">
                    {profile.status === "Actif" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">
                        Suspendu
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => toggleStatus(profile.id, profile.status)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        profile.status === 'Actif' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      {profile.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun compte trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
