"use client";

import { useEffect, useState } from "react";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoiceForm";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditInvoicePage({ params }: { params: { id: string } }) {
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
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Modifier la facture {invoice.reference}</h1>
        <p className="text-sm text-gray-500 mt-1">Modifiez les informations ci-dessous.</p>
      </div>
      <CreateInvoiceForm initialData={invoice} />
    </div>
  );
}
