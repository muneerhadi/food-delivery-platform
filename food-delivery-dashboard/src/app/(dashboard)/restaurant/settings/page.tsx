"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Clock, MapPin, Store, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { restaurantApi, extractApiError, isNotFoundError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { resolveMediaUrl } from "@/lib/utils";

interface SettingsForm {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  opening_time: string;
  closing_time: string;
  min_order_amount: string;
  delivery_fee: string;
  delivery_time_min: string;
  delivery_time_max: string;
}

const defaultForm: SettingsForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  opening_time: "",
  closing_time: "",
  min_order_amount: "",
  delivery_fee: "",
  delivery_time_min: "",
  delivery_time_max: "",
};

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      {hint ? <p className="mb-2 text-xs text-muted-foreground">{hint}</p> : <div className="mb-2" />}
      {children}
    </div>
  );
}

export default function RestaurantSettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["restaurant-profile", user?.id],
    queryFn: async () => (await restaurantApi.profile()).data.data,
    enabled: Boolean(user?.id),
    retry: false,
  });

  const needsCreate = isError && isNotFoundError(error);
  const hasRestaurant = isSuccess && Boolean(data);

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name ?? "",
      description: data.description ?? "",
      address: data.address ?? "",
      city: data.city ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      opening_time: data.opening_time ?? "",
      closing_time: data.closing_time ?? "",
      min_order_amount:
        data.min_order_amount != null
          ? String(data.min_order_amount)
          : data.minimum_order != null
            ? String(data.minimum_order)
            : "",
      delivery_fee: data.delivery_fee ? String(data.delivery_fee) : "",
      delivery_time_min: data.delivery_time_min ? String(data.delivery_time_min) : "",
      delivery_time_max:
        data.delivery_time_max != null
          ? String(data.delivery_time_max)
          : data.delivery_time != null
            ? String(data.delivery_time)
            : "",
    });

    setLogoUrl(resolveMediaUrl(data.logo));
    setCoverUrl(resolveMediaUrl(data.cover_image));
  }, [data]);

  const createMutation = useMutation({
    mutationFn: async (payload: SettingsForm) =>
      restaurantApi.createProfile({
        name: payload.name,
        description: payload.description,
        address: payload.address,
        city: payload.city,
        phone: payload.phone,
        email: payload.email,
        opening_time: payload.opening_time || undefined,
        closing_time: payload.closing_time || undefined,
        min_order_amount: payload.min_order_amount ? Number(payload.min_order_amount) : undefined,
        delivery_fee: payload.delivery_fee ? Number(payload.delivery_fee) : undefined,
        delivery_time_min: payload.delivery_time_min ? Number(payload.delivery_time_min) : undefined,
        delivery_time_max: payload.delivery_time_max ? Number(payload.delivery_time_max) : undefined,
      }),
    onSuccess: () => {
      toast.success("Restaurant created");
      queryClient.invalidateQueries({ queryKey: ["restaurant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-dashboard"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to create restaurant")),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: SettingsForm) =>
      restaurantApi.updateProfile({
        name: payload.name,
        description: payload.description,
        address: payload.address,
        city: payload.city,
        phone: payload.phone,
        email: payload.email,
        opening_time: payload.opening_time,
        closing_time: payload.closing_time,
        min_order_amount: payload.min_order_amount ? Number(payload.min_order_amount) : undefined,
        delivery_fee: payload.delivery_fee ? Number(payload.delivery_fee) : undefined,
        delivery_time_min: payload.delivery_time_min ? Number(payload.delivery_time_min) : undefined,
        delivery_time_max: payload.delivery_time_max ? Number(payload.delivery_time_max) : undefined,
      }),
    onSuccess: () => {
      toast.success("Settings updated");
      queryClient.invalidateQueries({ queryKey: ["restaurant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-dashboard"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update settings")),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => restaurantApi.uploadLogo(file),
    onSuccess: () => {
      toast.success("Logo updated");
      queryClient.invalidateQueries({ queryKey: ["restaurant-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to upload logo")),
  });

  const uploadCoverMutation = useMutation({
    mutationFn: async (file: File) => restaurantApi.uploadCover(file),
    onSuccess: () => {
      toast.success("Cover updated");
      queryClient.invalidateQueries({ queryKey: ["restaurant-profile"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to upload cover")),
  });

  const isSaving = createMutation.isPending || saveMutation.isPending;
  const isUploading = uploadLogoMutation.isPending || uploadCoverMutation.isPending;

  if (isLoading) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  if (needsCreate) {
    return (
      <PageShell>
        <PageHeader
          title="Set up your restaurant"
          description="Create your restaurant profile to start managing menu, orders, and settings."
        />

        <PageSection title="Restaurant details" description="Basic information for your new restaurant." contentClassName="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Restaurant name" className="sm:col-span-2">
              <Input
                placeholder="e.g. Sofra Kitchen"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field label="Phone" hint="Required for customers and drivers.">
              <Input
                type="tel"
                placeholder="+1 555 000 0000"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                placeholder="hello@restaurant.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input
                placeholder="Street address"
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            </Field>
            <Field label="City" className="sm:col-span-2">
              <Input
                placeholder="City"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea
                rows={4}
                placeholder="Tell customers about your restaurant..."
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Field>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={createMutation.isPending || !form.name.trim() || !form.phone.trim() || !form.address.trim()}
            onClick={() => createMutation.mutate(form)}
          >
            {createMutation.isPending ? "Creating..." : "Create restaurant"}
          </Button>
        </PageSection>
      </PageShell>
    );
  }

  if (!hasRestaurant) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Restaurant settings"
        description="Manage how your restaurant appears to customers and how deliveries work."
        actions={
          <Button onClick={() => saveMutation.mutate(form)} disabled={isSaving || isUploading}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      {/* Live preview */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="relative h-44 bg-muted/50 sm:h-52">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt="Restaurant cover preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Cover image preview
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-white/90 bg-card shadow-md sm:h-20 sm:w-20">
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo preview" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Logo</div>
              )}
            </div>
            <div className="min-w-0 text-white">
              <p className="truncate text-lg font-semibold sm:text-xl">{form.name || "Your restaurant"}</p>
              <p className="truncate text-sm text-white/85">{form.address || "Address not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection
          title="Logo"
          description="Square image shown on listings and order cards."
          contentClassName="pt-2"
        >
          <ImageUpload
            label="Upload logo"
            value={logoUrl}
            className="min-h-[200px] max-w-xs"
            onReject={(message) => toast.error(message)}
            onChange={(file) => {
              if (!file) return;
              setLogoUrl(URL.createObjectURL(file));
              uploadLogoMutation.mutate(file);
            }}
          />
          {uploadLogoMutation.isPending ? (
            <p className="mt-2 text-xs text-muted-foreground">Uploading logo...</p>
          ) : null}
        </PageSection>

        <PageSection
          title="Cover image"
          description="Wide banner at the top of your restaurant page."
          contentClassName="pt-2"
        >
          <ImageUpload
            label="Upload cover"
            value={coverUrl}
            className="min-h-[200px]"
            onReject={(message) => toast.error(message)}
            onChange={(file) => {
              if (!file) return;
              setCoverUrl(URL.createObjectURL(file));
              uploadCoverMutation.mutate(file);
            }}
          />
          {uploadCoverMutation.isPending ? (
            <p className="mt-2 text-xs text-muted-foreground">Uploading cover...</p>
          ) : null}
        </PageSection>
      </div>

      <PageSection
        title="Restaurant details"
        description="Name and description customers see when browsing."
        contentClassName="space-y-5"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Store className="h-4 w-4" />
          Basic info
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Restaurant name" className="sm:col-span-2">
            <Input
              placeholder="e.g. Sofra Kitchen"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </Field>
          <Field label="Description" hint="Short summary of your cuisine and vibe." className="sm:col-span-2">
            <Textarea
              rows={4}
              placeholder="Tell customers what makes your restaurant special..."
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </Field>
        </div>
      </PageSection>

      <PageSection
        title="Contact & location"
        description="How customers and drivers reach you."
        contentClassName="space-y-5"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <MapPin className="h-4 w-4" />
          Contact
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone">
            <Input
              type="tel"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              placeholder="hello@restaurant.com"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input
              placeholder="Street, city, postal code"
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            />
          </Field>
          <Field label="City" className="sm:col-span-2">
            <Input
              placeholder="City"
              value={form.city}
              onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
            />
          </Field>
        </div>
      </PageSection>

      <PageSection
        title="Hours & delivery"
        description="Opening times, fees, and estimated delivery window."
        contentClassName="space-y-6"
      >
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Clock className="h-4 w-4" />
            Opening hours
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Opens at">
              <Input
                type="time"
                value={form.opening_time}
                onChange={(event) => setForm((prev) => ({ ...prev, opening_time: event.target.value }))}
              />
            </Field>
            <Field label="Closes at">
              <Input
                type="time"
                value={form.closing_time}
                onChange={(event) => setForm((prev) => ({ ...prev, closing_time: event.target.value }))}
              />
            </Field>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
            <Truck className="h-4 w-4" />
            Delivery settings
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Minimum order" hint="Amount in your local currency.">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={form.min_order_amount}
                onChange={(event) => setForm((prev) => ({ ...prev, min_order_amount: event.target.value }))}
              />
            </Field>
            <Field label="Delivery fee" hint="Flat fee per order.">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={form.delivery_fee}
                onChange={(event) => setForm((prev) => ({ ...prev, delivery_fee: event.target.value }))}
              />
            </Field>
            <Field label="Delivery time (min)" hint="Fastest estimate in minutes.">
              <Input
                type="number"
                min={0}
                placeholder="20"
                value={form.delivery_time_min}
                onChange={(event) => setForm((prev) => ({ ...prev, delivery_time_min: event.target.value }))}
              />
            </Field>
            <Field label="Delivery time (max)" hint="Slowest estimate in minutes.">
              <Input
                type="number"
                min={0}
                placeholder="40"
                value={form.delivery_time_max}
                onChange={(event) => setForm((prev) => ({ ...prev, delivery_time_max: event.target.value }))}
              />
            </Field>
          </div>
        </div>
      </PageSection>

      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="sm:w-auto"
          onClick={() => {
            if (!data) return;
            setForm({
              name: data.name ?? "",
              description: data.description ?? "",
              address: data.address ?? "",
              city: data.city ?? "",
              phone: data.phone ?? "",
              email: data.email ?? "",
              opening_time: data.opening_time ?? "",
              closing_time: data.closing_time ?? "",
              min_order_amount: data.min_order_amount ? String(data.min_order_amount) : "",
              delivery_fee: data.delivery_fee ? String(data.delivery_fee) : "",
              delivery_time_min: data.delivery_time_min ? String(data.delivery_time_min) : "",
              delivery_time_max: data.delivery_time_max ? String(data.delivery_time_max) : "",
            });
            setLogoUrl(resolveMediaUrl(data.logo));
            setCoverUrl(resolveMediaUrl(data.cover_image));
          }}
        >
          Reset form
        </Button>
        <Button className="sm:w-auto" onClick={() => saveMutation.mutate(form)} disabled={isSaving || isUploading}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </PageShell>
  );
}
