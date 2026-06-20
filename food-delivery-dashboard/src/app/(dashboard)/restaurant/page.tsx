"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function RestaurantDashboardPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-dashboard", user?.id],
    queryFn: async () => (await restaurantApi.dashboard()).data.data,
    enabled: Boolean(user?.id),
  });

  const toggleMutation = useMutation({
    mutationFn: async () => restaurantApi.toggleStatus(),
    onSuccess: () => {
      toast.success("Restaurant status updated");
      queryClient.invalidateQueries({ queryKey: ["restaurant-dashboard"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update status")),
  });

  const columns: Array<DataTableColumn<Order>> = [
    { key: "order", title: "Order", render: (order) => order.order_number },
    { key: "customer", title: "Customer", render: (order) => order.customer?.name ?? "-" },
    { key: "status", title: "Status", render: (order) => <StatusBadge value={order.status} type="order" /> },
    { key: "total", title: "Total", render: (order) => formatCurrency(order.total_amount) },
    { key: "date", title: "Date", render: (order) => formatDate(order.created_at) },
  ];

  if (isLoading) return <LoadingSpinner label="Loading restaurant dashboard..." />;
  const isRestaurantOpen = Boolean(data?.restaurant?.is_open);
  const needsSetup = Boolean(data?.needs_setup);

  return (
    <PageShell>
      <PageHeader
        title="Restaurant overview"
        description="Today's numbers and your latest orders."
        actions={
          needsSetup ? (
            <Button asChild>
              <Link href="/restaurant/settings">Set up restaurant</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5 shadow-sm">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Accepting orders</p>
                <p className="text-sm font-medium">{isRestaurantOpen ? "Open" : "Closed"}</p>
              </div>
              <Switch
                checked={isRestaurantOpen}
                onCheckedChange={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                aria-label="Toggle restaurant open or closed"
              />
            </div>
          )
        }
      />

      {needsSetup ? (
        <PageSection
          title="Finish your setup"
          description="Create your restaurant profile before managing menu and orders."
        >
          <Button asChild>
            <Link href="/restaurant/settings">Go to restaurant settings</Link>
          </Button>
        </PageSection>
      ) : (
        <>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's orders" value={data?.today_orders_count ?? 0} />
        <StatCard title="Today's revenue" value={formatCurrency(data?.today_revenue ?? 0)} />
        <StatCard title="Pending orders" value={data?.pending_orders_count ?? 0} />
        <StatCard title="Average rating" value={Number(data?.average_rating ?? 0).toFixed(1)} />
      </div>

      <PageSection title="Recent orders" description="Your last five orders." contentClassName="p-0">
        <DataTable columns={columns} data={data?.recent_orders?.slice(0, 5) ?? []} emptyMessage="No orders yet." />
      </PageSection>
        </>
      )}
    </PageShell>
  );
}
