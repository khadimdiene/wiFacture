"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Search, Filter, MoreVertical, Eye, Download, CheckCircle, TrendingDown, Clock, Package, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Purchase {
  id: string;
  reference: string;
  supplier: string;
  item_name?: string;
  quantity?: number;
  unit?: string;
  date: string;
  amount: number;
  status: "reçue" | "en attente" | "annulée";
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setPurchases(data);
      setLoading(false);
    };
    fetchPurchases();
  }, []);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [showDownloadToast, setShowDownloadToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = null; // placeholder for click-outside (future use)

  const confirmDelete = async () => {
    if (deleteTarget) {
      await supabase.from('purchases').delete().eq('id', deleteTarget.id);
      setPurchases(purchases.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  // Form state
  const [form, setForm] = useState({ supplier: "", item_name: "", quantity: 1, unit: "Pièce", amount: "", status: "en attente" as const });
  const [editForm, setEditForm] = useState({ supplier: "", item_name: "", quantity: 1, unit: "Pièce", amount: "", status: "en attente" as Purchase["status"] });

  const filteredPurchases = purchases.filter(p => 
    p.reference.toLowerCase().includes(search.toLowerCase()) || 
    p.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (purchase: Purchase) => {
    setOpenDropdownId(null);
    setShowDownloadToast(true);
    setTimeout(() => setShowDownloadToast(false), 3000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPurchase = {
      reference: `ACH-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`,
      supplier: form.supplier,
      item_name: form.item_name,
      quantity: form.quantity,
      unit: form.unit,
      date: new Date().toISOString().split('T')[0],
      amount: Number(form.amount),
      status: form.status,
    };
    const { data, error } = await supabase.from('purchases').insert([newPurchase]).select().single();
    if (error) {
      if (error.code === '23505') {
        alert("Erreur : Cette référence existe déjà. Veuillez éviter les doublons ou réessayer.");
      } else {
        alert("Une erreur est survenue lors de l'enregistrement.");
      }
    } else if (data) {
      setPurchases([{ id: data.id, ...newPurchase }, ...purchases]);
      setIsCreateModalOpen(false);
      setForm({ supplier: "", item_name: "", quantity: 1, unit: "Pièce", amount: "", status: "en attente" });
    }
  };

  const openEditModal = (purchase: Purchase) => {
    setEditPurchase(purchase);
    setEditForm({ supplier: purchase.supplier, item_name: purchase.item_name || "", quantity: purchase.quantity || 1, unit: purchase.unit || "Pièce", amount: String(purchase.amount), status: purchase.status });
    setOpenDropdownId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPurchase) {
      const { data, error } = await supabase.from('purchases').update({
        ...editForm,
        amount: Number(editForm.amount)
      }).eq('id', editPurchase.id).select().single();
      
      if (!error && data) {
        setPurchases(purchases.map(p => p.id === editPurchase.id ? { ...p, ...data } : p));
        setEditPurchase(null);
      }
    }
  };

  const changeStatus = async (id: string, newStatus: Purchase["status"]) => {
    const { error } = await supabase.from('purchases').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setPurchases(purchases.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  return (
    <div className="space-y-6 pb-10 relative">
      {/* Toast de téléchargement */}
      {showDownloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <Download className="h-5 w-5 text-sky-400" />
          <span className="font-semibold text-sm">Le PDF a été téléchargé !</span>
        </div>
      )}

      {/* Modal de Création */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nouvel achat">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplier">Fournisseur</Label>
            <Input id="supplier" required placeholder="Nom du fournisseur" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Montant TTC (FCFA)</Label>
            <Input id="amount" type="number" required placeholder="Ex: 500000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Statut de la commande</Label>
            <Select id="status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
              <option value="en attente">En attente de réception</option>
              <option value="reçue">Reçue</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer l'achat</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualisation */}
      <Modal isOpen={!!viewPurchase} onClose={() => setViewPurchase(null)} title="Détails de l'achat">
        {viewPurchase && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="font-bold text-gray-900">{viewPurchase.reference}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold 
                  ${viewPurchase.status === 'reçue' ? 'bg-green-100 text-green-800' : 
                    viewPurchase.status === 'en attente' ? 'bg-amber-100 text-amber-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {viewPurchase.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Fournisseur</p>
                <p className="font-medium text-gray-900">{viewPurchase.supplier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de commande</p>
                <p className="font-medium text-gray-900">{formatDate(viewPurchase.date)}</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Montant Total</p>
              <p className="font-bold text-lg text-sky-600">{formatCurrency(viewPurchase.amount)}</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer l'achat"
        message={`Êtes-vous sûr de vouloir supprimer l'achat ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-sky-500" />
          Achats & Dépenses
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Nouvel achat
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 text-sky-500 rounded-lg">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dépenses (Mois)</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(6560000)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En attente</p>
            <h3 className="text-xl font-bold text-gray-900">4</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-500 rounded-lg">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Commandes reçues</p>
            <h3 className="text-xl font-bold text-gray-900">12</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher un fournisseur ou une référence..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border-b border-gray-200">Référence</th>
                <th className="py-3 px-4 border-b border-gray-200">Produit & Qté</th>
                <th className="py-3 px-4 border-b border-gray-200">Fournisseur</th>
                <th className="py-3 px-4 border-b border-gray-200">Montant</th>
                <th className="py-3 px-4 border-b border-gray-200">Date</th>
                <th className="py-3 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="py-3 px-4 font-semibold text-gray-900">{purchase.reference}</td>
                    <td className="py-3 px-4">
                      {purchase.item_name ? (
                        <>
                          <div className="font-medium text-gray-900">{purchase.item_name}</div>
                          <div className="text-xs text-gray-500">{purchase.quantity} {purchase.unit}(s)</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Non spécifié</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{purchase.supplier}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(purchase.amount)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(purchase.date)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={purchase.status}
                        onChange={(e) => changeStatus(purchase.id, e.target.value as Purchase["status"])}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 cursor-pointer border ${
                          purchase.status === 'reçue' ? 'bg-green-50 text-green-700 border-green-200' :
                          purchase.status === 'annulée' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="en attente">En attente</option>
                        <option value="reçue">Reçue</option>
                        <option value="annulée">Annulée</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewPurchase(purchase)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <div className="relative" ref={openDropdownId === purchase.id ? dropdownRef : null}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === purchase.id ? null : purchase.id); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
                            title="Plus d'options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {openDropdownId === purchase.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                              <button onClick={() => { setOpenDropdownId(null); setEditPurchase(purchase); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium">
                                <Edit2 className="h-4 w-4 text-gray-400" /> Modifier
                              </button>
                              <button onClick={() => handleExport(purchase)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium">
                                <Download className="h-4 w-4 text-gray-400" /> Télécharger
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button onClick={() => { setOpenDropdownId(null); setDeleteTarget(purchase); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium">
                                <Trash2 className="h-4 w-4" /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun achat ou dépense trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
