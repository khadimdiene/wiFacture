"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, 
  Calculator, 
  ShoppingCart, 
  Briefcase, 
  MonitorSmartphone, 
  Box, 
  Wrench, 
  Truck, 
  Users, 
  Contact, 
  BarChart3, 
  Settings, 
  Headset,
  ChevronRight,
  ChevronDown,
  LogOut,
  Repeat,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Comptabilité", href: "/accounting", icon: Calculator },
  { name: "Achats", href: "/purchases", icon: ShoppingCart },
  { 
    name: "Ventes", 
    href: "#", 
    icon: Briefcase,
    isActive: true,
    children: [
      { name: "Factures", href: "/invoices", isCurrent: true },
      { name: "Devis", href: "/quotes" },
      { name: "Bons de commande", href: "/orders" },
    ]
  },
  { name: "Point de Vente (POS)", href: "/pos", icon: MonitorSmartphone },
  { name: "Inventaire", href: "/inventory", icon: Box },
  { name: "Fabrication", href: "/manufacturing", icon: Wrench },
  { name: "Logistique", href: "/logistics", icon: Truck },
  { name: "Rôles & Utilisateurs", href: "/hr", icon: Users },
  { name: "Contacts", href: "/contacts", icon: Contact },
  { name: "Cessions", href: "/cessions", icon: Repeat },
  { name: "Rapports", href: "/reporting", icon: BarChart3 },
  { name: "Paramètres", href: "/settings", icon: Settings },
  { name: "Admin SaaS", href: "/admin", icon: ShieldAlert },
];

const others = [
  { name: "Paramètres", href: "/settings", icon: Settings },
  { name: "Support WhatsApp", href: "https://wa.me/221770000000", icon: Headset },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [salesOpen, setSalesOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleLinkClick = (href: string) => {
    if (mobile && onClose && href !== "#") {
      onClose();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-md transition-transform duration-300 hover:rotate-12">
            <img 
              src="https://res.cloudinary.com/dwp4isflu/image/upload/v1783543056/logo_anime_1_yqs3cu.png" 
              alt="WiFacture Logo" 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <span className="font-bold text-lg leading-tight block text-gray-900 tracking-tight transition-all duration-300 hover:text-sky-500 cursor-pointer">
              WiFacture
            </span>
          </div>
        </div>
        {!mobile && (
          <button className="ml-auto text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 hide-scrollbar">
        <div className="text-xs font-semibold text-gray-400 mb-2 px-3 tracking-wider">MAIN</div>
        <nav className="flex flex-1 flex-col space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <button
                  onClick={() => setSalesOpen(!salesOpen)}
                  className={cn(
                    "w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                    item.isActive
                      ? "bg-sky-400 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-200",
                        item.isActive ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {salesOpen ? (
                    <ChevronDown size={16} className={item.isActive ? "text-white" : "text-gray-400"} />
                  ) : (
                    <ChevronRight size={16} className={item.isActive ? "text-white" : "text-gray-400"} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => handleLinkClick(item.href)}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                    pathname === item.href
                      ? "bg-sky-400 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors duration-200",
                      pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )}
              
              {item.children && salesOpen && (
                <div className="mt-1 space-y-1 pl-11">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={() => handleLinkClick(child.href)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm transition-all duration-200 hover:pl-4 active:scale-[0.98]",
                        child.isCurrent
                          ? "text-sky-500 font-semibold"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Others Navigation */}
          <div className="text-xs font-semibold text-gray-400 mt-6 mb-2 px-3 tracking-wider">OTHERS</div>
          {others.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleLinkClick(item.href)}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                pathname === item.href
                  ? "bg-sky-400 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                )} 
              />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-medium text-sky-600">
              {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-gray-900 truncate">Utilisateur</div>
            <div className="text-xs text-gray-500 truncate">{userEmail ?? "Non connecté"}</div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
