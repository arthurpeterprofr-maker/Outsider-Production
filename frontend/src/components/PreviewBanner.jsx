import { useState } from "react";
import { Eye, X } from "lucide-react";
import { isPreview } from "../lib/preview";

export const PreviewBanner = () => {
  const [open, setOpen] = useState(isPreview());
  if (!open) return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-white/20 bg-white px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-black shadow-2xl" data-testid="preview-banner">
      <Eye className="h-4 w-4" />Aperçu — non publié
      <button onClick={() => setOpen(false)} aria-label="fermer" data-testid="preview-banner-close"><X className="h-4 w-4" /></button>
    </div>
  );
};
