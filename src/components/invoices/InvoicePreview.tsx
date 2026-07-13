"use client";

import { useState, useEffect } from "react";
import { Invoice, Client } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { supabase } from "@/lib/supabase";

interface InvoicePreviewProps {
  invoice: Partial<Invoice>;
  client?: Client | null;
}

export function InvoicePreview({ invoice, client }: InvoicePreviewProps) {
  const displayClient = client;
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    supabase.from('company_settings').select('*').limit(1).single().then(({ data }) => {
      if (data) setCompany(data);
    });
  }, []);

  return (
    <div className="bg-white p-8 sm:p-12 border border-gray-200 rounded-xl shadow-sm min-h-[800px] flex flex-col relative text-gray-900">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-2 bg-sky-500 rounded-t-xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">FACTURE</h2>
          <div className="mt-2 text-gray-500 font-medium">
            Ref: <span className="text-gray-900">{invoice.reference || "Brouillon"}</span>
          </div>
        </div>
        <div className="text-right">
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.legal_name} className="h-12 object-contain ml-auto mb-2" />
          ) : (
            <div className="text-2xl font-black text-sky-500 tracking-tighter">{company?.legal_name || "WiFacture"}</div>
          )}
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <p>{company?.social_address || "Adresse non définie"}</p>
            <p>{company?.email || ""}</p>
            <p>{company?.pro_phone || ""}</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-8 py-8 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Facturé à</h3>
          {displayClient ? (
            <div className="space-y-1">
              <p className="font-bold text-lg">{displayClient.name}</p>
              <p className="text-gray-600">{displayClient.address}</p>
              <p className="text-gray-600">{displayClient.email}</p>
              <p className="text-gray-600">{displayClient.phone}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Client non sélectionné</p>
          )}
        </div>
        <div className="space-y-4 min-w-[200px]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">Date d'émission</h3>
            <p className="font-semibold">{invoice.date ? formatDate(invoice.date) : "-"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">Date d'échéance</h3>
            <p className="font-semibold">{invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</p>
          </div>
          {invoice.status && (
            <div>
              <StatusBadge status={invoice.status} />
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-grow py-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center w-24">Qté</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right w-32">Prix Unitaire</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="py-4 px-4 text-gray-900">{item.description || "-"}</td>
                  <td className="py-4 px-4 text-center text-gray-600">{item.quantity || 0}</td>
                  <td className="py-4 px-4 text-right text-gray-600">{formatCurrency(item.unitPrice || 0)}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">{formatCurrency(item.total || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                  Aucune ligne ajoutée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <div className="w-full sm:w-1/2 md:w-1/3 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{formatCurrency(invoice.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>TVA (18%)</span>
            <span>{formatCurrency(invoice.taxAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
            <span>Total TTC</span>
            <span className="text-sky-600">{formatCurrency(invoice.amount || 0)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer Notes */}
      <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400 text-center">
        <p>Merci pour votre confiance.</p>
        <p>Les factures sont payables à réception sauf accord contraire.</p>
        {company && (
          <div className="mt-4 text-xs flex items-center justify-center gap-4 flex-wrap text-gray-400">
            {company.ninea && <span>NINEA: {company.ninea}</span>}
            {company.rccm && <span>RCCM: {company.rccm}</span>}
            {company.social_address && <span>Adresse: {company.social_address}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
