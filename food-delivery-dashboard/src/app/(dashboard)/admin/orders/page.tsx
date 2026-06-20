"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusOptions: Array<"all" | OrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", page, status, search, fromDate, toDate],
    queryFn: async () =>
      (
        await adminApi.orders({
          page,
          status: status === "all" ? undefined : status,
          order_number: search || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })
      ).data.data,
  });

  const columns: Array<DataTableColumn<Order>> = useMemo(
    () => [
      { key: "order", title: "Order #", render: (order) => order.order_number },
      { key: "customer", title: "Customer", render: (order) => order.customer?.name ?? "-" },
      { key: "restaurant", title: "Restaurant", render: (order) => order.restaurant?.name ?? "-" },
      { key: "driver", title: "Driver", render: (order) => order.driver?.name ?? "-" },
      { key: "status", title: "Status", render: (order) => <StatusBadge value={order.status} type="order" /> },
      { key: "payment", title: "Payment", render: (order) => <StatusBadge value={order.payment_status} type="payment" /> },
      { key: "total", title: "Total", render: (order) => formatCurrency(order.total_amount) },
      { key: "date", title: "Date", render: (order) => formatDate(order.created_at) },
    ],
    []
  );

  return (
    <section className="space-y-6">
      <PageHeader title="Orders" description="Monitor orders across the platform and inspect full order details." />

      <div className="grid gap-3 rounded-2xl border bg-card p-4 lg:grid-cols-5">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "all" ? "All statuses" : value.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order #" />
        <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        <Button variant="outline" onClick={() => refetch()}>
          Apply
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        onRowClick={(row) => router.push(`/admin/orders/${row.order_number}`)}
        pagination={{
          page: data?.current_page ?? 1,
          totalPages: data?.last_page ?? 1,
          onPageChange: setPage,
        }}
      />
    </section>
  );
}
