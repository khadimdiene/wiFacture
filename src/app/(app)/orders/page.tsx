"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Eye, Download, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  date: string;
  status: "Livré" | "En cours" | "Annulé";
}

const initialOrders: Order[] = [];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setOrders(data.map((o: any) => ({
          id: o.id,
          reference: o.reference,
          customer: o.customer,
          amount: o.amount,
          date: o.date,
          status: o.status,
        })));
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [createForm, setCreateForm] = useState({ customer: "", amount: "" });

  const filteredOrders = orders.filter(o => o.customer.toLowerCase().includes(search.toLowerCase()) || o.reference.toLowerCase().includes(search.toLowerCase()));

  const handleExport = (order: Order) => {
    const pdfWindow = window.open("", "_blank");
    if (pdfWindow) {
      pdfWindow.document.write(`<html><head><title>Bon de Commande ${order.reference}</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f3f4f6;"><h1>Aperçu PDF du bon de commande ${order.reference}</h1><p>Prêt à l'impression</p></body></html>`);
      setTimeout(() => pdfWindow.print(), 500);
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await supabase.from('orders').delete().eq('id', deleteTarget.id);
      setOrders(orders.filter(o => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleCreate = async () => {
    if (!createForm.customer || !createForm.amount) return;
    const newOrder = {
      reference: `BC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      customer: createForm.customer,
      amount: Number(createForm.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'En cours' as const,
    };
    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (!error && data) {
      setOrders([{ id: data.id, ...newOrder }, ...orders]);
      setCreateForm({ customer: "", amount: "" });
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Créer un bon de commande">
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <Input placeholder="Nom du client" value={createForm.customer} onChange={e => setCreateForm({ ...createForm, customer: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant Estimé (FCFA)</label>
            <Input type="number" placeholder="Ex: 150000" value={createForm.amount} onChange={e => setCreateForm({ ...createForm, amount: e.target.value })} />
          </div>
          <Button onClick={handleCreate} className="w-full bg-sky-600 hover:bg-sky-700">Enregistrer la commande</Button>
        </div>
      </Modal>

      <Modal isOpen={!!viewOrder} onClose={() => setViewOrder(null)} title={`Détail Commande: ${viewOrder?.reference}`}>
        {viewOrder && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-end gap-2 mb-4">
               <button onClick={() => handleExport(viewOrder)} className="px-4 py-2 bg-sky-50 text-sky-600 font-semibold text-sm rounded-lg hover:bg-sky-100 flex items-center gap-2">
                 <Download className="h-4 w-4" /> Télécharger PDF
               </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white p-8 text-center text-gray-500">
               Aperçu détaillé de la commande <strong>{viewOrder.reference}</strong> pour {viewOrder.customer}.<br/>
               Montant : {formatCurrency(viewOrder.amount)}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la commande"
        message={`Êtes-vous sûr de vouloir supprimer la commande ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-sky-500" />
          Bons de commande
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Nouvelle commande
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une commande..." 
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
                <th className="py-3 px-4 border-b border-gray-200">Client</th>
                <th className="py-3 px-4 border-b border-gray-200">Montant</th>
                <th className="py-3 px-4 border-b border-gray-200">Date</th>
                <th className="py-3 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="py-3 px-4 font-semibold text-gray-900">{order.reference}</td>
                    <td className="py-3 px-4 font-medium">{order.customer}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(order.amount)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(order.date)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Livré' ? 'bg-green-100 text-green-700' :
                        order.status === 'Annulé' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewOrder(order)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleExport(order)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-all">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(order)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucune commande trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
