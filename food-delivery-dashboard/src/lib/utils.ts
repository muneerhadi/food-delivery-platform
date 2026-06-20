import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

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
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");
  const normalized = path.replace(/^\/+/, "");

  if (normalized.startsWith("storage/")) {
    return `${base}/${normalized}`;
  }

  return `${base}/storage/${normalized}`;
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
