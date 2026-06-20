"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi, extractApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const roleRedirectMap = {
  super_admin: "/admin",
  restaurant_owner: "/restaurant",
  driver: "/driver",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, token, setAuth } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!user || !token || user.role === "customer") return;
    router.replace(roleRedirectMap[user.role]);
  }, [router, token, user]);

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginFormValues) => (await authApi.login(payload.email, payload.password)).data.data,
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
    <main className="grid min-h-screen place-items-center bg-sofra-bg px-4 py-8">
      <Card className="w-full max-w-md border-sofra-border shadow-card">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-sofra-softGreen">
            <Image src="/logo.png" alt="Sofra" width={56} height={56} className="h-14 w-14 object-contain" unoptimized />
          </div>
          <div>
            <CardTitle className="text-2xl text-sofra-text">Sofra Dashboard</CardTitle>
            <CardDescription>Sign in to manage operations</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@sofra.com" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
