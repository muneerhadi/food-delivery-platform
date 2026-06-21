import { cn } from "@/lib/utils";

export function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-5 w-5 shrink-0", className)}>
      <path fill="#EA4335" d="M3.6 2.4c-.4.2-.6.7-.6 1.2v16.8c0 .5.2 1 .6 1.2l9.1-9.1L3.6 2.4z" />
      <path fill="#FBBC04" d="M16.8 14.4 6.2 21.6c.5.3 1.1.3 1.6 0l9-5.2-2-2z" />
      <path fill="#4285F4" d="M21.6 11.4 18.6 9.6l-2.8 2.8 2.8 2.8 3-1.8c.9-.5.9-1.7 0-2.2z" />
      <path fill="#34A853" d="M6.2 2.4c-.5.3-.9.7-1.2 1.2l9.6 7.2 2.8-2.8L7.8 2.4c-.5-.3-1.1-.3-1.6 0z" />
    </svg>
  );
}
