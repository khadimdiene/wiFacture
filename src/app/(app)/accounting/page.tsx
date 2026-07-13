"use client";

import { useState } from "react";
import { Calculator, Plus, Search, Send, TrendingUp, TrendingDown, ArrowRight, CheckCircle, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  account: string;
}

const initialEntries: JournalEntry[] = [
  { id: "e1", date: "2026-10-01", reference: "OD-001", description: "Vente facture FAC-2026-012", debit: 0, credit: 1500000, account: "411 - Clients" },
  { id: "e2", date: "2026-10-02", reference: "OD-002", description: "Règlement fournisseur Global Tech", debit: 450000, credit: 0, account: "401 - Fournisseurs" },
  { id: "e3", date: "2026-10-05", reference: "OD-003", description: "Achat matières premières", debit: 800000, credit: 0, account: "601 - Achats" },
  { id: "e4", date: "2026-10-08", reference: "OD-004", description: "Salaires du mois d'octobre", debit: 1200000, credit: 0, account: "641 - Charges de personnel" },
  { id: "e5", date: "2026-10-10", reference: "OD-005", description: "Vente facture FAC-2026-015", debit: 0, credit: 675000, account: "411 - Clients" },
];

export default function AccountingPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [newEntry, setNewEntry] = useState({ date: "", reference: "", description: "", debit: "", credit: "", account: "" });

  const filteredEntries = entries.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.reference.toLowerCase().includes(search.toLowerCase()) ||
    e.account.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);
  const balance = totalCredits - totalDebits;

  const handleCreate = () => {
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: newEntry.date || new Date().toISOString().split('T')[0],
      reference: newEntry.reference || `OD-00${entries.length + 1}`,
      description: newEntry.description || "Nouvelle écriture",
      debit: parseFloat(newEntry.debit) || 0,
      credit: parseFloat(newEntry.credit) || 0,
      account: newEntry.account || "411 - Clients",
    };
    setEntries([entry, ...entries]);
    setIsCreateModalOpen(false);
    setNewEntry({ date: "", reference: "", description: "", debit: "", credit: "", account: "" });
  };

  const handleSendToAccountant = () => {
    setSendSuccess(true);
    setTimeout(() => {
      setIsSendModalOpen(false);
      setSendSuccess(false);
    }, 2000);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setEntries(entries.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Nouvelle écriture comptable">
        <div className="space-y-4 max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <Input type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <Input placeholder="OD-001" value={newEntry.reference} onChange={e => setNewEntry({ ...newEntry, reference: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <Input placeholder="Libellé de l'écriture" value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compte comptable</label>
            <Input placeholder="Ex: 411 - Clients" value={newEntry.account} onChange={e => setNewEntry({ ...newEntry, account: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Débit (FCFA)</label>
              <Input type="number" placeholder="0" value={newEntry.debit} onChange={e => setNewEntry({ ...newEntry, debit: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crédit (FCFA)</label>
              <Input type="number" placeholder="0" value={newEntry.credit} onChange={e => setNewEntry({ ...newEntry, credit: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full bg-sky-600 hover:bg-sky-700">Enregistrer l'écriture</Button>
        </div>
      </Modal>

      {/* Send to Accountant Modal */}
      <Modal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} title="Envoyer au comptable">
        <div className="max-w-md mx-auto space-y-6 text-center">
          {sendSuccess ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Rapport envoyé !</h3>
              <p className="text-gray-500 text-sm">Le journal comptable a été transmis à votre comptable.</p>
            </div>
          ) : (
            <>
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-left">
                <p className="text-sm font-semibold text-sky-800 mb-1">Résumé du journal</p>
                <div className="space-y-1 text-sm text-sky-700">
                  <p>• {entries.length} écritures au total</p>
                  <p>• Total débits : <strong>{formatCurrency(totalDebits)}</strong></p>
                  <p>• Total crédits : <strong>{formatCurrency(totalCredits)}</strong></p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Email du comptable</label>
                <Input defaultValue="comptable@cabinet.sn" className="text-gray-900" />
              </div>
              <Button onClick={handleSendToAccountant} className="w-full bg-sky-600 hover:bg-sky-700 gap-2">
                <Send className="h-4 w-4" /> Envoyer le rapport
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewEntry} onClose={() => setViewEntry(null)} title={`Écriture: ${viewEntry?.reference}`}>
        {viewEntry && (
          <div className="space-y-4 max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Date</p>
                <p className="font-bold text-gray-900 mt-1">{formatDate(viewEntry.date)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold">Référence</p>
                <p className="font-bold text-gray-900 mt-1">{viewEntry.reference}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
              <p className="font-medium text-gray-900 mt-1">{viewEntry.description}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold">Compte</p>
              <p className="font-medium text-gray-900 mt-1">{viewEntry.account}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-xs text-red-500 uppercase font-semibold">Débit</p>
                <p className="font-bold text-red-700 mt-1">{viewEntry.debit > 0 ? formatCurrency(viewEntry.debit) : "—"}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-500 uppercase font-semibold">Crédit</p>
                <p className="font-bold text-green-700 mt-1">{viewEntry.credit > 0 ? formatCurrency(viewEntry.credit) : "—"}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer l'écriture"
        message={`Êtes-vous sûr de vouloir supprimer l'écriture ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Calculator className="h-6 w-6 text-sky-500" />
          Comptabilité
        </h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsSendModalOpen(true)} variant="outline" className="gap-2 border-sky-200 text-sky-700 hover:bg-sky-50">
            <Send className="h-4 w-4" /> Envoyer au comptable
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4" /> Nouvelle écriture
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Débits</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalDebits)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-500 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Crédits</p>
            <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalCredits)}</h3>
          </div>
        </div>
        <div className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 ${balance >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            <ArrowRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Solde Net</p>
            <h3 className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{balance >= 0 ? '+' : ''}{formatCurrency(balance)}</h3>
          </div>
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-gray-900">Journal des Écritures</h2>
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
                <th className="py-3 px-4 border-b border-gray-200">Date</th>
                <th className="py-3 px-4 border-b border-gray-200">Réf.</th>
                <th className="py-3 px-4 border-b border-gray-200">Description</th>
                <th className="py-3 px-4 border-b border-gray-200">Compte</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right text-red-500">Débit</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right text-green-500">Crédit</th>
                <th className="py-3 px-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{entry.reference}</td>
                    <td className="py-3 px-4 text-gray-700">{entry.description}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">{entry.account}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewEntry(entry)} className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(entry)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Aucune écriture trouvée.</td>
                </tr>
              )}
            </tbody>
            {/* Totals row */}
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="py-3 px-4 font-bold text-gray-700 text-right">TOTAUX</td>
                <td className="py-3 px-4 text-right font-bold text-red-600">{formatCurrency(totalDebits)}</td>
                <td className="py-3 px-4 text-right font-bold text-green-600">{formatCurrency(totalCredits)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

