"use client";

import { BarChart3, TrendingUp, PieChart, Activity, DollarSign, Users, ShoppingCart, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ReportingPage() {
  const stats = [
    { title: "Chiffre d'Affaires", value: formatCurrency(24500000), trend: "+12.5%", isPositive: true, icon: DollarSign },
    { title: "Nouvelles Ventes", value: "145", trend: "+5.2%", isPositive: true, icon: ShoppingCart },
    { title: "Nouveaux Clients", value: "24", trend: "-2.4%", isPositive: false, icon: Users },
    { title: "Taux de Conversion", value: "68%", trend: "+8.1%", isPositive: true, icon: Activity },
  ];

  const recentSales = [
    { id: 1, customer: "Tech Corp SARL", amount: 1250000, time: "10:24", status: "Payé" },
    { id: 2, customer: "Client Passager", amount: 45000, time: "11:05", status: "Payé" },
    { id: 3, customer: "Bamba Ndiaye", amount: 890000, time: "12:30", status: "En attente" },
    { id: 4, customer: "Société Générale", amount: 3500000, time: "14:15", status: "Payé" },
    { id: 5, customer: "Boutique Touba", amount: 150000, time: "15:45", status: "Payé" },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-sky-500" />
          Rapports & Statistiques
        </h1>
        <div className="flex gap-2">
          <select className="border border-gray-300 rounded-lg text-sm font-medium px-3 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-sky-100">
            <option>Aujourd'hui</option>
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>Cette année</option>
          </select>
          <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
            Exporter le rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-500" />
              Évolution des Ventes
            </h3>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-2 pt-4">
            {/* Simulation d'un graphique en barres */}
            {[40, 70, 45, 90, 65, 85, 120].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div className="w-full bg-gray-100 rounded-t-sm relative h-full flex items-end">
                  <div 
                    className="w-full bg-sky-400 group-hover:bg-sky-500 transition-colors rounded-t-sm"
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-400">J{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-sky-500" />
              Répartition par Catégorie
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Informatique", value: 45, color: "bg-sky-500" },
              { label: "Mobilier Bureau", value: 30, color: "bg-indigo-500" },
              { label: "Accessoires", value: 15, color: "bg-teal-500" },
              { label: "Services", value: 10, color: "bg-amber-500" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOUVELLE SECTION : Ventes récentes du jour */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-sky-500" />
              Dernières ventes du jour
            </h3>
            <button className="text-sm font-semibold text-sky-600 hover:text-sky-700">Voir tout</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg">Heure</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4 rounded-tr-lg text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-medium">{sale.time}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{sale.customer}</td>
                    <td className="py-3 px-4 font-bold text-sky-600">{formatCurrency(sale.amount)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        sale.status === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
