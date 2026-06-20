import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt={siteConfig.name} width={40} height={40} className="h-10 w-auto" unoptimized />
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="hover:text-foreground">Features</Link>
          <Link href="/#download" className="hover:text-foreground">Download</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
        <Button asChild size="sm">
          <Link href={siteConfig.dashboardLoginPath}>Partner login</Link>
        </Button>
      </div>
    </header>
  );
}
