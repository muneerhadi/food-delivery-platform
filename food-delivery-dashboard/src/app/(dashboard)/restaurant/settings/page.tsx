"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { Restaurant } from "@/types";

interface SettingsForm {
  name: string;
  description: string;
  address: string;
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
  phone: "",
  email: "",
  opening_time: "",
  closing_time: "",
  min_order_amount: "",
  delivery_fee: "",
  delivery_time_min: "",
  delivery_time_max: "",
};

export default function RestaurantSettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["restaurant-profile"],
    queryFn: async () => (await restaurantApi.profile()).data.data,
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name ?? "",
      description: data.description ?? "",
      address: data.address ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      opening_time: data.opening_time ?? "",
      closing_time: data.closing_time ?? "",
      min_order_amount: data.min_order_amount ? String(data.min_order_amount) : "",
      delivery_fee: data.delivery_fee ? String(data.delivery_fee) : "",
      delivery_time_min: data.delivery_time_min ? String(data.delivery_time_min) : "",
      delivery_time_max: data.delivery_time_max ? String(data.delivery_time_max) : "",
    });

    const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api").replace("/api", "");
    setLogoUrl(data.logo ? `${base}/storage/${data.logo}` : null);
    setCoverUrl(data.cover_image ? `${base}/storage/${data.cover_image}` : null);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: SettingsForm) =>
      restaurantApi.updateProfile({
        name: payload.name,
        description: payload.description,
        address: payload.address,
        phone: payload.phone,
        email: payload.email,
        opening_time: payload.opening_time,
        closing_time: payload.closing_time,
        min_order_amount: payload.min_order_amount ? Number(payload.min_order_amount) : null,
        delivery_fee: payload.delivery_fee ? Number(payload.delivery_fee) : null,
        delivery_time_min: payload.delivery_time_min ? Number(payload.delivery_time_min) : null,
        delivery_time_max: payload.delivery_time_max ? Number(payload.delivery_time_max) : null,
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

  return (
    <section className="space-y-6">
      <PageHeader title="Restaurant Settings" description="Update profile, hours, fees, and media." />

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Address</Label>
              <Input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Opening Time</Label>
              <Input type="time" value={form.opening_time} onChange={(event) => setForm((prev) => ({ ...prev, opening_time: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Closing Time</Label>
              <Input type="time" value={form.closing_time} onChange={(event) => setForm((prev) => ({ ...prev, closing_time: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Min Order</Label>
              <Input type="number" value={form.min_order_amount} onChange={(event) => setForm((prev) => ({ ...prev, min_order_amount: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Delivery Fee</Label>
              <Input type="number" value={form.delivery_fee} onChange={(event) => setForm((prev) => ({ ...prev, delivery_fee: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Delivery Time Min (min)</Label>
              <Input type="number" value={form.delivery_time_min} onChange={(event) => setForm((prev) => ({ ...prev, delivery_time_min: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Delivery Time Max (min)</Label>
              <Input type="number" value={form.delivery_time_max} onChange={(event) => setForm((prev) => ({ ...prev, delivery_time_max: event.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          </div>
          <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={logoUrl}
              onChange={(file) => {
                if (!file) return;
                setLogoUrl(URL.createObjectURL(file));
                uploadLogoMutation.mutate(file);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={coverUrl}
              onChange={(file) => {
                if (!file) return;
                setCoverUrl(URL.createObjectURL(file));
                uploadCoverMutation.mutate(file);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
