"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText, Zap, BarChart3, Users, ArrowRight, CheckCircle, Star, Menu, X,
  ChevronRight, Globe, Mail, Phone, Shield, Clock, Calculator, Send, TrendingUp
} from "lucide-react";

/* ─────────────────────── INTERSECTION OBSERVER HOOK ─────────────────────── */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
    }, { threshold: 0.15, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, isInView };
}

/* ─────────────────────── ANIMATED COUNTER ─────────────────────── */
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString("fr-FR")}{suffix}</span>;
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section refs for scroll animation
  const hero = useInView();
  const problems = useInView();
  const features = useInView();
  const howItWorks = useInView();
  const testimonials = useInView();
  const pricing = useInView();
  const finalCta = useInView();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Google Font ── */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ══════════════════════════════════ NAVBAR ══════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm">
                <img src="https://res.cloudinary.com/dwp4isflu/image/upload/v1783543056/logo_anime_1_yqs3cu.png" alt="WiFacture" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">WiFacture</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fonctionnalites" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <a href="#comment-ca-marche" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Comment ça marche</a>
              <a href="#tarifs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
              <a href="#temoignages" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Témoignages</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                Connexion
              </Link>
              <Link href="/login?tab=register" className="px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gray-900 hover:bg-gray-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-900/20">
                Commencer gratuitement
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-6 py-6 space-y-4">
              <a href="#fonctionnalites" onClick={() => setMobileMenu(false)} className="block text-base font-medium text-gray-700 py-2">Fonctionnalités</a>
              <a href="#comment-ca-marche" onClick={() => setMobileMenu(false)} className="block text-base font-medium text-gray-700 py-2">Comment ça marche</a>
              <a href="#tarifs" onClick={() => setMobileMenu(false)} className="block text-base font-medium text-gray-700 py-2">Tarifs</a>
              <a href="#temoignages" onClick={() => setMobileMenu(false)} className="block text-base font-medium text-gray-700 py-2">Témoignages</a>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link href="/login" className="block text-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl border border-gray-200">Connexion</Link>
                <Link href="/login?tab=register" className="block text-center px-4 py-3 text-sm font-semibold text-white rounded-xl bg-gray-900">Commencer gratuitement</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════ HERO ══════════════════════════════════ */}
      <section ref={hero.ref} className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 px-6 lg:px-8 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-50 rounded-full blur-[120px] opacity-60 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-40 translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text */}
            <div className={`flex-1 max-w-2xl transition-all duration-700 ${hero.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-xs font-semibold text-sky-700 tracking-wide uppercase">Facturation intelligente pour l'Afrique</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight text-gray-900 mb-6">
                Créez vos factures.{" "}
                <br className="hidden sm:block" />
                Soyez payé.{" "}
                <span className="relative">
                  <span className="relative z-10 text-sky-600">Sans stress.</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-sky-100 rounded-sm -z-0" />
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-500 leading-relaxed mb-10 max-w-lg">
                Fini les factures sur Word et les calculs de TVA sur Excel. WiFacture automatise votre facturation pour que vous puissiez vous concentrer sur votre business.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
                <Link href="/login?tab=register" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white rounded-full bg-sky-500 hover:bg-sky-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-sky-500/25">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#comment-ca-marche" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-gray-700 rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                  Voir la démo
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-8 lg:gap-12">
                {[
                  { value: 500, suffix: "+", label: "Entrepreneurs" },
                  { value: 98, suffix: "%", label: "Satisfaction" },
                  { value: 50, suffix: "M+", label: "FCFA facturés" },
                ].map((s, i) => (
                  <div key={i} className="text-left">
                    <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                      <Counter end={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-sm text-gray-400 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product Mockup */}
            <div className={`flex-1 w-full max-w-xl transition-all duration-700 delay-200 ${hero.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-5 lg:p-6">
                  {/* Mini Topbar */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tableau de bord</div>
                      <div className="text-lg font-bold text-gray-900 mt-0.5">Vue d'ensemble</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center"><BarChart3 className="h-4 w-4 text-sky-500" /></div>
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Users className="h-4 w-4 text-gray-400" /></div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "Factures", value: "1 250 000", color: "sky" },
                      { label: "Payées", value: "890 000", color: "green" },
                      { label: "En attente", value: "360 000", color: "amber" },
                    ].map((s, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</div>
                        <div className="text-sm font-bold text-gray-900 mt-1">{s.value} <span className="text-[10px] font-medium text-gray-400">FCFA</span></div>
                      </div>
                    ))}
                  </div>

                  {/* Mini Invoice List */}
                  <div className="space-y-2">
                    {[
                      { ref: "INV-2024-001", client: "Sonatel SA", amount: "450 000", status: "Payée", statusColor: "bg-green-100 text-green-700" },
                      { ref: "INV-2024-002", client: "Orange CI", amount: "280 000", status: "Envoyée", statusColor: "bg-amber-100 text-amber-700" },
                      { ref: "INV-2024-003", client: "MTN CM", amount: "520 000", status: "Brouillon", statusColor: "bg-gray-100 text-gray-600" },
                    ].map((inv, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                            <FileText className="h-3.5 w-3.5 text-sky-500" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{inv.ref}</div>
                            <div className="text-[10px] text-gray-400">{inv.client}</div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{inv.amount} FCFA</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${inv.statusColor}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Invoice Card */}
                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 w-48 hidden lg:block" style={{ transform: "rotate(3deg)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-[10px] font-bold text-green-700">Paiement reçu !</span>
                  </div>
                  <div className="text-lg font-extrabold text-gray-900">450 000 <span className="text-xs font-medium text-gray-400">FCFA</span></div>
                  <div className="text-[10px] text-gray-400 mt-1">Sonatel SA — il y a 2 min</div>
                </div>

                {/* Floating Stats Card */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-sky-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-gray-400">Ce mois</div>
                      <div className="text-base font-extrabold text-gray-900 flex items-center gap-1">
                        +23%
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">↑</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ PROBLEMES ══════════════════════════════════ */}
      <section ref={problems.ref} className="py-20 lg:py-28 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${problems.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 mb-4">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Le problème</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              La facturation en Afrique est <span className="text-red-500">encore artisanale</span>
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">Des milliers d'entrepreneurs perdent du temps et de l'argent avec des outils inadaptés.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: FileText,
                title: "Factures non professionnelles",
                desc: "Des factures créées sur Word ou Excel qui ne reflètent pas le sérieux de votre entreprise. Pas de numérotation automatique, pas de suivi.",
                color: "red",
                delay: "delay-0"
              },
              {
                icon: Calculator,
                title: "Calculs manuels de TVA",
                desc: "La TVA à 18% calculée à la main, des erreurs de montant, des clients qui contestent. Du temps perdu qui pourrait être automatisé.",
                color: "orange",
                delay: "delay-100"
              },
              {
                icon: Clock,
                title: "Suivi des paiements impossible",
                desc: "Qui a payé ? Qui doit encore ? Combien de retard ? Sans outil adapté, c'est le flou total sur votre trésorerie.",
                color: "amber",
                delay: "delay-200"
              }
            ].map((p, i) => (
              <div key={i} className={`bg-white rounded-2xl p-7 lg:p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${problems.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 150}ms` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${p.color === "red" ? "bg-red-50" : p.color === "orange" ? "bg-orange-50" : "bg-amber-50"}`}>
                  <p.icon className={`h-6 w-6 ${p.color === "red" ? "text-red-500" : p.color === "orange" ? "text-orange-500" : "text-amber-500"}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ FONCTIONNALITÉS ══════════════════════════════════ */}
      <section ref={features.ref} id="fonctionnalites" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${features.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-4">
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Fonctionnalités</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Tout ce qu'il faut pour <span className="text-sky-600">facturer comme un pro</span>
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">Simple, rapide, et pensé pour les entrepreneurs africains.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileText, title: "Factures pro en 2 clics", desc: "Créez des factures professionnelles avec votre logo, vos coordonnées et une numérotation automatique.", color: "sky" },
              { icon: Zap, title: "TVA 18% automatique", desc: "La TVA est calculée automatiquement sur chaque ligne. Plus jamais d'erreur de calcul.", color: "amber" },
              { icon: BarChart3, title: "Suivi en temps réel", desc: "Tableau de bord avec vue d'ensemble : factures payées, en attente, en retard. Tout est clair.", color: "green" },
              { icon: Users, title: "Gestion clients", desc: "Centralisez vos contacts, historique de facturation et coordonnées en un seul endroit.", color: "violet" },
            ].map((f, i) => (
              <div key={i} className={`group bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 ${features.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${f.color === "sky" ? "bg-sky-50" : f.color === "amber" ? "bg-amber-50" : f.color === "green" ? "bg-green-50" : "bg-violet-50"}`}>
                  <f.icon className={`h-6 w-6 ${f.color === "sky" ? "text-sky-500" : f.color === "amber" ? "text-amber-500" : f.color === "green" ? "text-green-500" : "text-violet-500"}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ COMMENT ÇA MARCHE ══════════════════════════════════ */}
      <section ref={howItWorks.ref} id="comment-ca-marche" className="py-20 lg:py-28 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${howItWorks.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-4">
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">3 étapes simples</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Facturez en <span className="text-sky-600">moins de 5 minutes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: "01", title: "Inscris-toi", desc: "Crée ton compte gratuitement en 30 secondes. Pas de carte bancaire requise.", icon: Shield },
              { step: "02", title: "Crée ta facture", desc: "Ajoute tes produits, ton client, et WiFacture calcule tout automatiquement.", icon: FileText },
              { step: "03", title: "Envoie & suis", desc: "Envoie par email ou WhatsApp, et suis le paiement en temps réel.", icon: Send },
            ].map((s, i) => (
              <div key={i} className={`text-center transition-all duration-700 ${howItWorks.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 150}ms` }}>
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-sky-100 shadow-lg shadow-sky-100/50 flex items-center justify-center">
                    <s.icon className="h-8 w-8 text-sky-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-sky-500 text-white text-xs font-extrabold flex items-center justify-center shadow-lg">{s.step}</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ TÉMOIGNAGES ══════════════════════════════════ */}
      <section ref={testimonials.ref} id="temoignages" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${testimonials.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Témoignages</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Ils facturent <span className="text-sky-600">comme des pros</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Fatou Diagne",
                role: "Fondatrice, Diagne Textiles",
                location: "Dakar, Sénégal",
                text: "Avant WiFacture, je faisais mes factures sur Word. Maintenant, je crée une facture professionnelle en 2 minutes. Mes clients me prennent plus au sérieux.",
                avatar: "FD"
              },
              {
                name: "Kouamé Yao",
                role: "Directeur, AgroTech CI",
                location: "Abidjan, Côte d'Ivoire",
                text: "Le calcul automatique de la TVA m'a changé la vie. Plus d'erreurs, plus de contestations. Et le suivi des paiements est un vrai game-changer.",
                avatar: "KY"
              },
              {
                name: "Ngozi Eze",
                role: "CEO, NexaTech Solutions",
                location: "Douala, Cameroun",
                text: "J'ai essayé plusieurs outils de facturation. WiFacture est le seul qui comprend vraiment les besoins des entrepreneurs africains. FCFA, TVA 18%, tout est là.",
                avatar: "NE"
              }
            ].map((t, i) => (
              <div key={i} className={`bg-white rounded-2xl p-7 lg:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${testimonials.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${(i + 1) * 150}ms` }}>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sm font-bold text-sky-700">{t.avatar}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ TARIFICATION ══════════════════════════════════ */}
      <section ref={pricing.ref} id="tarifs" className="py-20 lg:py-28 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${pricing.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-4">
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Tarifs</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Un prix <span className="text-sky-600">juste et transparent</span>
            </h2>
            <p className="text-lg text-gray-500 mt-4">Commencez gratuitement, évoluez quand vous êtes prêt.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Plan Gratuit */}
            <div className={`bg-white rounded-2xl p-7 lg:p-8 border border-gray-200 shadow-sm transition-all duration-700 ${pricing.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "150ms" }}>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Gratuit</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900">0</span>
                <span className="text-lg font-semibold text-gray-400">FCFA</span>
              </div>
              <div className="text-sm text-gray-400 mb-6">Pendant 1 mois</div>
              <ul className="space-y-3 mb-8">
                {["5 factures / mois", "1 utilisateur", "Calcul TVA auto", "Export PDF"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login?tab=register" className="block text-center px-6 py-3 text-sm font-semibold text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                Commencer gratuitement
              </Link>
            </div>

            {/* Plan Pro — Mis en avant */}
            <div className={`bg-gray-900 rounded-2xl p-7 lg:p-8 border-2 border-sky-500 shadow-2xl shadow-sky-500/10 relative transition-all duration-700 ${pricing.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "300ms" }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-white text-xs font-bold shadow-lg">
                ⭐ Le plus populaire
              </div>
              <div className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">5 000</span>
                <span className="text-lg font-semibold text-gray-400">FCFA</span>
              </div>
              <div className="text-sm text-gray-500 mb-6">/ mois</div>
              <ul className="space-y-3 mb-8">
                {["Factures illimitées", "3 utilisateurs", "Logo sur factures", "Suivi paiements", "Export PDF & WhatsApp", "Support prioritaire"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle className="h-4 w-4 text-sky-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login?tab=register&plan=pro" className="block text-center px-6 py-3.5 text-sm font-bold text-white rounded-xl bg-sky-500 hover:bg-sky-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-sky-500/30">
                Essayer Pro gratuitement (15 jours)
              </Link>
            </div>

            {/* Plan Business */}
            <div className={`bg-white rounded-2xl p-7 lg:p-8 border border-gray-200 shadow-sm transition-all duration-700 ${pricing.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "450ms" }}>
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Business</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-gray-900">10 000</span>
                <span className="text-lg font-semibold text-gray-400">FCFA</span>
              </div>
              <div className="text-sm text-gray-400 mb-6">/ mois</div>
              <ul className="space-y-3 mb-8">
                {["Tout du plan Pro", "Utilisateurs illimités", "Multi-boutiques", "Rapports avancés", "API & intégrations", "Account manager dédié"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login?tab=register&plan=business" className="block text-center px-6 py-3 text-sm font-semibold text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                Essayer gratuitement (15 jours)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ CTA FINAL ══════════════════════════════════ */}
      <section ref={finalCta.ref} className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className={`relative bg-gray-900 rounded-3xl p-10 lg:p-16 text-center overflow-hidden transition-all duration-700 ${finalCta.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Decorative gradient blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500 rounded-full blur-[120px] opacity-20" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-500 rounded-full blur-[120px] opacity-15" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                Rejoins les entrepreneurs qui facturent comme des pros
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
                Plus de 500 entrepreneurs en Afrique de l'Ouest font déjà confiance à WiFacture. Et toi ?
              </p>
              <Link href="/login?tab=register" className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-gray-900 rounded-full bg-white hover:bg-gray-100 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-2xl">
                Commencer gratuitement
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-xs text-gray-500 mt-4">Pas de carte bancaire · Gratuit pour commencer · Annulable à tout moment</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ FOOTER ══════════════════════════════════ */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden">
                  <img src="https://res.cloudinary.com/dwp4isflu/image/upload/v1783543056/logo_anime_1_yqs3cu.png" alt="WiFacture" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-extrabold text-white">WiFacture</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">Facturation simple et moderne pour les entrepreneurs africains.</p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Produit</h4>
              <ul className="space-y-2.5">
                {["Fonctionnalités", "Tarifs", "Intégrations", "API"].map((l, i) => (
                  <li key={i}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Entreprise</h4>
              <ul className="space-y-2.5">
                {["À propos", "Blog", "Carrières", "Contact"].map((l, i) => (
                  <li key={i}><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-gray-400"><Mail className="h-4 w-4" /> contact@wifacture.com</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><Phone className="h-4 w-4" /> +221 78 135 66 77</li>
                <li className="flex items-center gap-2 text-sm text-gray-400"><Globe className="h-4 w-4" /> wifacture.com</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} WiFacture. Tous droits réservés.</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Développé par <a href="https://bambatechnologies.com" target="_blank" className="hover:text-white transition-colors underline">bambatechnologies.com</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
