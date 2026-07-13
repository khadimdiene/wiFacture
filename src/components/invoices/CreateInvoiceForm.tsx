"use client";

import { useState, useEffect, useCallback } from "react";
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Plus, Trash2, Save, Send, Eye, EyeOff, AlertTriangle, Download, Share2, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function CreateInvoiceForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [documentType, setDocumentType] = useState(initialData?.documentType || "Facture");
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData?.dueDate ? new Date(initialData.dueDate) : undefined);
  const [reference, setReference] = useState(initialData?.reference || `INV-${Date.now().toString().slice(-6)}`);
  const [currency, setCurrency] = useState("XOF");
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || []);
  
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("Standard");

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from("clients").select("*").order("name");
      if (data) setClients(data);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (clientId || dueDate || items.length > 0) setIsDirty(true);
  }, [clientId, dueDate, items]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleNavigate = useCallback((path: string) => {
    if (isDirty) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      router.push(path);
    }
  }, [isDirty, router]);

  const confirmNavigation = () => {
    setIsDirty(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) router.push(pendingNavigation);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
  const taxAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.total = Math.round((Number(updatedItem.quantity) || 0) * (Number(updatedItem.unitPrice) || 0));
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const selectedClient = clients.find(c => c.id === clientId);

  const saveInvoice = async (status: string) => {
    if (!clientId) {
      alert("Veuillez sélectionner un client.");
      return;
    }
    setIsSaving(true);
    
    const invoicePayload = {
      reference,
      document_type: documentType,
      client_id: clientId,
      customer: selectedClient?.name || "Client inconnu",
      amount: totalAmount,
      subtotal,
      tax_amount: taxAmount,
      status,
      date,
      due_date: dueDate || null,
      items
    };

    if (initialData?.id) {
      const { error } = await supabase.from("invoices").update(invoicePayload).eq("id", initialData.id);
      if (error) {
        if (error.code === '23505') {
          alert("Erreur : Ce numéro de document existe déjà. Veuillez utiliser une référence unique pour éviter les doublons.");
        } else {
          alert("Une erreur est survenue lors de l'enregistrement.");
        }
      } else {
        setIsDirty(false);
        router.push(`/invoices/${initialData.id}`);
      }
    } else {
      const { data, error } = await supabase.from("invoices").insert([invoicePayload]).select().single();
      if (error) {
        if (error.code === '23505') {
          alert("Erreur : Ce numéro de document existe déjà. Veuillez utiliser une référence unique pour éviter les doublons.");
        } else {
          alert("Une erreur est survenue lors de l'enregistrement.");
        }
      } else if (data) {
        setIsDirty(false);
        router.push(`/invoices/${data.id}`);
      }
    }
    setIsSaving(false);
  };

  const invoiceData = {
    clientId,
    date: date ? format(date, "yyyy-MM-dd") : null,
    dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    items,
    subtotal,
    taxAmount,
    amount: totalAmount,
    status: initialData?.status || "brouillon",
    reference,
    documentType
  };

  const generatePDF = async () => {
    const element = document.getElementById("invoice-preview-container");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    const opt = {
      margin:       0.5,
      filename:     `${documentType.toLowerCase()}-${reference}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const shareWhatsApp = () => {
    const text = `Bonjour,\n\nVoici le lien vers votre ${documentType.toLowerCase()} ${reference} d'un montant de ${formatCurrency(totalAmount)}.\n\nMerci de votre confiance.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-140px)]">
      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowUnsavedModal(false)} />
          <div className="relative z-[101] w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 m-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Modifications non enregistrées</h3>
                <p className="text-sm text-gray-500 mt-2">Si vous quittez cette page, toutes les données saisies seront perdues.</p>
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-3 mt-4">
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => setShowUnsavedModal(false)}>
                  Non, Rester
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={confirmNavigation}>
                  Oui, Quitter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="lg:hidden flex justify-end">
        <Button variant="outline" onClick={() => setShowPreviewMobile(!showPreviewMobile)} className="gap-2">
          {showPreviewMobile ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreviewMobile ? "Masquer l'aperçu" : "Voir l'aperçu"}
        </Button>
      </div>

      {/* LEFT PANE: Form */}
      <div className={`w-full lg:w-1/2 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${showPreviewMobile ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Title & Mobile Preview Toggle */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Créer un document</h2>
              <p className="text-sm text-gray-500">Créez une nouvelle facture, devis ou bon de commande et envoyez-le instantanément.</p>
            </div>
          </div>

          {/* Type of document & Tabs (Standard, Split, Recurring) */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex p-1 bg-gray-100 rounded-lg">
              {['Standard', 'Split', 'Recurring'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <Select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-40 h-9 text-sm">
              <option value="Facture">Facture</option>
              <option value="Devis">Devis</option>
              <option value="Bon de commande">Bon de commande</option>
            </Select>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Invoice Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Informations générales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client">Client (Facturé à) <span className="text-red-500">*</span></Label>
                <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">Sélectionner un client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Numéro de document</Label>
                <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Date d'émission <span className="text-red-500">*</span></Label>
                <DatePicker date={date} setDate={setDate} />
              </div>
              <div className="space-y-1.5">
                <Label>Date d'échéance</Label>
                <DatePicker date={dueDate} setDate={setDueDate} placeholder="Sélectionner une date" />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Articles / Services</h3>
              <div className="w-40">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-9 text-sm">
                  <option value="XOF">XOF (Franc CFA)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="USD">USD (Dollar)</option>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col gap-4 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Article {index + 1}</span>
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Nom de l'article</Label>
                    <Input 
                      placeholder="Ex: Création de site web..." 
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Qté</Label>
                      <Input type="number" min="1" value={item.quantity || ""} onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Prix U.</Label>
                      <Input type="number" min="0" value={item.unitPrice || ""} onChange={(e) => handleItemChange(item.id, "unitPrice", parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Total</Label>
                      <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-semibold flex items-center justify-end text-gray-900">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un article
              </Button>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (18%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>Total TTC</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Preview & Actions */}
      <div className={`w-full lg:w-1/2 flex flex-col ${!showPreviewMobile ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Action Buttons Header */}
        <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-wrap gap-2">
          <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2 bg-white hidden sm:flex">
                  <Mail className="h-4 w-4" /> Email
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-white" onClick={() => window.print()}>
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => saveInvoice("brouillon")} disabled={isSaving}>
              Enregistrer Brouillon
            </Button>
            <Button size="sm" className="h-8 text-xs bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={() => saveInvoice("envoyée")} disabled={isSaving}>
              <Send className="h-3.5 w-3.5" /> Envoyer {documentType}
            </Button>
          </div>
        </div>

        {/* Real-time Preview */}
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 rounded-xl border border-gray-200 bg-gray-50 shadow-sm p-4 sm:p-6">
          <div className="text-xs" id="invoice-preview-container">
            <InvoicePreview invoice={invoiceData} client={selectedClient} />
          </div>
        </div>
      </div>
    </div>
  );
}
