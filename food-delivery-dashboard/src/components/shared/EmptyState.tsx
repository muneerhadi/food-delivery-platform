import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}
