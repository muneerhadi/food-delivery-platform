"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

type Period = "week" | "month" | "year";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["analytics-revenue", period],
    queryFn: async () => (await adminApi.analyticsRevenue(period)).data.data,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["analytics-orders", period],
    queryFn: async () => (await adminApi.analyticsOrders(period)).data.data,
  });

  const { data: topRestaurants, isLoading: topRestaurantsLoading } = useQuery({
    queryKey: ["analytics-top-restaurants"],
    queryFn: async () => (await adminApi.analyticsTopRestaurants()).data.data,
  });

  const { data: topDrivers, isLoading: topDriversLoading } = useQuery({
    queryKey: ["analytics-top-drivers"],
    queryFn: async () => (await adminApi.analyticsTopDrivers()).data.data,
  });

  const topRestaurantColumns: Array<DataTableColumn<(typeof topRestaurants)[number]>> = [
    { key: "restaurant", title: "Restaurant", render: (row) => row.restaurant.name },
    { key: "orders", title: "Orders", render: (row) => row.orders_count },
    { key: "revenue", title: "Revenue", render: (row) => formatCurrency(row.revenue) },
  ];

  const topDriversColumns: Array<DataTableColumn<(typeof topDrivers)[number]>> = [
    { key: "driver", title: "Driver", render: (row) => row.driver.name },
    { key: "deliveries", title: "Deliveries", render: (row) => row.deliveries_count },
  ];

  if (revenueLoading || ordersLoading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Analytics" description="Revenue and operational performance trends." />

      <div className="flex flex-wrap gap-2">
        {(["week", "month", "year"] as Period[]).map((value) => (
          <Button key={value} variant={period === value ? "default" : "outline"} onClick={() => setPeriod(value)}>
            {value[0].toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#005D44" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders_count" fill="#E6A543" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topRestaurantColumns}
              data={topRestaurants ?? []}
              loading={topRestaurantsLoading}
              emptyMessage="No restaurant rankings available."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={topDriversColumns}
              data={topDrivers ?? []}
              loading={topDriversLoading}
              emptyMessage="No driver rankings available."
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
