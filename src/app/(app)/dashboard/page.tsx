"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCount: 0,
    paid: { count: 0, amount: 0 },
    due: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: invoicesData, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (invoicesData && !error) {
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
        
        setInvoices(formattedInvoices);

        // Calculate stats
        let totalValue = 0;
        let paidValue = 0, paidCount = 0;
        let dueValue = 0, dueCount = 0;
        let overdueValue = 0, overdueCount = 0;

        formattedInvoices.forEach(inv => {
          const val = inv.amount;
          totalValue += val;
          if (inv.status === "payée") {
            paidValue += val;
            paidCount++;
          } else if (inv.status === "en retard") {
            overdueValue += val;
            overdueCount++;
          } else if (inv.status === "envoyée" || inv.status === "brouillon") {
            // Considering 'envoyée' as due.
            dueValue += val;
            dueCount++;
          }
        });

        setStats({
          totalValue,
          totalCount: formattedInvoices.length,
          paid: { count: paidCount, amount: paidValue },
          due: { count: dueCount, amount: dueValue },
          overdue: { count: overdueCount, amount: overdueValue }
        });
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <StatsCards 
        totalValue={stats.totalValue}
        totalCount={stats.totalCount}
        paid={stats.paid}
        due={stats.due}
        overdue={stats.overdue}
      />
      
      <div className="mt-8">
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}
