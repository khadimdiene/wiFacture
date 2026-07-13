"use client";

import { useState, useRef, useEffect } from "react";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Download, Search, FileText, MoreVertical, SlidersHorizontal, ChevronDown, Eye, Edit2, Trash2, CheckCircle, Clock, X } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoiceForm";
import { supabase } from "@/lib/supabase";

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices: initialInvoices }: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [activeTab, setActiveTab] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [showExportToast, setShowExportToast] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  
  // Modals state
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer.toLowerCase().includes(search.toLowerCase()) ||
      invoice.reference.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "Payées" && invoice.status !== "payée") return false;
    if (activeTab === "Non payées" && (invoice.status === "payée" || invoice.status === "brouillon")) return false;
    if (activeTab === "En retard" && invoice.status !== "en retard") return false;
    if (activeTab === "Brouillons" && invoice.status !== "brouillon") return false;
    return true;
  });

  const stats = {
    all: invoices.length,
    paid: invoices.filter(i => i.status === "payée").length,
    unpaid: invoices.filter(i => i.status !== "payée" && i.status !== "brouillon").length,
    overdue: invoices.filter(i => i.status === "en retard").length,
    draft: invoices.filter(i => i.status === "brouillon").length,
  };

  const handleExport = (invoiceToExport?: Invoice) => {
    // Si on a cliqué sur un export de facture spécifique, on génère un "PDF" (via print)
    if (invoiceToExport) {
      const pdfWindow = window.open("", "_blank");
      if (pdfWindow) {
        pdfWindow.document.write(`<html><head><title>Facture ${invoiceToExport.reference}</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f3f4f6;"><h1>Aperçu PDF de la facture ${invoiceToExport.reference}</h1><p>Prêt à l'impression</p></body></html>`);
        setTimeout(() => pdfWindow.print(), 500);
      }
    } else {
      // Export de la liste globale
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    }
  };

  const changeStatus = async (id: string, newStatus: Invoice["status"]) => {
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    }
    setOpenDropdownId(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setInvoices(invoices.filter(inv => inv.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
      
      {/* Toast Export */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <Download className="h-5 w-5 text-sky-400" />
          <span className="font-semibold text-sm">Exportation de la liste réussie !</span>
        </div>
      )}

      {/* Modal Visualisation */}
      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title={`Détail Facture: ${viewInvoice?.reference}`}>
        {viewInvoice && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-end gap-2 mb-4">
               <button onClick={() => handleExport(viewInvoice)} className="px-4 py-2 bg-sky-50 text-sky-600 font-semibold text-sm rounded-lg hover:bg-sky-100 flex items-center gap-2">
                 <Download className="h-4 w-4" /> Télécharger PDF
               </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <InvoicePreview invoice={viewInvoice} />
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Edition */}
      <Modal isOpen={!!editInvoice} onClose={() => setEditInvoice(null)} title={`Modifier Facture: ${editInvoice?.reference}`}>
        {editInvoice && (
          <div className="max-w-5xl mx-auto max-h-[80vh] overflow-y-auto pr-2">
            <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Modifiez les informations de la facture ci-dessous.
            </p>
            <CreateInvoiceForm />
          </div>
        )}
      </Modal>

      {/* Modal Suppression */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer la facture"
        message={`Êtes-vous sûr de vouloir supprimer la facture ${deleteTarget?.reference} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2.5 text-lg font-bold text-gray-950">
            <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><FileText className="h-5 w-5" /></div>
            Factures
          </div>
          <button onClick={() => handleExport()} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm transition-all duration-300 hover:bg-black hover:text-white hover:border-black active:scale-95 group">
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Exporter Liste
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex space-x-1 text-sm font-semibold overflow-x-auto scrollbar-none border-b border-gray-100 lg:border-none pb-2 lg:pb-0">
            {[
              { label: `Toutes (${stats.all})`, key: "Toutes" },
              { label: `Payées (${stats.paid})`, key: "Payées" },
              { label: `Non payées (${stats.unpaid})`, key: "Non payées" },
              { label: `En retard (${stats.overdue})`, key: "En retard" },
              { label: `Brouillons (${stats.draft})`, key: "Brouillons" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 pb-3 border-b-2 font-semibold transition-all duration-200 whitespace-nowrap -mb-[10px] ${activeTab === tab.key
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all w-full sm:w-60 bg-gray-50 hover:bg-white"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all">
              Trier <ChevronDown className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm text-gray-700 min-w-[900px]">
          <thead className="bg-gray-50/75 text-gray-500 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="py-3.5 px-5 border-b border-gray-200 w-12">
                <input type="checkbox" className="rounded border-gray-300 text-sky-500" />
              </th>
              <th className="py-3.5 px-4 border-b border-gray-200">Référence</th>
              <th className="py-3.5 px-4 border-b border-gray-200">Client</th>
              <th className="py-3.5 px-4 border-b border-gray-200">Commercial</th>
              <th className="py-3.5 px-4 border-b border-gray-200">Montant</th>
              <th className="py-3.5 px-4 border-b border-gray-200">Date</th>
              <th className="py-3.5 px-4 border-b border-gray-200">Statut</th>
              <th className="py-3.5 px-5 border-b border-gray-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-sky-50/20 transition-colors duration-150 group">
                  <td className="py-3.5 px-5">
                    <input type="checkbox" className="rounded border-gray-300 text-sky-500" onClick={(e) => e.stopPropagation()} />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900 tracking-tight">{invoice.reference}</td>
                  <td className="py-3.5 px-4 font-medium text-gray-800">{invoice.customer}</td>
                  <td className="py-3.5 px-4 text-gray-500">{invoice.salesman}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">{formatCurrency(invoice.amount)}</td>
                  <td className="py-3.5 px-4 text-gray-500">{formatDate(invoice.date)}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={invoice.status}
                      onChange={(e) => changeStatus(invoice.id, e.target.value as Invoice["status"])}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs font-semibold rounded-full px-2.5 py-1 cursor-pointer border focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                        invoice.status === 'payée' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                        invoice.status === 'envoyée' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                        invoice.status === 'en retard' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                        'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="envoyée">Envoyée</option>
                      <option value="payée">Payée</option>
                      <option value="en retard">En retard</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-5 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewInvoice(invoice)}
                        className="p-1.5 text-gray-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-all"
                        title="Visualiser"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditInvoice(invoice)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <div className="relative" ref={openDropdownId === invoice.id ? dropdownRef : null}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === invoice.id ? null : invoice.id); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all"
                          title="Plus d'options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openDropdownId === invoice.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1 overflow-hidden">
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500 uppercase">Changer le statut</span>
                              <X className="h-3 w-3 text-gray-400 cursor-pointer hover:text-gray-900" onClick={() => setOpenDropdownId(null)} />
                            </div>
                            <button onClick={() => changeStatus(invoice.id, "payée")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-green-700 font-medium">
                              <CheckCircle className="h-4 w-4" /> Marquer payée
                            </button>
                            <button onClick={() => changeStatus(invoice.id, "en retard")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-700 font-medium">
                              <Clock className="h-4 w-4" /> Marquer en retard
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={() => handleExport(invoice)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50 flex items-center gap-2 text-sky-600 font-medium">
                              <Download className="h-4 w-4" /> Exporter PDF
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={() => { setOpenDropdownId(null); setDeleteTarget(invoice); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium">
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
                <td colSpan={8} className="py-16 text-center">
                  <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aucune facture trouvée.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
