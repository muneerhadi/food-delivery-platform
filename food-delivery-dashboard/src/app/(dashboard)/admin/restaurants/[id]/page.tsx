"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { InfoRow } from "@/components/shared/InfoRow";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";

export default function AdminRestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurant", restaurantId],
    queryFn: async () => (await adminApi.restaurant(restaurantId)).data.data,
    enabled: Number.isFinite(restaurantId),
  });

  if (isLoading) return <LoadingSpinner label="Loading restaurant details..." />;
  if (!data) {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">Restaurant not found.</p>
      </PageShell>
    );
  }

  const logoUrl = resolveMediaUrl(data.logo);
  const coverUrl = resolveMediaUrl(data.cover_image);

  return (
    <PageShell>
      <PageHeader
        title={data.name}
        description="Full restaurant profile and owner contact details."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/restaurants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to list
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="relative h-40 bg-muted/40 sm:h-48">
          {coverUrl ? (
            <Image src={coverUrl} alt={`${data.name} cover`} fill className="object-cover" unoptimized />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-end gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border-2 border-white/90 bg-card shadow-md">
              {logoUrl ? (
                <Image src={logoUrl} alt={data.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="text-white">
              <p className="font-semibold">{data.name}</p>
              <p className="text-sm text-white/85">{data.city ?? data.address ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-4">
          <StatusBadge value={data.is_approved ? "approved" : "pending"} type="active" />
          <StatusBadge value={data.is_active ? "active" : "inactive"} type="active" />
          <StatusBadge value={data.is_open ? "open" : "closed"} type="active" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PageSection title="Restaurant details" contentClassName="space-y-3">
          <InfoRow label="Slug" value={data.slug} />
          <InfoRow label="Phone" value={data.phone ?? "—"} />
          <InfoRow label="Email" value={data.email ?? "—"} />
          <InfoRow label="Address" value={data.address ?? "—"} />
          <InfoRow label="City" value={data.city ?? "—"} />
          <InfoRow label="Commission" value={`${data.commission_rate ?? 0}%`} />
          <InfoRow label="Rating" value={`${Number(data.average_rating ?? 0).toFixed(1)} (${data.total_reviews ?? 0} reviews)`} />
          {data.description ? (
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{data.description}</p>
            </div>
          ) : null}
        </PageSection>

        <PageSection title="Owner" contentClassName="space-y-3">
          <InfoRow label="Name" value={data.owner?.name ?? "—"} />
          <InfoRow label="Email" value={data.owner?.email ?? "—"} />
          <InfoRow label="Phone" value={data.owner?.phone ?? "—"} />
        </PageSection>
      </div>
    </PageShell>
  );
}
