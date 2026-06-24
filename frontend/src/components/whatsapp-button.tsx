import { MessageCircle } from "lucide-react";

const whatsappPhone =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "212XXXXXXXXX";

const defaultMessage = encodeURIComponent(
  "Bonjour AlloDoc, je souhaite prendre rendez-vous.",
);

export function WhatsAppButton() {
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ouvrir WhatsApp"
      className="fixed bottom-5 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-brand-dark sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  );
}
