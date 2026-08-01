import Link from "next/link";
import { site } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[680px] px-5 py-10 text-sm text-[var(--color-ink-faint)]">
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-sans)]">
          <Link href="/" className="hover:text-[var(--color-accent)]">
            文章
          </Link>
          <a href={site.links.home} className="hover:text-[var(--color-accent)]">
            Bek 主站
          </a>
          <a href={site.links.course} className="hover:text-[var(--color-accent)]">
            四個禮拜天 AI 創業課
          </a>
        </div>
        <p className="mt-4">
          聯絡：
          <a href={`mailto:${site.email}`} className="hover:text-[var(--color-accent)]">
            {site.email}
          </a>
          {"　/　"}
          {site.phone}
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} {site.author}（{site.authorZh}）
        </p>
      </div>
    </footer>
  );
}
