import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import "./globals.css";
import { Sidebar } from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "One Connexion — Dashboard",
  description:
    "Espace client One Connexion pour gérer les commandes, le suivi et les communications en toute transparence.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn("flex min-h-screen bg-gray-50 antialiased", inter.className)}>
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
