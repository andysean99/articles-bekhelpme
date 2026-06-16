import Link from "next/link";
import { site } from "@/lib/site";

export default function Masthead() {
  return (
    <header className="border-b border-[var(--color-rule)]">
      <div className="mx-auto max-w-[680px] px-5 py-7 sm:py-9">
        <Link href="/" className="no-underline">
          <h1 className="font-[family-name:var(--font-sans)] text-2xl font-black tracking-tight text-[var(--color-ink)] sm:text-3xl">
            {site.name}
          </h1>
        </Link>
        <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
          {site.tagline}
        </p>
      </div>
    </header>
  );
}
