"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Eye, Download, MoreVertical, Trash2, Edit2, X, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { supabase } from "@/lib/supabase";

interface Quote {
  id: string;
  reference: string;
  customer: string;
  amount: number;
  date: string;
  status: "En attente" | "Accepté" | "Refusé";
}

const initialQuotes: Quote[] = [];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setQuotes(data.map((q: any) => ({
          id: q.id,
          reference: q.reference,
          customer: q.customer,
          amount: q.amount,
          date: q.date,
          status: q.status,
        })));
      }
      setLoading(false);
    };
    fetchQuotes();
  }, []);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter(q => q.customer.toLowerCase().includes(search.toLowerCase()) || q.reference.toLowerCase().includes(search.toLowerCase()));

  const handleExport = (quote: Quote) => {
    const pdfWindow = window.open("", "_blank");
    if (pdfWindow) {
      pdfWindow.document.write(`<html><head><title>Devis ${quote.reference}</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f3f4f6;"><h1>Aperçu PDF du devis ${quote.reference}</h1><p>Prêt à l'impression</p></body></html>`);
      setTimeout(() => pdfWindow.print(), 500);
    }
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await supabase.from('quotes').delete().eq('id', deleteTarget.id);
      setQuotes(quotes.filter(q => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const [createForm, setCreateForm] = useState({ customer: "", amount: "" });

  const handleCreate = async () => {
    if (!createForm.customer || !createForm.amount) return;
    const newQuote = {
      reference: `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      customer: createForm.customer,
      amount: Number(createForm.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'En attente' as const,
    };
    const { data, error } = await supabase.from('quotes').insert([newQuote]).select().single();
    if (!error && data) {
      setQuotes([{ id: data.id, ...newQuote }, ...quotes]);
      setCreateForm({ customer: "", amount: "" });
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modale de Création */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Créer un nouveau devis">
        <div className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <Input placeholder="Nom du client" value={createForm.customer} onChange={e => setCreateForm({ ...createForm, customer: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant Estimé (FCFA)</label>
            <Input type="number" placeholder="Ex: 150000" value={createForm.amount} onChange={e => setCreateForm({ ...createForm, amount: e.target.value })} />
          </div>
          <Button onClick={handleCreate} className="w-full bg-sky-600 hover:bg-sky-700">Enregistrer le devis</Button>
        </div>
      </Modal>

      {/* Modale Visualisation */}
      <Modal isOpen={!!viewQuote} onClose={() => setViewQuote(null)} title={`Détail Devis: ${viewQuote?.reference}`}>
        {viewQuote && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-end gap-2 mb-4">
               <button onClick={() => handleExport(viewQuote)} className="px-4 py-2 bg-sky-50 text-sky-600 font-semibold text-sm rounded-lg hover:bg-sky-100 flex items-center gap-2">
                 <Download className="h-4 w-4" /> Télécharger PDF
               </button>
            </div>
            {/* Simulation de la vue d'un devis par le composant InvoicePreview */}
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white p-8 text-center text-gray-500">
               Aperçu détaillé du devis <strong>{viewQuote.reference}</strong> pour {viewQuote.customer}.<br/>
               Montant : {formatCurrency(viewQuote.amount)}
            </div>
          </div>
        )}
      </Modal>

      {/* Modale Suppression */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le devis"
        message={`Êtes-vous sûr de vouloir supprimer le devis ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-sky-500" />
          Devis
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
          <Plus className="h-4 w-4" /> Créer un devis
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher un devis..." 
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
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="py-3 px-4 font-semibold text-gray-900">{quote.reference}</td>
                    <td className="py-3 px-4 font-medium">{quote.customer}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(quote.amount)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(quote.date)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        quote.status === 'Accepté' ? 'bg-green-100 text-green-700' :
                        quote.status === 'Refusé' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewQuote(quote)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleExport(quote)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-all">
                          <Download className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(quote)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Aucun devis trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
