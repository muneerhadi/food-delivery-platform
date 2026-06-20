import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, UserRole } from "@/types";

interface StatusBadgeProps {
  value: string;
  type?: "order" | "payment" | "role" | "active";
  className?: string;
}

const orderVariantMap: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  preparing: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200",
  ready: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200",
  picked_up: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200",
  on_the_way: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

const paymentVariantMap: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  refunded: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
};

const roleVariantMap: Record<UserRole, string> = {
  super_admin: "bg-primary/15 text-primary",
  restaurant_owner: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
  driver: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
  customer: "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200",
};

export function StatusBadge({ value, type = "order", className }: StatusBadgeProps) {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  let badgeClass = "bg-muted text-foreground";

  if (type === "order" && normalized in orderVariantMap) {
    badgeClass = orderVariantMap[normalized as OrderStatus];
  }
  if (type === "payment" && normalized in paymentVariantMap) {
    badgeClass = paymentVariantMap[normalized as PaymentStatus];
  }
  if (type === "role" && normalized in roleVariantMap) {
    badgeClass = roleVariantMap[normalized as UserRole];
  }
  if (type === "active") {
    badgeClass =
      normalized === "true" || normalized === "active"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200";
  }

  return <Badge className={cn("capitalize", badgeClass, className)}>{value.replace(/_/g, " ")}</Badge>;
}
