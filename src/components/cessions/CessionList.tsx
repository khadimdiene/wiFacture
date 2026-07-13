"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Plus, Search, Edit2, Trash2, Repeat, CheckCircle, Smartphone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function CessionList() {
  const [cessions, setCessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCession, setEditingCession] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    client_id: "",
    item_name: "",
    quantity: 1,
    unit_price: 0,
    status: "En cours",
  });

  useEffect(() => {
    const fetchData = async () => {
      const [cessionsRes, clientsRes] = await Promise.all([
        supabase.from("consignments").select(`*, client:clients(name)`).order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name")
      ]);
      if (cessionsRes.data) setCessions(cessionsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredCessions = cessions.filter(c =>
    c.item_name.toLowerCase().includes(search.toLowerCase()) ||
    c.reference.toLowerCase().includes(search.toLowerCase()) ||
    (c.client?.name && c.client.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (cession?: any) => {
    if (cession) {
      setEditingCession(cession);
      setFormData({
        client_id: cession.client_id || "",
        item_name: cession.item_name,
        quantity: cession.quantity,
        unit_price: cession.unit_price,
        status: cession.status,
      });
    } else {
      setEditingCession(null);
      setFormData({
        client_id: "",
        item_name: "",
        quantity: 1,
        unit_price: 0,
        status: "En cours",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const total_amount = formData.quantity * formData.unit_price;

    if (editingCession) {
      const payload = { ...formData, total_amount };
      const { data, error } = await supabase.from("consignments").update(payload).eq("id", editingCession.id).select(`*, client:clients(name)`).single();
      if (!error && data) {
        setCessions(cessions.map(c => c.id === editingCession.id ? data : c));
      }
    } else {
      const payload = {
        ...formData,
        reference: `CES-${Date.now().toString().slice(-5)}`,
        total_amount,
        paid_amount: 0
      };
      const { data, error } = await supabase.from("consignments").insert([payload]).select(`*, client:clients(name)`).single();
      if (!error && data) {
        setCessions([data, ...cessions]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await supabase.from("consignments").delete().eq("id", deleteTarget.id);
      setCessions(cessions.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget || !paymentAmount) return;

    const newPaidAmount = (paymentTarget.paid_amount || 0) + Number(paymentAmount);
    // If fully paid, auto update status to 'Vendu'
    const newStatus = newPaidAmount >= paymentTarget.total_amount ? "Vendu" : paymentTarget.status;

    const { data, error } = await supabase.from("consignments").update({
      paid_amount: newPaidAmount,
      status: newStatus
    }).eq("id", paymentTarget.id).select(`*, client:clients(name)`).single();

    if (!error && data) {
      setCessions(cessions.map(c => c.id === paymentTarget.id ? data : c));
    }
    setPaymentTarget(null);
    setPaymentAmount("");
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { data, error } = await supabase.from("consignments").update({ status: newStatus }).eq("id", id).select(`*, client:clients(name)`).single();
    if (!error && data) {
      setCessions(cessions.map(c => c.id === id ? data : c));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En cours": return <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">En cours</span>;
      case "Vendu": return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium border border-green-200">Vendu</span>;
      case "Retourné": return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">Retourné</span>;
      default: return <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la cession"
        message={`Êtes-vous sûr de vouloir supprimer la cession ${deleteTarget?.reference} ? Cette action est irréversible.`}
        confirmLabel="Oui, Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Payment Modal */}
      <Modal isOpen={!!paymentTarget} onClose={() => setPaymentTarget(null)} title={`Nouveau Versement - ${paymentTarget?.reference}`}>
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-gray-900">{formatCurrency(paymentTarget?.total_amount || 0)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Déjà payé:</span>
              <span className="font-bold text-green-600">{formatCurrency(paymentTarget?.paid_amount || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-sky-200 mt-2">
              <span className="font-semibold">Reste à payer:</span>
              <span className="font-bold text-red-600">{formatCurrency((paymentTarget?.total_amount || 0) - (paymentTarget?.paid_amount || 0))}</span>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="payment">Montant du versement (FCFA)</Label>
            <Input 
              id="payment" 
              type="number" 
              required 
              min="1" 
              max={(paymentTarget?.total_amount || 0) - (paymentTarget?.paid_amount || 0)}
              value={paymentAmount} 
              onChange={e => setPaymentAmount(Number(e.target.value))} 
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPaymentTarget(null)}>Annuler</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">Valider le paiement</Button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Repeat className="h-6 w-6 text-sky-500" />
          Cessions & Dépôts
          <span className="text-sm font-normal text-gray-500 ml-1">({filteredCessions.length})</span>
        </h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle Cession
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher par référence, produit, ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border-b border-gray-200">Réf / Produit</th>
                <th className="py-3 px-4 border-b border-gray-200">Bénéficiaire (Client)</th>
                <th className="py-3 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Montant Total</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Reste à Payer</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCessions.map((cession) => {
                const restToPay = cession.total_amount - cession.paid_amount;
                return (
                  <tr key={cession.id} className="hover:bg-sky-50/50 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{cession.reference}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3" /> {cession.item_name} (x{cession.quantity})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{cession.client?.name || 'Inconnu'}</div>
                      <div className="text-xs text-gray-500">{formatDate(cession.created_at)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        value={cession.status}
                        onChange={(e) => handleStatusChange(cession.id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 cursor-pointer border ${
                          cession.status === 'Vendu' ? 'bg-green-50 text-green-700 border-green-200' : 
                          cession.status === 'Retourné' ? 'bg-gray-50 text-gray-700 border-gray-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="En cours">En cours</option>
                        <option value="Vendu">Vendu</option>
                        <option value="Retourné">Retourné</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-medium">{formatCurrency(cession.total_amount)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`font-bold ${restToPay > 0 && cession.status !== 'Retourné' ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(restToPay)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Payé: {formatCurrency(cession.paid_amount)}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {cession.status === 'En cours' && restToPay > 0 && (
                          <button 
                            onClick={() => setPaymentTarget(cession)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Ajouter un versement"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenModal(cession)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteTarget(cession)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune cession trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCession ? "Modifier la cession" : "Nouvelle Cession (Dépôt-vente)"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client_id">Bénéficiaire (Client) <span className="text-red-500">*</span></Label>
            <select 
              id="client_id" 
              required
              value={formData.client_id} 
              onChange={e => setFormData({ ...formData, client_id: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
            >
              <option value="">Sélectionner un contact...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="item_name">Produit confié <span className="text-red-500">*</span></Label>
            <Input id="item_name" placeholder="Ex: iPhone 13 Pro Max" required value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantité</Label>
              <Input id="quantity" type="number" min="1" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit_price">Prix Unitaire (FCFA)</Label>
              <Input id="unit_price" type="number" min="0" required value={formData.unit_price} onChange={e => setFormData({ ...formData, unit_price: Number(e.target.value) })} />
            </div>
          </div>
          
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-100 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Total Estimé:</span>
              <span className="text-lg font-bold text-sky-600">{formatCurrency(formData.quantity * formData.unit_price)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
