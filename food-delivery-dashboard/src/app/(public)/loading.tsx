import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="public-mesh-bg flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sofra-border/70 bg-white/80 shadow-card backdrop-blur-sm">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Loading...</p>
    </div>
  );
}
