"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

export default function AdminRestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurant", restaurantId],
    queryFn: async () => (await adminApi.restaurant(restaurantId)).data.data,
    enabled: Number.isFinite(restaurantId),
  });

  if (isLoading) return <LoadingSpinner label="Loading restaurant details..." />;
  if (!data) return <p className="text-sm text-muted-foreground">Restaurant not found.</p>;

  return (
    <section className="space-y-6">
      <PageHeader title={data.name} description="Restaurant detail and owner information." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Restaurant Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Slug: </span>
              {data.slug}
            </p>
            <p>
              <span className="text-muted-foreground">City: </span>
              {data.city ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Phone: </span>
              {data.phone ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {data.email ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Commission: </span>
              {data.commission_rate ?? 0}%
            </p>
            <div className="flex items-center gap-2">
              <StatusBadge value={data.is_approved ? "approved" : "pending"} type="active" />
              <StatusBadge value={data.is_active ? "active" : "inactive"} type="active" />
              <StatusBadge value={data.is_open ? "open" : "closed"} type="active" />
            </div>
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Address: </span>
              {data.address ?? "-"}
            </p>
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Description: </span>
              {data.description ?? "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name: </span>
              {data.owner?.name ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {data.owner?.email ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Phone: </span>
              {data.owner?.phone ?? "-"}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
