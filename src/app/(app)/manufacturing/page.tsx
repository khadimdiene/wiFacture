"use client";

import { useState } from "react";
import { Wrench, Plus, Search, CheckCircle, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";

interface ManufacturingOrder {
  id: string;
  reference: string;
  product: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: "planifié" | "en cours" | "terminé";
  progress: number;
}

export default function ManufacturingPage() {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [manageOrder, setManageOrder] = useState<ManufacturingOrder | null>(null);
  
  const [form, setForm] = useState({ product: "", quantity: "", endDate: "" });

  const filtered = orders.filter(o => 
    o.reference.toLowerCase().includes(search.toLowerCase()) || 
    o.product.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: ManufacturingOrder = {
      id: Date.now().toString(),
      reference: `OF-2026-00${orders.length + 1}`,
      product: form.product,
      quantity: Number(form.quantity),
      startDate: new Date().toISOString().split('T')[0],
      endDate: form.endDate,
      status: "planifié",
      progress: 0
    };
    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    setForm({ product: "", quantity: "", endDate: "" });
  };

  const handleUpdateProgress = (progress: number) => {
    if (manageOrder) {
      const status = progress === 100 ? "terminé" : progress === 0 ? "planifié" : "en cours";
      setOrders(orders.map(o => o.id === manageOrder.id ? { ...o, progress, status } : o));
      setManageOrder({ ...manageOrder, progress, status });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Modal Création */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nouvel Ordre de Fabrication">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product">Produit à fabriquer</Label>
            <Input id="product" required placeholder="Ex: Chaise Ergonomique" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" required placeholder="Ex: 50" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">Date de fin prévue</Label>
            <Input id="endDate" type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
            <Button type="submit">Créer l'OF</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestion */}
      <Modal isOpen={!!manageOrder} onClose={() => setManageOrder(null)} title="Gérer l'Ordre de Fabrication">
        {manageOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="font-bold text-gray-900">{manageOrder.reference}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  manageOrder.status === 'terminé' ? 'bg-green-100 text-green-700' :
                  manageOrder.status === 'en cours' ? 'bg-sky-100 text-sky-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {manageOrder.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Mettre à jour la progression</p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={manageOrder.progress} 
                  onChange={(e) => handleUpdateProgress(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <span className="font-bold text-gray-900 w-12 text-right">{manageOrder.progress}%</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="button" onClick={() => setManageOrder(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-sky-500" />
          Fabrication
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvel Ordre de Fabrication
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Planifiés</p>
            <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'planifié').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <PlayCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">En cours</p>
            <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'en cours').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Terminés</p>
            <p className="text-xl font-bold text-gray-900">{orders.filter(o => o.status === 'terminé').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher un ordre (OF)..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-5 border-b border-gray-200">Référence</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Produit</th>
                <th className="py-3.5 px-4 border-b border-gray-200 text-center">Quantité</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Dates</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Progression</th>
                <th className="py-3.5 px-5 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-sky-50/20 transition-colors">
                  <td className="py-4 px-5 font-semibold text-gray-900">{order.reference}</td>
                  <td className="py-4 px-4 font-medium text-gray-800">{order.product}</td>
                  <td className="py-4 px-4 text-center font-semibold">{order.quantity}</td>
                  <td className="py-4 px-4 text-xs text-gray-500">
                    Du {order.startDate} <br />au {order.endDate}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${order.progress === 100 ? 'bg-green-500' : 'bg-sky-500'}`} 
                          style={{ width: `${order.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 min-w-[32px]">{order.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button onClick={() => setManageOrder(order)} variant="outline" size="sm" className="text-xs">Gérer</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucun ordre trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
