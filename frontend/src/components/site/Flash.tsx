import { usePage } from "@inertiajs/react";
import { Check, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type FlashMessage = { message: string; level?: string; tags?: string };

/** Django messages arrive on the page object's top-level `flash.messages`. */
export default function Flash() {
  const page = usePage() as unknown as { flash?: { messages?: FlashMessage[] } };
  const messages = page.flash?.messages ?? [];
  const [visible, setVisible] = useState<FlashMessage[]>([]);

  useEffect(() => {
    if (!messages.length) return;
    setVisible(messages);
    const t = setTimeout(() => setVisible([]), 5000);
    return () => clearTimeout(t);
  }, [messages]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-24 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {visible.map((m, i) => (
          <motion.div
            key={m.message + i}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-line-strong bg-bg-raised py-2 pl-3 pr-2 text-sm shadow-xl shadow-black/20"
          >
            <span className="grid size-6 place-items-center rounded-full bg-mint-400 text-ink-950"><Check className="size-3.5" /></span>
            {m.message}
            <button className="grid size-7 place-items-center rounded-full text-fg-faint hover:text-fg" aria-label="Dismiss" onClick={() => setVisible([])}>
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
