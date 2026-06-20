"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export default function RestaurantDashboardPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-dashboard"],
    queryFn: async () => (await restaurantApi.dashboard()).data.data,
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
    { key: "order", title: "Order #", render: (order) => order.order_number },
    { key: "customer", title: "Customer", render: (order) => order.customer?.name ?? "-" },
    { key: "status", title: "Status", render: (order) => <StatusBadge value={order.status} type="order" /> },
    { key: "total", title: "Total", render: (order) => formatCurrency(order.total_amount) },
    { key: "date", title: "Date", render: (order) => formatDate(order.created_at) },
  ];

  if (isLoading) return <LoadingSpinner label="Loading restaurant dashboard..." />;
  const hasRestaurant = Boolean(data?.restaurant);
  const isRestaurantOpen = Boolean(data?.restaurant?.is_open);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Restaurant Dashboard"
        description="Daily performance snapshot for your restaurant."
        actions={
          <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2">
            <p className="text-sm font-medium">{hasRestaurant ? (isRestaurantOpen ? "Open" : "Closed") : "Unknown"}</p>
            <Switch
              checked={isRestaurantOpen}
              onCheckedChange={() => hasRestaurant && toggleMutation.mutate()}
              disabled={!hasRestaurant || toggleMutation.isPending}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => hasRestaurant && toggleMutation.mutate()}
              disabled={!hasRestaurant || toggleMutation.isPending}
            >
              {toggleMutation.isPending ? "Updating..." : "Sync"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Orders" value={data?.today_orders_count ?? 0} />
        <StatCard title="Today's Revenue" value={formatCurrency(data?.today_revenue ?? 0)} />
        <StatCard title="Pending Orders" value={data?.pending_orders_count ?? 0} />
        <StatCard title="Avg Rating" value={Number(data?.average_rating ?? 0).toFixed(1)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <DataTable columns={columns} data={data?.recent_orders?.slice(0, 5) ?? []} />
      </div>
    </section>
  );
}
