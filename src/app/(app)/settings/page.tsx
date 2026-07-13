"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, CheckCircle, AlertTriangle, Building, CreditCard, Users, FileText, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [isDirty, setIsDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("company");
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    legal_name: "",
    logo_url: "",
    ninea: "",
    rccm: "",
    social_address: "",
    email: "",
    pro_phone: "",
    region: "Dakar",
    currency: "XOF",
    invoice_template: "Standard"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('company_settings').select('*').limit(1).single();
      if (data && !error) {
        setSettingsId(data.id);
        setForm({
          legal_name: data.legal_name || "",
          logo_url: data.logo_url || "",
          ninea: data.ninea || "",
          rccm: data.rccm || "",
          social_address: data.social_address || "",
          email: data.email || "",
          pro_phone: data.pro_phone || "",
          region: data.region || "Dakar",
          currency: data.currency || "XOF",
          invoice_template: data.invoice_template || "Standard"
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSaved(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `logo_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(data.path);
      handleChange('logo_url', urlData.publicUrl);
    }
    setLogoUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsId) {
      await supabase.from('company_settings').update(form).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('company_settings').insert([form]).select().single();
      if (data) setSettingsId(data.id);
    }
    
    setIsDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {showUnsaved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div className="relative z-[101] w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 m-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Modifications non enregistrées</h3>
                <p className="text-sm text-gray-500 mt-2">Voulez-vous enregistrer vos modifications avant de quitter ?</p>
              </div>
              <div className="flex flex-col w-full gap-2 mt-4">
                <Button className="w-full" onClick={(e) => { handleSave(e as React.FormEvent); setShowUnsaved(false); }}>
                  Enregistrer et Quitter
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setShowUnsaved(false); setIsDirty(false); }}>
                  Ignorer les modifications
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowUnsaved(false)}>
                  Rester sur la page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold text-sm">Modifications enregistrées avec succès !</span>
        </div>
      )}

      <div className="border-b border-gray-200 pb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-sky-500" />
          Paramètres
        </h1>
        {isDirty && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
            Modifications non enregistrées
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {[
          { id: 'company', label: 'Profil Entreprise', icon: Building },
          { id: 'preferences', label: 'Région & Devises', icon: FileText },
          { id: 'templates', label: 'Modèles', icon: FileText },
          { id: 'stores', label: 'Boutiques', icon: Building },
          { id: 'team', label: 'Équipe & Accès', icon: Users },
          { id: 'billing', label: 'Abonnement', icon: CreditCard },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-sky-100 text-sky-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {activeTab === 'company' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Informations Légales</h2>
                <p className="text-sm text-gray-500 mt-1">Les détails officiels de votre entreprise pour la facturation.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Logo de l'entreprise</Label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                      {form.logo_url ? (
                        <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    {/* Controls */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={logoUploading}
                        >
                          {logoUploading ? (
                            <><div className="h-4 w-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />Envoi en cours...</>
                          ) : (
                            <><Upload className="h-4 w-4" />Choisir un logo</>
                          )}
                        </Button>
                        {form.logo_url && (
                          <button
                            type="button"
                            onClick={() => handleChange('logo_url', '')}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG · Max 2 Mo · Recommandé : fond transparent</p>
                    </div>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="legal_name">Nom Légal de l'entreprise</Label>
                  <Input id="legal_name" value={form.legal_name} onChange={e => handleChange('legal_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ninea">NINEA / SIRET</Label>
                  <Input id="ninea" value={form.ninea} onChange={e => handleChange('ninea', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rccm">Registre de Commerce (RCCM)</Label>
                  <Input id="rccm" value={form.rccm} onChange={e => handleChange('rccm', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="social_address">Adresse Sociale</Label>
                  <Input id="social_address" value={form.social_address} onChange={e => handleChange('social_address', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Professionnel</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pro_phone">Téléphone Professionnel</Label>
                  <Input id="pro_phone" type="tel" value={form.pro_phone} onChange={e => handleChange('pro_phone', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Région et Devises</h2>
                <p className="text-sm text-gray-500 mt-1">Configurez votre monnaie et région par défaut.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <select id="region" value={form.region} onChange={e => handleChange('region', e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="Dakar">Dakar, Sénégal</option>
                    <option value="Abidjan">Abidjan, Côte d'Ivoire</option>
                    <option value="Bamako">Bamako, Mali</option>
                    <option value="Paris">Paris, France</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise Principale</Label>
                  <select id="currency" value={form.currency} onChange={e => handleChange('currency', e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="XOF">Franc CFA (XOF)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar US ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modèles de Facture</h2>
                <p className="text-sm text-gray-500 mt-1">Choisissez l'apparence de vos documents générés.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoice_template">Thème</Label>
                  <select id="invoice_template" value={form.invoice_template} onChange={e => handleChange('invoice_template', e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5">
                    <option value="Standard">Standard (Classique)</option>
                    <option value="Modern">Moderne (Couleurs d'accent)</option>
                    <option value="Minimal">Minimaliste</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4 text-center text-sm text-gray-500">
                Aperçu du modèle {form.invoice_template} (Bientôt disponible)
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mes Boutiques</h2>
                <p className="text-sm text-gray-500 mt-1">Créez et gérez les boutiques accessibles dans votre Caisse (POS).</p>
              </div>
              
              <div className="space-y-4">
                <Button type="button" onClick={() => {
                  const name = prompt("Nom de la boutique :");
                  if (name) {
                    supabase.from('stores').insert([{ name }]).then(() => alert("Boutique créée avec succès. Rechargez pour voir."));
                  }
                }} className="mb-4">
                  + Ajouter une boutique
                </Button>
                <div className="p-4 bg-sky-50 rounded-lg text-sm text-sky-800">
                  <p>Les boutiques seront listées ici prochainement. Pour l'instant, vous pouvez les créer et elles s'afficheront dans votre POS.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Équipe et Accès</h2>
                <p className="text-sm text-gray-500 mt-1">Gérez qui peut accéder à WiFacture.</p>
              </div>
              <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">Gestion d'équipe (Bêta)</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2 mb-4">
                  Vous êtes actuellement l'unique administrateur. L'invitation de membres sera disponible dans une prochaine mise à jour.
                </p>
                <Button variant="outline" disabled>Inviter un membre</Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            {isDirty && (
              <Button type="button" variant="ghost" className="text-gray-500" onClick={() => setShowUnsaved(true)}>
                Annuler
              </Button>
            )}
            <Button type="submit" className="ml-auto gap-2 bg-sky-600 hover:bg-sky-700">
              <CheckCircle className="h-4 w-4" />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
