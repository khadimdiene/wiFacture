"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Store, MonitorSmartphone, Search, ShoppingCart, Trash2, CreditCard, Banknote, CheckCircle, Receipt, XCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface Sale {
  id: string;
  time: string;
  amount: number;
  method: string;
  itemsCount: number;
  status: "Validée" | "Annulée";
}

export default function POSPage() {
  const [store, setStore] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [pendingStore, setPendingStore] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Espèces" | "Carte / OM" | null>(null);
  
  // Fetch stores
  useEffect(() => {
    supabase.from('stores').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setStores(data);
        setStore(data[0].name);
      } else {
        setStores([{ id: 'default', name: 'Boutique Principale (Défaut)' }]);
        setStore('Boutique Principale (Défaut)');
      }
    });
  }, []);
  
  // Historique des ventes du jour
  const [todaySales, setTodaySales] = useState<Sale[]>([]);
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, cartQuantity: qty } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0 || !paymentMethod) return;
    
    // Ajouter à la liste des ventes du jour
    const newSale: Sale = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: cartTotal,
      method: paymentMethod,
      itemsCount: cart.reduce((sum, item) => sum + item.cartQuantity, 0),
      status: "Validée"
    };
    
    setTodaySales([newSale, ...todaySales]);
    
    // Receipt Printing
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html><head><title>Ticket de caisse</title>
        <style>body { font-family: monospace; width: 300px; margin: 0 auto; }</style>
        </head><body>
        <h2 style="text-align: center;">${store}</h2>
        <p style="text-align: center;">Ticket du ${newSale.time}</p>
        <hr/>
        ${cart.map(item => `
          <div style="display: flex; justify-content: space-between;">
            <span>${item.name} x${item.cartQuantity}</span>
            <span>${item.price * item.cartQuantity}</span>
          </div>
        `).join('')}
        <hr/>
        <h3>Total: ${cartTotal} FCFA</h3>
        <p>Paiement: ${paymentMethod}</p>
        <p style="text-align: center;">Merci de votre visite !</p>
        </body></html>
      `);
      setTimeout(() => receiptWindow.print(), 500);
    }
    
    setCart([]);
    setPaymentMethod(null);
  };

  const confirmCancelSale = () => {
    if (cancelTarget) {
      setTodaySales(todaySales.map(s => s.id === cancelTarget.id ? { ...s, status: "Annulée" } : s));
      setCancelTarget(null);
    }
  };

  const handleStoreChangeRequest = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingStore(e.target.value);
  };

  const confirmStoreChange = () => {
    if (pendingStore) {
      setStore(pendingStore);
      setCart([]); // vider le panier quand on change de boutique
      setPendingStore(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Modale de changement de boutique */}
      <ConfirmModal
        isOpen={!!pendingStore}
        title="Changer de boutique"
        message="Voulez-vous vraiment basculer vers une autre boutique ? Le panier actuel sera vidé."
        confirmLabel="Oui, basculer"
        cancelLabel="Annuler"
        variant="warning"
        onConfirm={confirmStoreChange}
        onCancel={() => setPendingStore(null)}
      />

      {/* Modale d'annulation de vente */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Annuler la vente"
        message={`Êtes-vous sûr de vouloir annuler cette vente de ${cancelTarget ? formatCurrency(cancelTarget.amount) : ''} ?`}
        confirmLabel="Oui, Annuler"
        cancelLabel="Retour"
        variant="danger"
        onConfirm={confirmCancelSale}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <MonitorSmartphone className="h-6 w-6 text-sky-500" />
          Caisse - POS
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 w-64">
            <Store className="h-4 w-4 text-gray-500 ml-2 shrink-0" />
            <select 
              value={store} 
              onChange={handleStoreChangeRequest} 
              className="border-none bg-transparent font-medium text-gray-700 h-8 py-0 focus:ring-0 w-full outline-none"
            >
              <option value="" disabled>Sélectionnez une boutique</option>
              {stores.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        
        {/* Left: Products Grid */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
          <div className="p-4 border-b border-gray-200 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher un produit (code barre ou nom)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-12 text-lg bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-sky-400 hover:shadow-md transition-all active:scale-95 group flex flex-col h-32 justify-between"
                >
                  <div className="text-xs font-semibold text-sky-600 bg-sky-50 self-start px-2 py-0.5 rounded-md mb-2">
                    {product.category}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sky-600 font-bold mt-2">{formatCurrency(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Cart Panel */}
        <div className="w-full lg:w-[350px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm shrink-0 min-h-[400px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Panier Actuel
            </h2>
            <span className="bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {cart.length} articles
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
                <p>Le panier est vide</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between group">
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-md border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-l-md transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.cartQuantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-r-md transition-colors"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Selection */}
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total TTC</span>
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
            </div>
            
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Moyen de paiement</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                variant={paymentMethod === "Espèces" ? "default" : "outline"} 
                className={`gap-2 h-12 ${paymentMethod === "Espèces" ? "bg-sky-600 hover:bg-sky-700" : "bg-gray-50 text-gray-700"}`} 
                onClick={() => setPaymentMethod("Espèces")} 
                disabled={cart.length === 0}
              >
                <Banknote className="h-4 w-4" /> Espèces
              </Button>
              <Button 
                variant={paymentMethod === "Carte / OM" ? "default" : "outline"} 
                className={`gap-2 h-12 ${paymentMethod === "Carte / OM" ? "bg-sky-600 hover:bg-sky-700" : "bg-gray-50 text-gray-700"}`} 
                onClick={() => setPaymentMethod("Carte / OM")} 
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4" /> Carte / OM
              </Button>
            </div>
            
            <Button 
              className="w-full h-14 text-lg gap-2 bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all" 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || !paymentMethod}
            >
              <CheckCircle className="h-5 w-5" /> Encaisser
            </Button>
          </div>
        </div>

        {/* Right: TPE Receipt Preview */}
        <div className="w-full lg:w-[320px] flex flex-col bg-gray-100 rounded-xl shadow-inner border border-gray-200 overflow-hidden shrink-0 min-h-[400px]">
          <div className="p-4 bg-gray-200 border-b border-gray-300 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-gray-600" />
            <h2 className="font-bold text-gray-800">Aperçu Ticket TPE</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex justify-center">
            {/* Ticket TPE Paper */}
            <div className="bg-white w-full max-w-[280px] min-h-full p-4 shadow-sm text-sm font-mono text-gray-800" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 2px, #f9fafb 2px, #f9fafb 4px)" }}>
              <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
                <h3 className="font-bold text-lg mb-1">WiFacture</h3>
                <p className="text-xs text-gray-500">{store}</p>
                <p className="text-xs text-gray-500">{formatDate(new Date().toISOString().split('T')[0])}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                {cart.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 italic">Ticket vide</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <p className="font-bold">{item.cartQuantity}x {item.name.substring(0, 15)}...</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        {formatCurrency(item.price * item.cartQuantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
                  <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL TTC</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {paymentMethod && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Paiement</span>
                      <span>{paymentMethod}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-dashed border-gray-400">
                <p>Merci de votre visite !</p>
                <p className="mt-1 text-[10px]">Propulsé par WiFacture</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Ventes du jour */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shrink-0 mt-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-500" />
            Historique des Ventes (Aujourd'hui)
          </h2>
          <span className="bg-sky-50 text-sky-600 text-xs font-bold px-2 py-1 rounded-md">
            {todaySales.filter(s => s.status === 'Validée').length} ventes
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Heure</th>
                <th className="py-3 px-4">Méthode</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todaySales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400 italic">Aucune vente pour le moment.</td>
                </tr>
              ) : (
                todaySales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">{sale.time}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.method}</td>
                    <td className="py-3 px-4 text-gray-600">{sale.itemsCount} article(s)</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(sale.amount)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        sale.status === 'Validée' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sale.status === 'Validée' && (
                        <button 
                          onClick={() => setCancelTarget(sale)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
