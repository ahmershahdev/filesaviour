# FileSaviour — "Vault" design system

## Direction

**Concept: the vault.** The logo is a shield, a folder with a vault dial, and an orbit ring. The site builds on that: files orbit a glowing core and are pulled in, kept safe. The tone is editorial and calm, the opposite of ad-cluttered converter sites.

What makes it feel award-level rather than template-level:

1. **Oversized editorial type**: fluid display sizes up to 13rem, tight tracking, serif-italic emphasis words (“Every file, *saved.*”).
2. **One signature 3D moment**: the WebGL vault orbit on the home hero. Everywhere else is fast, flat and type-led.
3. **Function as spectacle**: the dropzone is a "vault door" with rings that respond to a dragged file, the whole page accepts drops ("Let go."), and dropping any file on the home page suggests the right tools.
4. **Editorial index lists** for categories (numbered rows, sticky category titles, parallax counts) instead of icon-card grids everywhere.
5. **Texture and restraint**: a single SVG film grain, hairline borders and one accent per category.

## Tokens (`frontend/src/styles/app.css`)

Raw palette lives in `@theme`. Components only use semantic tokens, which switch per theme:

| Semantic | Dark (default) | Light ("paper") |
|---|---|---|
| `bg` | `#05070D` ink | `#F3F1EA` warm paper |
| `fg` | `#F4F6FB` | ink |
| `fg-muted` / `fg-faint` | `#9AA3B8` / `#4A5470` | `#4B5368` / `#8A8F9C` |
| `line` / `line-strong` | white 10% / 20% | ink 11% / 22% |
| `accent` | vault blue `#2D6BFF` | `#1D52E0` |
| `highlight` | signal yellow `#FFC21A` | same |

**Category accents:** PDF = vault blue, Image = sky `#4FC3FF`, AI = signal yellow, Utility = mint `#3DDC97`. **Runtime badges:** In browser = mint, Secure server = sky, AI = yellow.

## Type

| Role | Font | Utility |
|---|---|---|
| Display | Bricolage Grotesque Variable | `text-mega` (≤13rem), `text-display` (≤7.5rem), `text-headline`, `text-title` |
| Emphasis | Instrument Serif *italic* | `.serif-em` |
| Body / UI | Geist Variable | `text-lede` for intros |
| Data / labels | Geist Mono Variable | `.eyebrow`, file sizes, counters |

All fonts are self-hosted via Fontsource (no Google Fonts request, no layout shift from a third-party CSS file).

## Motion

- Easing: `--ease-out-expo` for entrances; durations of 0.5–0.9 s.
- Page transitions: 12px fade-up via Motion `AnimatePresence`.
- Reveals: `Reveal` component triggers once at 10% in-view.
- Lenis inertial scroll (lerp 0.12).
- `prefers-reduced-motion`: animations collapse to 0.01 ms, Lenis is skipped, WebGL is replaced by the static SVG orbit.

## WebGL hero (`components/webgl/VaultScene.tsx`)

- 600 / 1000 / 1400 paper sheets (by viewport) in **one InstancedMesh draw call**, orbiting a fresnel-shaded core with dial spokes and a point light.
- Pointer parallax tilt. Scroll progress pulls sheets into the core (files saved into the vault).
- Deterministic seeded layout, DPR capped at 1.75, render loop **stops** when off-screen or the tab is hidden, and the camera pulls back on portrait screens.
- Loaded with `React.lazy` during idle time **after** the headline paints. The static SVG orbit is the LCP-safe first frame and the fallback for no-WebGL and reduced motion.

## Components

`Header` (sticky, blurs on scroll, ⌘K) · `CommandPalette` (lazy cmdk) · `Footer` (oversized outline wordmark) · `ToolCard` / `ToolRow` · `Dropzone` (`compact` pill variant) · `SmartDrop` · `RuntimeBadge` · `StatusBadge` · `Button` / `ButtonLink` · `Field` · `Reveal` · `SectionHeading` · `AppLayout` (dashboard/console sidebar) · `AuthShell` (split screen).

## Accessibility

Skip link; visible `:focus-visible` ring (yellow on dark, blue on light); semantic landmarks; breadcrumbs with `aria-current`; `aria-live` on results and progress; native `<details>` FAQ; WebGL `aria-hidden` with real text in the DOM; `prefers-reduced-transparency` removes the grain. Body text contrast meets AA on both themes.

## Performance budget

| Metric | Target |
|---|---|
| LCP (tool pages, 4G) | < 2.0 s |
| JS on tool pages (gzip) | ~185 KB shared (React, Inertia, Motion) + page chunk. pdf-lib, cmdk and three.js are lazy. |
| CLS | < 0.05 (self-hosted fonts, fixed media sizes) |
| Home WebGL | three.js chunk (~243 KB gz) only after idle, never blocks LCP |

Next optimisations: Motion `LazyMotion` + `m` components to trim the shared chunk; route-level prefetch on hover (Inertia `prefetch`).
