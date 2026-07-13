"use client";

import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Edit2, Trash2, Send, Download, Archive, CheckCircle, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", params.id)
        .single();
      
      if (error || !data) {
        setLoading(false);
        return;
      }
      
      const formattedInvoice = {
        id: data.id,
        reference: data.reference,
        clientId: data.client_id ?? "",
        customer: data.customer,
        salesman: data.salesman ?? "",
        amount: data.amount,
        subtotal: data.subtotal,
        taxAmount: data.tax_amount,
        status: data.status,
        date: data.date,
        dueDate: data.due_date ?? data.date,
        invoiceNumber: data.invoice_number ?? null,
        items: Array.isArray(data.items) ? data.items : [],
      };
      
      setInvoice(formattedInvoice);
      setLoading(false);
    };
    fetchInvoice();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-center pt-20">
        <h2 className="text-2xl font-bold text-gray-900">Facture introuvable</h2>
        <Link href="/invoices" className="text-sky-600 hover:underline">
          Retour à la liste des factures
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      await supabase.from("invoices").delete().eq("id", invoice.id);
      router.push("/invoices");
    }
  };

  const handleArchive = () => {
    if (window.confirm("Archiver cette facture ?")) {
      alert("Facture archivée avec succès ! (Simulation)");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase.from("invoices").update({ status: newStatus }).eq("id", invoice.id);
    if (!error) {
      setInvoice({ ...invoice, status: newStatus });
    }
  };

  const handleGeneratePDF = async () => {
    const element = document.getElementById("invoice-preview-container");
    if (!element) return;
    
    // Use dynamic import
    const html2pdf = (await import("html2pdf.js")).default;
    
    const opt = {
      margin:       0.5,
      filename:     `facture-${invoice.reference}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const shareWhatsApp = () => {
    const text = `Bonjour,\n\nVoici le lien vers votre facture ${invoice.reference} d'un montant de ${invoice.amount} FCFA.\n\nMerci de votre confiance.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/invoices" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour aux factures
        </Link>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Change Buttons based on current state */}
          {invoice.status === "brouillon" && (
            <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={() => handleStatusChange("envoyée")}>
              <Send className="h-4 w-4" /> Marquer comme envoyée
            </Button>
          )}
          {invoice.status === "envoyée" && (
            <>
              <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={() => handleStatusChange("payée")}>
                <CheckCircle className="h-4 w-4" /> Marquer comme payée
              </Button>
              <Button className="gap-2 bg-red-500 hover:bg-red-600" onClick={() => handleStatusChange("en retard")}>
                <Clock className="h-4 w-4" /> Signaler en retard
              </Button>
            </>
          )}

          <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

          <Button variant="outline" className="gap-2" onClick={handleGeneratePDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50" onClick={shareWhatsApp}>
            <Share2 className="h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
            <Edit2 className="h-4 w-4" /> Modifier
          </Button>
          <Button variant="outline" className="gap-2 text-gray-600 hover:text-gray-900" onClick={handleArchive}>
            <Archive className="h-4 w-4" /> Archiver
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div id="invoice-preview-container" className="shadow-lg rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
}
