import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[80svh] place-items-center pt-24 text-center">
      <div>
        <p className="outline-type font-display text-[clamp(8rem,30vw,22rem)] font-bold leading-none tracking-tighter">404</p>
        <h1 className="text-headline -mt-6">This file got <span className="serif-em text-highlight">lost</span>.</h1>
        <p className="text-lede mx-auto mt-4 max-w-md text-fg-muted">The page moved or never existed. Press ⌘K to find any tool.</p>
        <div className="mt-10 flex justify-center gap-3">
          <ButtonLink href="/" variant="highlight">Back home</ButtonLink>
          <ButtonLink href="/tools" variant="ghost">All tools</ButtonLink>
        </div>
      </div>
    </div>
  );
}
