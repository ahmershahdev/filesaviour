import { usePage } from "@inertiajs/react";
import Lenis from "lenis";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";

import Flash from "@/components/site/Flash";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import Seo from "@/components/site/Seo";
import { prefersReducedMotion } from "@/lib/utils";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { url } = usePage();

  // Inertial scrolling for the editorial feel; skipped for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Seo />
      <Header />
      <Flash />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={url.split("?")[0]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
