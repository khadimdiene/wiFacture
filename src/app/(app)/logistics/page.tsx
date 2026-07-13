"use client";

import { useState, useEffect } from "react";
import { Truck, Search, MapPin, Package, Clock, CheckCircle, Edit2, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface Delivery {
  id: string;
  reference: string;
  customer: string;
  address: string;
  status: "en préparation" | "en transit" | "livré";
  driver: string;
  expectedDate: string;
}

export default function LogisticsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setDeliveries(data.map((d: any) => ({
          id: d.id,
          reference: d.reference,
          customer: d.customer,
          address: d.address ?? '',
          status: d.status,
          driver: d.driver,
          expectedDate: d.expected_date ?? '',
        })));
      }
      setLoading(false);
    };
    fetchDeliveries();
  }, []);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewDelivery, setViewDelivery] = useState<Delivery | null>(null);
  const [editDelivery, setEditDelivery] = useState<Delivery | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Delivery | null>(null);

  const [form, setForm] = useState({ customer: "", address: "", expectedDate: undefined as Date | undefined });
  const [editForm, setEditForm] = useState({ customer: "", address: "", expectedDate: undefined as Date | undefined, status: "en préparation" as Delivery["status"], driver: "" });

  const filtered = deliveries.filter(d => 
    d.reference.toLowerCase().includes(search.toLowerCase()) || 
    d.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newDelivery = {
      reference: `LIV-${String(deliveries.length + 1).padStart(3, '0')}`,
      customer: form.customer,
      address: form.address,
      status: 'en préparation' as const,
      driver: 'Non assigné',
      expected_date: form.expectedDate ? format(form.expectedDate, 'yyyy-MM-dd') : null,
    };
    const { data, error } = await supabase.from('deliveries').insert([newDelivery]).select().single();
    if (!error && data) {
      setDeliveries([{ id: data.id, reference: newDelivery.reference, customer: form.customer, address: form.address, status: 'en préparation', driver: 'Non assigné', expectedDate: newDelivery.expected_date || '' }, ...deliveries]);
      setIsCreateModalOpen(false);
      setForm({ customer: "", address: "", expectedDate: undefined });
    }
  };

  const openEditModal = (delivery: Delivery) => {
    setEditForm({
      customer: delivery.customer,
      address: delivery.address,
      expectedDate: delivery.expectedDate ? new Date(delivery.expectedDate) : undefined,
      status: delivery.status,
      driver: delivery.driver
    });
    setEditDelivery(delivery);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editDelivery) {
      const formattedDate = editForm.expectedDate ? format(editForm.expectedDate, 'yyyy-MM-dd') : null;
      await supabase.from('deliveries').update({
        customer: editForm.customer,
        address: editForm.address,
        expected_date: formattedDate,
        status: editForm.status,
        driver: editForm.driver,
      }).eq('id', editDelivery.id);
      setDeliveries(deliveries.map(d => d.id === editDelivery.id ? { 
        ...d, 
        customer: editForm.customer, 
        address: editForm.address, 
        expectedDate: formattedDate || '',
        status: editForm.status,
        driver: editForm.driver
      } : d));
      setEditDelivery(null);
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await supabase.from('deliveries').delete().eq('id', deleteTarget.id);
      setDeliveries(deliveries.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Modal de Création */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nouvelle Expédition">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer">Client</Label>
            <Input id="customer" required placeholder="Nom du client" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse de livraison</Label>
            <Input id="address" required placeholder="Quartier, Ville" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Date de livraison prévue</Label>
            <DatePicker
              date={form.expectedDate}
              setDate={(d) => setForm({ ...form, expectedDate: d })}
              placeholder="Choisir une date"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
            <Button type="submit">Créer l'expédition</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edition */}
      <Modal isOpen={!!editDelivery} onClose={() => setEditDelivery(null)} title={`Modifier Expédition: ${editDelivery?.reference}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editCustomer">Client</Label>
            <Input id="editCustomer" required value={editForm.customer} onChange={e => setEditForm({ ...editForm, customer: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editAddress">Adresse de livraison</Label>
            <Input id="editAddress" required value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editDriver">Chauffeur Assigné</Label>
            <Input id="editDriver" required value={editForm.driver} onChange={e => setEditForm({ ...editForm, driver: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editStatus">Statut</Label>
            <select id="editStatus" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as Delivery["status"] })} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
              <option value="en préparation">En préparation</option>
              <option value="en transit">En transit</option>
              <option value="livré">Livré</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Date de livraison prévue</Label>
            <DatePicker
              date={editForm.expectedDate}
              setDate={(d) => setEditForm({ ...editForm, expectedDate: d })}
              placeholder="Choisir une date"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setEditDelivery(null)}>Annuler</Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualisation */}
      <Modal isOpen={!!viewDelivery} onClose={() => setViewDelivery(null)} title="Détails de l'expédition">
        {viewDelivery && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="font-bold text-gray-900">{viewDelivery.reference}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold 
                  ${viewDelivery.status === 'livré' ? 'bg-green-100 text-green-700' : 
                    viewDelivery.status === 'en transit' ? 'bg-sky-100 text-sky-700' : 
                    'bg-amber-100 text-amber-700'}`}>
                  {viewDelivery.status === 'livré' && <CheckCircle className="h-3 w-3" />}
                  {viewDelivery.status === 'en transit' && <Truck className="h-3 w-3" />}
                  {viewDelivery.status === 'en préparation' && <Clock className="h-3 w-3" />}
                  <span className="capitalize">{viewDelivery.status}</span>
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium text-gray-900">{viewDelivery.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date prévue</p>
                <p className="font-medium text-gray-900">{viewDelivery.expectedDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Adresse de livraison</p>
                <p className="font-medium text-gray-900 flex items-center gap-1"><MapPin className="h-4 w-4" /> {viewDelivery.address}</p>
              </div>
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Chauffeur assigné</p>
                <p className="font-medium text-gray-900">{viewDelivery.driver}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="button" onClick={() => setViewDelivery(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Truck className="h-6 w-6 text-sky-500" />
          Logistique & Livraisons
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <Package className="h-4 w-4" /> Nouvelle Expédition
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">En Transit</p>
          <p className="text-2xl font-bold text-sky-600 mt-2">{deliveries.filter(d => d.status === 'en transit').length} expédition(s)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">En Préparation</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">{deliveries.filter(d => d.status === 'en préparation').length} expédition(s)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase">Livrées (Cette semaine)</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{deliveries.filter(d => d.status === 'livré').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher une livraison..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 bg-gray-50" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-5 border-b border-gray-200">Référence</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Client & Adresse</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Chauffeur</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Date Prévue</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Statut</th>
                <th className="py-3.5 px-5 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(delivery => (
                <tr key={delivery.id} className="hover:bg-sky-50/20 transition-colors">
                  <td className="py-4 px-5 font-semibold text-gray-900">{delivery.reference}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{delivery.customer}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" /> {delivery.address}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{delivery.driver}</td>
                  <td className="py-4 px-4 text-gray-500">{delivery.expectedDate}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold 
                      ${delivery.status === 'livré' ? 'bg-green-100 text-green-700' : 
                        delivery.status === 'en transit' ? 'bg-sky-100 text-sky-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {delivery.status === 'livré' && <CheckCircle className="h-3 w-3" />}
                      {delivery.status === 'en transit' && <Truck className="h-3 w-3" />}
                      {delivery.status === 'en préparation' && <Clock className="h-3 w-3" />}
                      <span className="capitalize">{delivery.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewDelivery(delivery)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEditModal(delivery)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-all">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Aucune expédition trouvée.
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
