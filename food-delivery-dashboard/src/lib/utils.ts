import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import type { Order } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value?: string | null, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "MMM d, yyyy - HH:mm");
}

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      if (!url.pathname.includes("/storage/")) {
        return path;
      }
      path = url.pathname;
    } catch {
      return null;
    }
  }

  const normalized = path.replace(/^\/+/, "");

  if (normalized.startsWith("storage/")) {
    return `${base}/${normalized}`;
  }

  return `${base}/storage/${normalized}`;
}

export function orderTotal(order: Pick<Order, "total" | "total_amount">): number {
  const value = order.total_amount ?? order.total;
  return Number.isFinite(value) ? value : 0;
}

export function orderItemCount(order: Pick<Order, "items" | "items_count">): number {
  if (typeof order.items_count === "number") return order.items_count;
  return order.items?.length ?? 0;
}

export function orderDeliveryAddress(order: Pick<Order, "delivery_address" | "address">): string {
  if (order.delivery_address?.address) return order.delivery_address.address;
  if (order.address?.address_line_1) return order.address.address_line_1;
  return "-";
}

export function titleFromPath(pathname: string) {
  const cleaned = pathname.replace(/^\/+/, "");
  if (!cleaned) return "Dashboard";
  const segments = cleaned.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";
  return segments
    .map((segment) =>
      segment
        .replace(/-/g, " ")
        .replace(/\[|\]/g, "")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" / ");
}
