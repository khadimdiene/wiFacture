import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WiFacture SaaS Dashboard",
  description: "Dashboard de facturation pour entrepreneurs africains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.className} h-full antialiased bg-gray-50`}>
      <body className="min-h-full flex flex-col text-slate-800">{children}</body>
    </html>
  );
}
