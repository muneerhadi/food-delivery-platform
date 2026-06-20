"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";
import { driverApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type EarningHistoryRow = {
  created_at?: string;
  order_number?: string;
  delivery_fee?: number;
  status?: string;
};

export default function DriverEarningsPage() {
  const [page, setPage] = useState(1);

  const { data: summary } = useQuery({
    queryKey: ["driver-earnings-summary"],
    queryFn: async () => (await driverApi.earnings()).data.data,
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["driver-earnings-history", page],
    queryFn: async () => (await driverApi.earningsHistory({ page })).data.data,
  });

  const columns: Array<DataTableColumn<EarningHistoryRow>> = [
    { key: "date", title: "Date", render: (row) => formatDate(row.created_at) },
    { key: "order", title: "Order #", render: (row) => row.order_number ?? "-" },
    { key: "fee", title: "Delivery Fee", render: (row) => formatCurrency(Number(row.delivery_fee ?? 0)) },
    { key: "status", title: "Status", render: (row) => row.status ?? "-" },
  ];

  return (
    <section className="space-y-6">
      <PageHeader title="Driver Earnings" description="Track payouts and delivery fee history." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today" value={formatCurrency(Number(summary?.today ?? 0))} />
        <StatCard title="This Week" value={formatCurrency(Number(summary?.week ?? 0))} />
        <StatCard title="This Month" value={formatCurrency(Number(summary?.month ?? 0))} />
        <StatCard title="All Time" value={formatCurrency(Number(summary?.all_time ?? 0))} />
      </div>

      <DataTable
        columns={columns}
        data={(historyData?.items ?? []) as EarningHistoryRow[]}
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
