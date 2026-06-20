"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { restaurantApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type Period = "week" | "month" | "year";

type HistoryRow = {
  order_number?: string;
  created_at?: string;
  subtotal?: number;
  commission?: number;
  net?: number;
  status?: string;
};

export default function RestaurantEarningsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [page, setPage] = useState(1);

  const { data: summary } = useQuery({
    queryKey: ["restaurant-earnings-summary", period],
    queryFn: async () => (await restaurantApi.earnings(period)).data.data,
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["restaurant-earnings-history", period, page],
    queryFn: async () => (await restaurantApi.earningsHistory({ period, page })).data.data,
  });

  const chartData =
    historyData?.items?.map((row) => ({
      date: row.date as string,
      net: Number(row.net_amount ?? row.net ?? 0),
    })) ?? [];

  const columns: Array<DataTableColumn<HistoryRow>> = [
    { key: "order", title: "Order #", render: (row) => row.order_number ?? "-" },
    { key: "date", title: "Date", render: (row) => formatDate(row.created_at) },
    { key: "subtotal", title: "Subtotal", render: (row) => formatCurrency(Number(row.subtotal ?? 0)) },
    { key: "commission", title: "Commission", render: (row) => formatCurrency(Number(row.commission ?? 0)) },
    { key: "net", title: "Net", render: (row) => formatCurrency(Number(row.net ?? 0)) },
    { key: "status", title: "Status", render: (row) => row.status ?? "-" },
  ];

  return (
    <section className="space-y-6">
      <PageHeader title="Earnings" description="Revenue, commission, and payout breakdown." />

      <div className="flex gap-2">
        {(["week", "month", "year"] as Period[]).map((value) => (
          <Button key={value} variant={period === value ? "default" : "outline"} onClick={() => setPeriod(value)}>
            {value[0].toUpperCase() + value.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(Number(summary?.total_revenue ?? 0))} />
        <StatCard title="Commission Paid" value={formatCurrency(Number(summary?.commission_paid ?? 0))} />
        <StatCard title="Net Earnings" value={formatCurrency(Number(summary?.net_earnings ?? 0))} />
        <StatCard title="Total Orders" value={Number(summary?.total_orders ?? 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="net" stroke="#005D44" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={(historyData?.items ?? []) as HistoryRow[]}
        loading={isLoading}
        pagination={{
          page: historyData?.pagination?.current_page ?? 1,
          totalPages: historyData?.pagination?.last_page ?? 1,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
