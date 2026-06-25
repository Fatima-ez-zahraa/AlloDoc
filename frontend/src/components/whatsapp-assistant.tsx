"use client";

import { usePathname } from "next/navigation";

const DEFAULT_WHATSAPP_NUMBER = "14155238886";
const DEFAULT_MESSAGE = "Bonjour AlloDoc, je souhaite prendre contact avec vous.";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
    >
      <path d="M16.04 3.2A12.77 12.77 0 0 0 5.22 22.76L3.8 28.8l6.19-1.37A12.78 12.78 0 1 0 16.04 3.2Zm0 2.35a10.43 10.43 0 1 1-5.3 19.42l-.4-.24-3.31.73.76-3.2-.27-.42A10.43 10.43 0 0 1 16.04 5.55Zm-4.48 5.12c-.24 0-.62.09-.95.45-.33.37-1.25 1.22-1.25 2.98s1.28 3.46 1.46 3.69c.18.24 2.47 3.95 6.1 5.38 3.02 1.19 3.64.95 4.3.89.66-.06 2.12-.86 2.42-1.7.3-.83.3-1.54.21-1.7-.09-.14-.33-.23-.69-.41-.36-.18-2.12-1.05-2.45-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.96-1.79-2.14-2-2.5-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.65Z" />
    </svg>
  );
}

function buildWhatsAppUrl() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER;
  const phoneNumber = rawNumber.replace(/\D/g, "");
  const message = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? DEFAULT_MESSAGE;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppAssistant() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-[#25D366]/30 transition hover:-translate-y-0.5 hover:bg-[#20bd5a] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:bottom-6 sm:right-6"
      aria-label="Contacter AlloDoc sur WhatsApp"
      title="Contacter AlloDoc sur WhatsApp"
    >
      <WhatsAppGlyph className="h-9 w-9 transition-transform group-hover:scale-105" />
    </a>
  );
}