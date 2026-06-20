"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, Restaurant } from "@/types";

type TopRestaurantRow = {
  rank: number;
  restaurant: Restaurant;
  orders_count: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await adminApi.dashboard()).data.data,
  });

  const recentOrders = useMemo(() => data?.recent_orders?.slice(0, 10) ?? [], [data]);
  const topRestaurants = useMemo<TopRestaurantRow[]>(
    () =>
      (data?.top_restaurants ?? []).map((row, index) => ({
        rank: index + 1,
        ...row,
      })),
    [data]
  );

  const orderColumns: Array<DataTableColumn<Order>> = [
    { key: "order", title: "Order", render: (order) => order.order_number },
    { key: "customer", title: "Customer", render: (order) => order.customer?.name ?? "-" },
    { key: "restaurant", title: "Restaurant", render: (order) => order.restaurant?.name ?? "-" },
    { key: "status", title: "Status", render: (order) => <StatusBadge value={order.status} type="order" /> },
    { key: "total", title: "Total", render: (order) => formatCurrency(order.total_amount) },
    { key: "date", title: "Date", render: (order) => formatDate(order.created_at) },
  ];

  const topRestaurantColumns: Array<DataTableColumn<TopRestaurantRow>> = [
    { key: "rank", title: "#", render: (row) => row.rank },
    { key: "name", title: "Restaurant", render: (row) => row.restaurant.name },
    { key: "orders", title: "Orders", render: (row) => row.orders_count },
    { key: "revenue", title: "Revenue", render: (row) => formatCurrency(row.revenue) },
  ];

  if (isLoading) return <LoadingSpinner label="Loading admin dashboard..." />;

  return (
    <PageShell>
      <PageHeader title="Admin overview" description="Platform stats and recent activity at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Restaurants" value={data?.total_restaurants ?? 0} />
        <StatCard title="Customers" value={data?.total_customers ?? 0} />
        <StatCard title="Drivers" value={data?.total_drivers ?? 0} />
        <StatCard title="Today's revenue" value={formatCurrency(data?.today_revenue ?? 0)} />
      </div>

      <PageSection title="Recent orders" description="Latest orders across the platform." contentClassName="p-0">
        <DataTable columns={orderColumns} data={recentOrders} emptyMessage="No recent orders yet." />
      </PageSection>

      <PageSection title="Top restaurants" description="Best performers by order volume and revenue." contentClassName="p-0">
        <DataTable columns={topRestaurantColumns} data={topRestaurants} emptyMessage="No ranking data yet." />
      </PageSection>
    </PageShell>
  );
}
