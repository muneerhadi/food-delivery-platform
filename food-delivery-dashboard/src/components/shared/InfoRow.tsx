import { cn } from "@/lib/utils";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn("flex flex-col gap-0.5 sm:flex-row sm:gap-3", className)}>
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:w-28 sm:text-sm sm:normal-case sm:tracking-normal">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
