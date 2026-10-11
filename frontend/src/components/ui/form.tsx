import { Check, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldChrome = { label: string; error?: string; hint?: ReactNode; icon?: LucideIcon; aside?: ReactNode };

const CONTROL =
  "peer w-full rounded-2xl border bg-surface text-fg outline-none transition-[border-color,background-color,box-shadow] duration-300 " +
  "placeholder:text-fg-faint hover:border-line-strong focus:border-highlight focus:bg-surface-2 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--highlight)_18%,transparent)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/** Label, control, then either the error or the hint, wired up with aria-describedby. */
function Shell({ id, label, error, hint, aside, children }: Omit<FieldChrome, "icon"> & { id: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="text-sm text-coral-400">{error}</p>
      ) : (
        hint && <p id={`${id}-msg`} className="text-sm text-fg-faint">{hint}</p>
      )}
    </div>
  );
}

export function Field({ label, error, hint, icon: Icon, aside, className, ...props }: ComponentProps<"input"> & FieldChrome) {
  const id = props.id ?? props.name ?? label;
  return (
    <Shell id={id} label={label} error={error} hint={hint} aside={aside}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(CONTROL, "h-13 px-4", Icon && "pl-11", error ? "border-coral-400" : "border-line", className)}
          {...props}
        />
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-faint transition peer-focus:text-highlight" aria-hidden />}
      </div>
    </Shell>
  );
}

/** Rough strength score (0–4): length plus character variety. Guidance only; the server validates. */
export function passwordScore(pw: string): number {
  if (!pw) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^\w\s]/].filter((r) => r.test(pw)).length;
  return Math.min(4, (pw.length >= 10 ? 1 : 0) + (pw.length >= 14 ? 1 : 0) + (variety >= 2 ? 1 : 0) + (variety >= 3 ? 1 : 0));
}

const STRENGTH = [
  { label: "Too short", color: "var(--color-coral-400)" },
  { label: "Weak", color: "var(--color-coral-400)" },
  { label: "Okay", color: "var(--color-signal-500)" },
  { label: "Strong", color: "var(--color-mint-400)" },
  { label: "Excellent", color: "var(--color-mint-400)" },
];

export function PasswordField({ label, error, hint, aside, meter = false, className, ...props }: Omit<ComponentProps<"input">, "type"> & Omit<FieldChrome, "icon"> & { meter?: boolean }) {
  const id = props.id ?? props.name ?? label;
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const value = String(props.value ?? "");
  const score = passwordScore(value);
  const caps = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <Shell id={id} label={label} error={error} hint={capsLock ? "Caps Lock is on." : hint} aside={aside}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={error || hint || capsLock ? `${id}-msg` : undefined}
          autoCapitalize="none"
          spellCheck={false}
          onKeyUp={caps}
          onKeyDown={caps}
          className={cn(CONTROL, "h-13 pl-4 pr-13", error ? "border-coral-400" : "border-line", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-fg-faint transition hover:bg-surface-2 hover:text-fg"
        >
          <span className="relative size-[1.125rem]">
            <Eye className={cn("absolute inset-0 size-full transition duration-300", visible ? "scale-50 opacity-0" : "scale-100 opacity-100")} aria-hidden />
            <EyeOff className={cn("absolute inset-0 size-full transition duration-300", visible ? "scale-100 opacity-100" : "scale-50 opacity-0")} aria-hidden />
          </span>
        </button>
      </div>
      {meter && value && (
        <div className="flex items-center gap-3" aria-live="polite">
          <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1 rounded-full bg-line transition-colors duration-500" style={i <= score ? { background: STRENGTH[score].color } : undefined} />
            ))}
          </div>
          <span className="w-18 text-right font-mono text-[0.7rem] uppercase tracking-wider" style={{ color: STRENGTH[score].color }}>{STRENGTH[score].label}</span>
        </div>
      )}
    </Shell>
  );
}

export function TextArea({ label, error, hint, aside, className, ...props }: ComponentProps<"textarea"> & Omit<FieldChrome, "icon">) {
  const id = props.id ?? props.name ?? label;
  return (
    <Shell id={id} label={label} error={error} hint={hint} aside={aside}>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(CONTROL, "min-h-40 resize-y px-4 py-3.5 leading-relaxed", error ? "border-coral-400" : "border-line", className)}
        {...props}
      />
    </Shell>
  );
}

export function Checkbox({ children, className, ...props }: Omit<ComponentProps<"input">, "type"> & { children: ReactNode }) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3 text-sm text-fg-muted", className)}>
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input type="checkbox" className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-surface transition checked:border-highlight checked:bg-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" {...props} />
        <Check className="pointer-events-none relative size-3.5 scale-50 stroke-[3] text-highlight-fg opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100" aria-hidden />
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}
