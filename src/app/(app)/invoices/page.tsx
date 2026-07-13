"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { supabase } from "@/lib/supabase";
import { Invoice } from "@/lib/types";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvoices(
          data.map((inv: any) => ({
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
          }))
        );
      }
      setLoading(false);
    };
    fetchInvoices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {loading ? "Chargement..." : `Liste des factures (${invoices.length})`}
        </h1>
        <Button onClick={() => window.location.href = '/invoices/new'} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle Facture
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : (
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
