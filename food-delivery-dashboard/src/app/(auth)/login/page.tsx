"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { authApi, extractApiError } from "@/lib/api";
import { AppStoreIcon } from "@/components/icons/AppStoreIcon";
import { LoginShowcase } from "@/components/auth/LoginShowcase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRedirectMap = {
  super_admin: "/admin",
  restaurant_owner: "/restaurant",
  driver: "/driver",
} as const;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, token, setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  useEffect(() => {
    if (!user || !token || user.role === "customer") return;
    router.replace(roleRedirectMap[user.role]);
  }, [router, token, user]);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginFormValues) =>
      (await authApi.login(payload.email, payload.password)).data.data,
    onSuccess: ({ token: authToken, user: authUser, role }) => {
      if (role === "customer") {
        toast.error("This account should use the mobile app.");
        return;
      }
      setAuth(authUser, authToken);
      toast.success("Welcome back!");
      router.replace(roleRedirectMap[role]);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "Login failed. Please check your credentials."));
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <div className="login-page min-h-screen bg-white">
      <header className="login-page-header flex items-center justify-between px-6 py-5 md:px-10 lg:px-14">
        <Link href="/" className="inline-flex hover:opacity-90">
          <Image
            src="/logo.png"
            alt={siteConfig.name}
            width={160}
            height={64}
            className="h-10 w-auto object-contain md:h-11"
            unoptimized
            priority
          />
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <p className="hidden text-sm text-sofra-textMuted sm:block">Need the customer app?</p>
          <Button asChild className="login-page-signup-btn h-10 rounded-full px-5">
            <Link href="/#download">Get the app</Link>
          </Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
        <div className="flex items-center px-6 py-10 md:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-sofra-text md:text-4xl">Welcome back</h1>
              <p className="font-serif text-2xl italic text-sofra-mutedGold md:text-[1.75rem]">
                Let&apos;s deliver together
              </p>
              <p className="pt-1 text-sm leading-relaxed text-sofra-textMuted md:text-base">
                Sign in to your dashboard and keep orders, restaurants, and deliveries running smoothly.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sofra-text">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="login-page-input h-12 rounded-xl border-sofra-border/80 bg-white"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sofra-text">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="login-page-input h-12 rounded-xl border-sofra-border/80 bg-white pr-11"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sofra-textMuted transition hover:text-sofra-text"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-sofra-textMuted">
                  <input
                    type="checkbox"
                    className="login-page-checkbox h-4 w-4 rounded border-sofra-border accent-sofra-green"
                    {...form.register("remember")}
                  />
                  Remember me
                </label>
                <a
                  href={`mailto:${siteConfig.supportEmail}?subject=Password%20reset%20request`}
                  className="text-sm font-medium text-sofra-mutedGold transition hover:text-sofra-green"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="login-page-submit h-14 w-full rounded-full bg-sofra-text text-base text-white hover:bg-sofra-green"
              >
                <span>{loginMutation.isPending ? "Signing in..." : "Log In"}</span>
                <span className="login-page-submit-icon">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Button>
            </form>

            <div className="login-page-divider my-8">or continue with</div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="login-page-social-btn h-12 rounded-xl border-sofra-border/80 bg-white"
                onClick={() => toast.error("Google sign-in is not available yet.")}
              >
                <GoogleIcon className="h-5 w-5" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="login-page-social-btn h-12 rounded-xl border-sofra-border/80 bg-white"
                onClick={() => toast.error("Apple sign-in is not available yet.")}
              >
                <AppStoreIcon className="h-5 w-5 text-sofra-text" />
                Apple
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden bg-[#faf6f1] p-6 lg:block lg:p-8 xl:p-10">
          <LoginShowcase />
        </div>
      </div>
    </div>
  );
}
