import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-semibold">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy policy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms of service</Link>
          <Link href={siteConfig.dashboardLoginPath} className="hover:text-foreground">Partner dashboard</Link>
          <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-foreground">{siteConfig.supportEmail}</a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
