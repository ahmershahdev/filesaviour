import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Brand mark: shield + secured folder (keyhole) + orbit ring.
 * Same geometry as design/brand/build.mjs (the source for favicon, icons and
 * static/brand/*.svg). Inline here so it inherits theme and costs no request.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const shield = "M32 4C40 7.5 48 9 55 9V30C55 45 45.5 55 32 60C18.5 55 9 45 9 30V9C16 9 24 7.5 32 4Z";
  return (
    <svg viewBox="-1 0 66 64" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4C86FF" /><stop offset="1" stopColor="#1641C8" /></linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD84D" /><stop offset="1" stopColor="#FFAE00" /></linearGradient>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4FC3FF" stopOpacity=".25" /><stop offset=".5" stopColor="#4FC3FF" /><stop offset="1" stopColor="#2D6BFF" /></linearGradient>
      </defs>
      <g transform="rotate(-16 32 40)">
        <path d="M2 40A30 8 0 0 1 62 40" fill="none" stroke={`url(#${id}o)`} strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
      </g>
      <path d={shield} fill={`url(#${id}s)`} />
      <path d="M22.5 14.5h11.5l6 6V31h-17.5Z" fill="#F4F6FB" />
      <path d="M34 14.5v6h6Z" fill="#B9C9EE" />
      <path d="M17 29.5a2.5 2.5 0 0 1 2.5-2.5h7.2l2.6 3h15.2a2.5 2.5 0 0 1 2.5 2.5V45a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3Z" fill={`url(#${id}f)`} />
      <path d="M30.7 38.54L29.7 44.2H34.3L33.3 38.54A2.8 2.8 0 1 0 30.7 38.54Z" fill="#0A0E18" />
      <g transform="rotate(-16 32 40)">
        <path d="M62 40A30 8 0 0 1 2 40" fill="none" stroke={`url(#${id}o)`} strokeWidth="2.6" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display text-[1.2rem] font-bold tracking-[-0.035em]", className)}>
      <LogoMark className="size-9" />
      <span>
        File<span className="text-highlight">Saviour</span>
      </span>
    </span>
  );
}
