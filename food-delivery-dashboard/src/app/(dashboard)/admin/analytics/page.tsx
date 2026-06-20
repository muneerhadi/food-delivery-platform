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
import { useChartTheme } from "@/hooks/useChartTheme";
import { formatCurrency } from "@/lib/utils";
import type { Restaurant, User } from "@/types";

type Period = "week" | "month" | "year";
type TopRestaurantRow = { restaurant: Restaurant; orders_count: number; revenue: number };
type TopDriverRow = { driver: User; deliveries_count: number };

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const chart = useChartTheme();

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

  const topRestaurantColumns: Array<DataTableColumn<TopRestaurantRow>> = [
    { key: "restaurant", title: "Restaurant", render: (row) => row.restaurant.name },
    { key: "orders", title: "Orders", render: (row) => row.orders_count },
    { key: "revenue", title: "Revenue", render: (row) => formatCurrency(row.revenue) },
  ];

  const topDriversColumns: Array<DataTableColumn<TopDriverRow>> = [
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
                  <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke={chart.axis} tick={{ fill: chart.axis }} />
                  <YAxis stroke={chart.axis} tick={{ fill: chart.axis }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chart.tooltipBg,
                      borderColor: chart.tooltipBorder,
                      color: chart.tooltipText,
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={chart.line} strokeWidth={3} />
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
                  <CartesianGrid stroke={chart.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke={chart.axis} tick={{ fill: chart.axis }} />
                  <YAxis stroke={chart.axis} tick={{ fill: chart.axis }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chart.tooltipBg,
                      borderColor: chart.tooltipBorder,
                      color: chart.tooltipText,
                    }}
                  />
                  <Bar dataKey="orders_count" fill={chart.bar} radius={6} />
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
