"use client";

import { useEffect, useState } from "react";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<any>(null);
  const [clientInvoices, setClientInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      // Fetch contact details
      const { data: contactData, error: contactError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (contactError || !contactData) {
        setLoading(false);
        return;
      }
      setContact(contactData);

      // Fetch client invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

      if (invoicesData) {
        const formattedInvoices = invoicesData.map((inv: any) => ({
          id: inv.id,
          reference: inv.reference,
          clientId: inv.client_id ?? "",
          customer: inv.customer,
          salesman: inv.salesman ?? "",
          amount: inv.amount,
          subtotal: inv.subtotal,
          taxAmount: inv.tax_amount,
          status: inv.status,
          date: inv.date,
          dueDate: inv.due_date ?? inv.date,
          invoiceNumber: inv.invoice_number ?? null,
          items: Array.isArray(inv.items) ? inv.items : [],
        }));
        setClientInvoices(formattedInvoices);
      }
      setLoading(false);
    };

    fetchContactData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-center pt-20">
        <h2 className="text-2xl font-bold text-gray-900">Contact introuvable</h2>
        <Link href="/contacts" className="text-sky-600 hover:underline">
          Retour à la liste des contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Link href="/contacts" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors gap-2">
        <ArrowLeft className="h-4 w-4" /> Retour aux contacts
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-500">
            <UserCircle className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{contact.name}</h1>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
              <span><strong>Email :</strong> {contact.email || "Non renseigné"}</span>
              <span><strong>Tél :</strong> {contact.phone || "Non renseigné"}</span>
              <span><strong>Adresse :</strong> {contact.address || "Non renseignée"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Factures de {contact.name}</h2>
        {clientInvoices.length > 0 ? (
          <InvoiceTable invoices={clientInvoices} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Aucune facture trouvée pour ce contact.
          </div>
        )}
      </div>
    </div>
  );
}
