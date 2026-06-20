"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicRouteButtonProps = Omit<ButtonProps, "onClick"> & {
  href: string;
};

export function PublicRouteButton({
  href,
  children,
  className,
  disabled,
  onClick,
  ...props
}: PublicRouteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={cn("gap-2", className)}
      disabled={disabled || loading}
      onClick={(event) => {
        setLoading(true);
        onClick?.(event);
        router.push(href);
      }}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

type PublicHashButtonProps = Omit<ButtonProps, "onClick"> & {
  targetId: string;
};

export function PublicHashButton({ targetId, children, className, disabled, ...props }: PublicHashButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={cn("gap-2", className)}
      disabled={disabled || loading}
      onClick={() => {
        setLoading(true);
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        window.setTimeout(() => setLoading(false), 500);
      }}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

type PublicExternalButtonProps = Omit<ButtonProps, "onClick"> & {
  href: string;
};

export function PublicExternalButton({ href, children, className, disabled, ...props }: PublicExternalButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className={cn("gap-2", className)}
      disabled={disabled || loading}
      onClick={() => {
        setLoading(true);
        window.open(href, "_blank", "noopener,noreferrer");
        window.setTimeout(() => setLoading(false), 600);
      }}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}

type PublicNavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export function PublicNavLink({ href, children, className, onNavigate }: PublicNavLinkProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isHash = href.includes("#");

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60",
        className
      )}
      disabled={loading}
      onClick={() => {
        setLoading(true);
        if (isHash) {
          const [, hash] = href.split("#");
          const element = hash ? document.getElementById(hash) : null;
          if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
          if (href.startsWith("/#") && window.location.pathname !== "/") {
            router.push(href);
          }
          window.setTimeout(() => setLoading(false), 500);
          onNavigate?.();
          return;
        }
        router.push(href);
        onNavigate?.();
      }}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}
