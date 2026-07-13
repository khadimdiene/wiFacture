"use client";

import { useState } from "react";
import { Package, Plus, Search, Edit2, Trash2, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  totalValue: number;
}

const initialProducts: Product[] = [
  { id: "p1", name: "Ordinateur portable HP ProBook", category: "Informatique", sku: "HP-PB-450", quantity: 12, minQuantity: 5, unitPrice: 850000, totalValue: 12 * 850000 },
  { id: "p2", name: "Imprimante Canon PIXMA", category: "Bureautique", sku: "CN-PIX-G3411", quantity: 4, minQuantity: 5, unitPrice: 195000, totalValue: 4 * 195000 },
  { id: "p3", name: "Chaise de bureau ergonomique", category: "Mobilier", sku: "CHB-ERG-001", quantity: 18, minQuantity: 3, unitPrice: 75000, totalValue: 18 * 75000 },
  { id: "p4", name: "Câble USB-C 2m", category: "Accessoires", sku: "USB-C-2M", quantity: 35, minQuantity: 10, unitPrice: 8500, totalValue: 35 * 8500 },
  { id: "p5", name: "Modem 4G LTE Huawei", category: "Réseau", sku: "HW-4G-B818", quantity: 3, minQuantity: 5, unitPrice: 65000, totalValue: 3 * 65000 },
  { id: "p6", name: "Papier A4 500 feuilles", category: "Fournitures", sku: "PAP-A4-500", quantity: 200, minQuantity: 50, unitPrice: 3500, totalValue: 200 * 3500 },
];

export default function InventairePage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "", sku: "", quantity: "", minQuantity: "", unitPrice: "" });

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((a, p) => a + p.totalValue, 0);
  const lowStock = products.filter(p => p.quantity <= p.minQuantity).length;

  const openModal = (product?: Product) => {
    if (product) {
      setEditProduct(product);
      setForm({ name: product.name, category: product.category, sku: product.sku, quantity: String(product.quantity), minQuantity: String(product.minQuantity), unitPrice: String(product.unitPrice) });
    } else {
      setEditProduct(null);
      setForm({ name: "", category: "", sku: "", quantity: "", minQuantity: "", unitPrice: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(form.quantity) || 0;
    const price = parseInt(form.unitPrice) || 0;
    const product: Product = {
      id: editProduct?.id || Date.now().toString(),
      name: form.name,
      category: form.category,
      sku: form.sku,
      quantity: qty,
      minQuantity: parseInt(form.minQuantity) || 0,
      unitPrice: price,
      totalValue: qty * price,
    };
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setProducts(products.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le produit"
        message={`Supprimer définitivement "${deleteTarget?.name}" du stock ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-sky-500" />
          Gestion de Stock (Inventaire)
        </h1>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valeur totale du stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +8% ce mois
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Références en stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{products.length} produits</p>
          <div className="flex items-center gap-1 text-xs text-sky-600 mt-2 font-semibold">
            <Package className="h-3.5 w-3.5" /> {filtered.length} affichés
          </div>
        </div>
        <div className={`bg-white rounded-xl border shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${lowStock > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock faible</p>
          <p className={`text-2xl font-bold mt-2 ${lowStock > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStock} article(s)</p>
          {lowStock > 0 && (
            <div className="flex items-center gap-1 text-xs text-red-600 mt-2 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> Réapprovisionnement nécessaire
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 min-w-[800px]">
            <thead className="bg-gray-50/75 text-gray-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-5 border-b border-gray-200">Produit</th>
                <th className="py-3.5 px-4 border-b border-gray-200">SKU</th>
                <th className="py-3.5 px-4 border-b border-gray-200">Catégorie</th>
                <th className="py-3.5 px-4 border-b border-gray-200 text-center">Quantité</th>
                <th className="py-3.5 px-4 border-b border-gray-200 text-right">Prix unitaire</th>
                <th className="py-3.5 px-4 border-b border-gray-200 text-right">Valeur stock</th>
                <th className="py-3.5 px-5 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(product => {
                const isLow = product.quantity <= product.minQuantity;
                return (
                  <tr key={product.id} className="hover:bg-sky-50/20 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{product.sku}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{product.category}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isLow && <AlertTriangle className="h-3 w-3" />}
                        {product.quantity} unités
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-800">{formatCurrency(product.unitPrice)}</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900">{formatCurrency(product.totalValue)}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openModal(product)} className="p-1.5 text-gray-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-all" title="Modifier">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(product)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-all" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editProduct ? "Modifier le produit" : "Nouveau produit"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Nom du produit</Label>
            <Input id="pname" required placeholder="Ex: Ordinateur portable HP" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="psku">SKU / Référence</Label>
              <Input id="psku" placeholder="HP-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pcat">Catégorie</Label>
              <Input id="pcat" placeholder="Informatique" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pqty">Quantité en stock</Label>
              <Input id="pqty" type="number" min="0" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pminqty">Quantité min. alerte</Label>
              <Input id="pminqty" type="number" min="0" value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pprice">Prix unitaire (FCFA)</Label>
            <Input id="pprice" type="number" min="0" required placeholder="0" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
