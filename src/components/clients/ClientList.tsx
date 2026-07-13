"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Plus, Search, Edit2, Trash2, Users, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function ClientList() {
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", type: "client" });

  useEffect(() => {
    const fetchData = async () => {
      const [clientsRes, invoicesRes] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("client_id")
      ]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (client?: any) => {
    if (client) {
      setEditingClient(client);
      setFormData({ name: client.name, email: client.email || "", phone: client.phone || "", address: client.address || "", type: client.type || "client" });
    } else {
      setEditingClient(null);
      setFormData({ name: "", email: "", phone: "", address: "", type: "client" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      const { data } = await supabase.from("clients").update(formData).eq("id", editingClient.id).select().single();
      if (data) {
        setClients(clients.map(c => c.id === editingClient.id ? data : c));
      }
    } else {
      const { data } = await supabase.from("clients").insert([formData]).select().single();
      if (data) {
        setClients([data, ...clients]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await supabase.from("clients").delete().eq("id", deleteTarget.id);
      setClients(clients.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const getClientInvoiceCount = (clientId: string) =>
    invoices.filter(inv => inv.client_id === clientId).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le contact"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.name} ? Cette action est irréversible.`}
        confirmLabel="Oui, Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-sky-500" />
          Contacts
          <span className="text-sm font-normal text-gray-500 ml-1">({filteredClients.length})</span>
        </h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter un contact
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
              placeholder="Rechercher un contact..."
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
                <th className="py-3 px-4 border-b border-gray-200">Nom / Entreprise</th>
                <th className="py-3 px-4 border-b border-gray-200">Contact</th>
                <th className="py-3 px-4 border-b border-gray-200">Type</th>
                <th className="py-3 px-4 border-b border-gray-200">Factures</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-sky-50/50 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                          <Link href={`/contacts/${client.id}`}>{client.name}</Link>
                        </div>
                        {client.address && <div className="text-xs text-gray-500 truncate max-w-[200px]">{client.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{client.email || <span className="text-gray-400 italic">Non renseigné</span>}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {client.type || 'client'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{getClientInvoiceCount(client.id)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/contacts/${client.id}`}
                        className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-colors"
                        title="Voir la fiche"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleOpenModal(client)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(client)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Aucun contact trouvé.
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
        title={editingClient ? "Modifier le contact" : "Nouveau contact"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom / Entreprise <span className="text-red-500">*</span></Label>
            <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="type">Type de contact</Label>
            <select 
              id="type" 
              value={formData.type} 
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
            >
              <option value="client">Client</option>
              <option value="fournisseur">Fournisseur</option>
              <option value="les deux">Les deux</option>
            </select>
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
