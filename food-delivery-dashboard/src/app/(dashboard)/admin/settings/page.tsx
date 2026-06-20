"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { resolveMediaUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const defaultProfileForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
};

const defaultPasswordForm: PasswordForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const userId = useAuthStore((state) => state.user?.id);
  const [form, setForm] = useState<ProfileForm>(defaultProfileForm);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(defaultPasswordForm);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile", userId],
    queryFn: async () => (await adminApi.profile()).data.data,
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
    });
    setAvatarUrl(resolveMediaUrl(data.avatar));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfileForm) =>
      adminApi.updateProfile({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
      }),
    onSuccess: (response) => {
      const user = response.data.data;
      updateUser(user);
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update profile")),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => adminApi.uploadAvatar(file),
    onSuccess: (response) => {
      const user = response.data.data;
      updateUser(user);
      setAvatarUrl(resolveMediaUrl(user.avatar));
      toast.success("Profile photo updated");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to upload photo")),
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload: PasswordForm) => adminApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed");
      setPasswordForm(defaultPasswordForm);
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to change password")),
  });

  if (isLoading) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Admin settings"
        description="Update your profile photo, contact details, and password."
        actions={
          <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <PageSection title="Profile photo" description="Shown in the dashboard header." contentClassName="pt-2">
          <ImageUpload
            label="Upload photo"
            value={avatarUrl}
            className="min-h-[220px]"
            onReject={(message) => toast.error(message)}
            onChange={(file) => {
              if (!file) return;
              setAvatarUrl(URL.createObjectURL(file));
              uploadAvatarMutation.mutate(file);
            }}
          />
          {uploadAvatarMutation.isPending ? (
            <p className="mt-2 text-xs text-muted-foreground">Uploading photo...</p>
          ) : null}
        </PageSection>

        <PageSection title="Account details" description="Your name and contact information." contentClassName="space-y-4">
          <Field label="Full name">
            <Input
              placeholder="Your name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <Input
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </Field>
          </div>
        </PageSection>
      </div>

      <PageSection title="Change password" description="Use a strong password you don't use elsewhere.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <Input
              type="password"
              value={passwordForm.current_password}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
              }
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={passwordForm.password}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={passwordForm.password_confirmation}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))
              }
            />
          </Field>
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => passwordMutation.mutate(passwordForm)}
          disabled={passwordMutation.isPending}
        >
          {passwordMutation.isPending ? "Updating..." : "Change password"}
        </Button>
      </PageSection>
    </PageShell>
  );
}
