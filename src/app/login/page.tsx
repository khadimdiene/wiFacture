"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Headset, ArrowLeft, Eye, EyeOff, Wand2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure at least one uppercase, lowercase, number and special char
    const prefix = "Aa1!";
    generated = prefix + generated.slice(4);
    
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (activeTab === "register") {
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
      }
    } else {
      if (!email || !password) {
        setError("Veuillez remplir tous les champs.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Bouton Retour Accueil */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <ArrowLeft className="h-4 w-4" /> Retour au site
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="relative w-16 h-16 flex items-center justify-center overflow-hidden rounded-xl shadow-sm hover:scale-105 transition-transform duration-200">
            <img 
              src="https://res.cloudinary.com/dwp4isflu/image/upload/v1783543056/logo_anime_1_yqs3cu.png" 
              alt="WiFacture Logo" 
              className="object-cover w-full h-full"
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          WiFacture
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Gérez vos factures en toute simplicité.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "login" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setActiveTab("login"); setError(""); setSuccess(false); }}
            >
              Connexion
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "register" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => { setActiveTab("register"); setError(""); }}
            >
              Inscription
            </button>
          </div>

          {success && activeTab === "register" ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-md bg-green-50 text-green-800 border border-green-200">
                <p className="font-medium text-lg">Inscription réussie !</p>
                <p className="text-sm mt-2">Veuillez vérifier votre boîte de réception pour confirmer votre adresse e-mail.</p>
              </div>
              <Button onClick={() => { setActiveTab("login"); setSuccess(false); }} className="w-full">
                Aller à la connexion
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleAuth}>
              {error && (
                <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              {activeTab === "register" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="fullName">Votre nom complet</Label>
                  <Input 
                    id="fullName" name="fullName" type="text" 
                    placeholder="Amadou Fall"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={activeTab === "register"}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Adresse email</Label>
                <Input 
                  id="email" name="email" type="email" 
                  placeholder="vous@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              {activeTab === "register" ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5 col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <button type="button" onClick={generatePassword} className="text-xs flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium transition-colors">
                        <Wand2 className="h-3 w-3" /> Suggérer un mot de passe fort
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Min. 6 car."
                        value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirmation</Label>
                    <div className="relative">
                      <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Répétez"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox"
                      className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Se souvenir de moi
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="https://wa.me/221781357607" target="_blank" rel="noreferrer"
                      className="font-medium text-sky-600 hover:text-sky-500 transition-colors">
                      Oublié ?
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 text-base bg-[#0F172A] hover:bg-[#1E293B]" disabled={loading}>
                  {loading ? "Chargement..." : activeTab === "login" ? "Se connecter" : "Créer mon compte"}
                </Button>
              </div>
            </form>
          )}

          {/* Support */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Besoin d'aide ?</span>
              </div>
            </div>
            <div className="mt-6">
              <a href="https://wa.me/221781357607" target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-green-200 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors duration-200">
                <Headset className="h-4 w-4" />
                Contacter le support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
