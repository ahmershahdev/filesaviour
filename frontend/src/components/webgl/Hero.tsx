import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/utils";

const VaultScene = lazy(() => import("./VaultScene"));

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Decides between the live WebGL scene and the static vector fallback.
 * The fallback renders on the server and first paint, so LCP never waits on three.js.
 */
export default function HeroVisual() {
  const progress = useRef(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !supportsWebGL()) return;
    // Let the headline paint first, then bring in the scene during idle time.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250));
    const id = idle(() => setLive(true));
    const onScroll = () => {
      progress.current = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelIdleCallback?.(id as number);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)]">
      <StaticOrbit faded={live} />
      {live && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 animate-[rise_1.6s_var(--ease-out-expo)_both]">
            <VaultScene progress={progress} />
          </div>
        </Suspense>
      )}
    </div>
  );
}

function StaticOrbit({ faded }: { faded: boolean }) {
  return (
    <svg viewBox="-200 -200 400 400" className={`absolute inset-0 m-auto h-full w-full max-w-[70rem] transition-opacity duration-[1.5s] ${faded ? "opacity-0" : "opacity-100"}`}>
      <defs>
        <radialGradient id="core" r="0.5">
          <stop offset="0" stopColor="#ffc21a" />
          <stop offset="0.55" stopColor="#ff9f1a" stopOpacity="0.6" />
          <stop offset="1" stopColor="#2d6bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="70" fill="url(#core)" opacity="0.55" />
      <g transform="rotate(-14) scale(1 0.32)">
        <circle r="150" fill="none" stroke="#4fc3ff" strokeOpacity="0.45" strokeWidth="1.2" className="origin-center animate-spin-slow" strokeDasharray="420 60" />
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return <rect key={i} x={Math.cos(a) * 150 - 4} y={Math.sin(a) * 150 - 6} width="8" height="11" rx="1" fill={i % 9 === 0 ? "#ffc21a" : i % 5 === 0 ? "#2d6bff" : "#eef1f8"} opacity="0.75" />;
        })}
      </g>
    </svg>
  );
}
