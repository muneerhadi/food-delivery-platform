"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { driverApi, extractApiError } from "@/lib/api";
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

export default function DriverSettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [form, setForm] = useState<ProfileForm>(defaultProfileForm);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(defaultPasswordForm);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => (await driverApi.profile()).data.data,
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
      driverApi.updateProfile({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
      }),
    onSuccess: (response) => {
      const user = response.data.data;
      updateUser(user);
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update profile")),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => driverApi.uploadAvatar(file),
    onSuccess: (response) => {
      const user = response.data.data;
      updateUser(user);
      setAvatarUrl(resolveMediaUrl(user.avatar));
      toast.success("Profile photo updated");
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to upload photo")),
  });

  const passwordMutation = useMutation({
    mutationFn: async (payload: PasswordForm) => driverApi.changePassword(payload),
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
    <section className="space-y-6">
      <PageHeader title="Driver Settings" description="Update your profile photo, contact details, and password." />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordForm.current_password}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))
                }
              />
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => passwordMutation.mutate(passwordForm)}
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
