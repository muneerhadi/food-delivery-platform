"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
    { key: "order", title: "Order #", render: (order) => order.order_number },
    { key: "customer", title: "Customer", render: (order) => order.customer?.name ?? "-" },
    { key: "restaurant", title: "Restaurant", render: (order) => order.restaurant?.name ?? "-" },
    { key: "status", title: "Status", render: (order) => <StatusBadge value={order.status} type="order" /> },
    { key: "total", title: "Total", render: (order) => formatCurrency(order.total_amount) },
    { key: "date", title: "Date", render: (order) => formatDate(order.created_at) },
  ];

  const topRestaurantColumns: Array<DataTableColumn<TopRestaurantRow>> = [
    { key: "rank", title: "#", render: (row) => row.rank },
    { key: "name", title: "Name", render: (row) => row.restaurant.name },
    { key: "orders", title: "Orders", render: (row) => row.orders_count },
    { key: "revenue", title: "Revenue", render: (row) => formatCurrency(row.revenue) },
  ];

  if (isLoading) return <LoadingSpinner label="Loading admin dashboard..." />;

  return (
    <section className="space-y-6">
      <PageHeader title="Super Admin Dashboard" description="Overview of platform performance and activity." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Restaurants" value={data?.total_restaurants ?? 0} />
        <StatCard title="Total Customers" value={data?.total_customers ?? 0} />
        <StatCard title="Total Drivers" value={data?.total_drivers ?? 0} />
        <StatCard title="Today's Revenue" value={formatCurrency(data?.today_revenue ?? 0)} />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <DataTable columns={orderColumns} data={recentOrders} emptyMessage="No recent orders found." />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Top Restaurants</h3>
        <DataTable columns={topRestaurantColumns} data={topRestaurants} emptyMessage="No ranking data available." />
      </div>
    </section>
  );
}
