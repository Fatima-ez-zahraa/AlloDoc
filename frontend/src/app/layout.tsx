import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { WhatsAppAssistant } from "@/components/whatsapp-assistant";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AlloDoc",
  description: "Assistant médical intelligent pour les cabinets médicaux marocains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("font-sans", inter.variable)}>
      <body className={cn(inter.className, "bg-brand-dark text-white antialiased selection:bg-brand-teal/30 selection:text-white")}>
        <Navbar />
        {children}
        <WhatsAppAssistant />
      </body>
    </html>
  );
}
