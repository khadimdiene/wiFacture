"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardsProps {
  totalValue: number;
  totalCount: number;
  paid: { amount: number; count: number };
  due: { amount: number; count: number };
  overdue: { amount: number; count: number };
}

const monthlyData = [
  { mois: "Jan", ventes: 9200000 },
  { mois: "Fév", ventes: 11500000 },
  { mois: "Mar", ventes: 8700000 },
  { mois: "Avr", ventes: 13200000 },
  { mois: "Mai", ventes: 10800000 },
  { mois: "Jun", ventes: 15400000 },
  { mois: "Jul", ventes: 12600000 },
];

const maxVal = Math.max(...monthlyData.map(d => d.ventes));

const dailySales = [
  { jour: "Lun", montant: 1200000 },
  { jour: "Mar", montant: 980000 },
  { jour: "Mer", montant: 1650000 },
  { jour: "Jeu", montant: 1100000 },
  { jour: "Ven", montant: 2100000 },
  { jour: "Sam", montant: 1800000 },
  { jour: "Dim", montant: 640000 },
];

export function StatsCards({ totalValue, totalCount, paid, due, overdue }: StatsCardsProps) {
  return (
    <div className="space-y-6 mb-6">
      {/* Summary + Progress bar card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Vue d'ensemble des factures</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">Valeur totale :</span>
              <span className="font-bold text-gray-900 transition-colors duration-200 hover:text-sky-500 cursor-pointer">
                {formatCurrency(totalValue)}
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                {totalCount} Factures
              </span>
            </div>
          </div>
          <div className="md:text-right">
            <div className="flex items-center gap-2 text-sm justify-start md:justify-end">
              <span className="text-gray-500">Valeur estimée totale :</span>
              <span className="font-bold text-sky-600 transition-transform duration-200 hover:scale-105 cursor-pointer">
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Progress Bar */}
        <div className="w-full flex h-3.5 bg-gray-100 rounded-full overflow-hidden mb-8 shadow-inner">
          <div
            className="bg-green-500 h-full transition-all duration-700 hover:opacity-90 cursor-pointer"
            style={{ width: `${(paid.amount / totalValue) * 100}%` }}
            title={`Payées : ${formatCurrency(paid.amount)}`}
          />
          <div
            className="bg-yellow-400 h-full mx-0.5 transition-all duration-700 hover:opacity-90 cursor-pointer"
            style={{ width: `${(due.amount / totalValue) * 100}%` }}
            title={`Dues : ${formatCurrency(due.amount)}`}
          />
          <div
            className="bg-red-500 h-full transition-all duration-700 hover:opacity-90 cursor-pointer"
            style={{ width: `${(overdue.amount / totalValue) * 100}%` }}
            title={`En retard : ${formatCurrency(overdue.amount)}`}
          />
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/30 transition-all duration-200 hover:bg-green-50/30 hover:border-green-100 hover:shadow-xs group cursor-pointer active:scale-[0.99]">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">Payées</span>
                <span className="text-xs text-gray-500 font-medium">{paid.count} factures</span>
              </div>
              <span className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(paid.amount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/30 transition-all duration-200 hover:bg-yellow-50/30 hover:border-yellow-200 hover:shadow-xs group cursor-pointer active:scale-[0.99]">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors duration-200">Dues</span>
                <span className="text-xs text-gray-500 font-medium">{due.count} factures</span>
              </div>
              <span className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(due.amount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/30 transition-all duration-200 hover:bg-red-50/30 hover:border-red-100 hover:shadow-xs group cursor-pointer active:scale-[0.99]">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors duration-200">En retard</span>
                <span className="text-xs text-gray-500 font-medium">{overdue.count} factures</span>
              </div>
              <span className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(overdue.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Ventes mensuelles</h3>
              <p className="text-xs text-gray-500 mt-0.5">Chiffre d'affaires des 7 derniers mois</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" />
              +18%
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {monthlyData.map((d, i) => {
              const height = Math.round((d.ventes / maxVal) * 100);
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={d.mois} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(d.ventes).split(' ')[0]}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 cursor-pointer ${isLast ? 'bg-sky-500' : 'bg-sky-200 hover:bg-sky-400'}`}
                    style={{ height: `${height}%` }}
                    title={`${d.mois} : ${formatCurrency(d.ventes)}`}
                  />
                  <span className="text-xs text-gray-500 font-medium">{d.mois}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Ventes journalières</h3>
              <p className="text-xs text-gray-500 mt-0.5">Cette semaine</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              <Minus className="h-3 w-3" />
              -4% vs semaine dernière
            </div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {dailySales.map((d, i) => {
              const maxD = Math.max(...dailySales.map(x => x.montant));
              const height = Math.round((d.montant / maxD) * 100);
              return (
                <div key={d.jour} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {(d.montant / 1000000).toFixed(1)}M
                  </div>
                  <div
                    className="w-full rounded-t-md bg-purple-200 hover:bg-purple-500 transition-all duration-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${d.jour} : ${formatCurrency(d.montant)}`}
                  />
                  <span className="text-xs text-gray-500 font-medium">{d.jour}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "CA du mois", value: "15 400 000 FCFA", trend: "+23%", up: true, color: "green" },
          { label: "Factures émises", value: `${totalCount}`, trend: "+6 ce mois", up: true, color: "sky" },
          { label: "Montant en retard", value: formatCurrency(overdue.amount), trend: "-5% vs mois dernier", up: false, color: "red" },
          { label: "Clients actifs", value: "5", trend: "+1 ce mois", up: true, color: "purple" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1 truncate">{kpi.value}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
              {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
