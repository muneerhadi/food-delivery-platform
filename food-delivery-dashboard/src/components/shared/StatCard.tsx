import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  helperText?: string;
  className?: string;
}

export function StatCard({ title, value, helperText, className }: StatCardProps) {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
        {helperText ? <p className="mt-1 text-xs text-muted-foreground">{helperText}</p> : null}
      </CardContent>
    </Card>
  );
}
