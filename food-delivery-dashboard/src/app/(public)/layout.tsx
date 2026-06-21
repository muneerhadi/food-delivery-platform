import { PublicFooter } from "@/components/layout/public/PublicFooter";
import { PublicHeader } from "@/components/layout/public/PublicHeader";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site-frame min-h-dvh p-3 md:p-5">
      <div className="public-site flex min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_80px_-32px_rgba(17,59,49,0.18)] md:min-h-[calc(100dvh-2.5rem)]">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
