"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { driverApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

const activeStatuses = new Set(["confirmed", "picked_up", "on_the_way", "ready"]);

export default function DriverDashboardPage() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem("driver-online-status");
    setOnline(value === "true");
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["driver-dashboard-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100 })).data.data.data,
  });

  const { data: earnings } = useQuery({
    queryKey: ["driver-dashboard-earnings"],
    queryFn: async () => (await driverApi.earnings()).data.data,
  });

  const activeOrder = useMemo(
    () => orders.find((order) => activeStatuses.has(order.status)),
    [orders]
  );

  const todayDeliveries = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((order) => order.status === "delivered" && new Date(order.updated_at ?? order.created_at).toDateString() === today).length;
  }, [orders]);

  const todayEarnings = Number(earnings?.today ?? 0);
  const weekEarnings = Number(earnings?.week ?? 0);

  return (
    <section className="space-y-6">
      <PageHeader title="Driver Dashboard" description="Daily deliveries and active assignment." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Deliveries" value={todayDeliveries} />
        <StatCard title="Today's Earnings" value={formatCurrency(todayEarnings)} />
        <StatCard title="This Week's Earnings" value={formatCurrency(weekEarnings)} />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <StatusBadge value={online ? "online" : "offline"} type="active" />
            <Switch
              checked={online}
              onCheckedChange={(checked) => {
                setOnline(checked);
                localStorage.setItem("driver-online-status", String(checked));
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Order</CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrder ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">#{activeOrder.order_number}</p>
              <p>
                <span className="text-muted-foreground">Restaurant: </span>
                {activeOrder.restaurant?.name ?? "-"}
              </p>
              <p>
                <span className="text-muted-foreground">Customer: </span>
                {activeOrder.customer?.name ?? "-"}
              </p>
              <p>
                <span className="text-muted-foreground">Address: </span>
                {activeOrder.address?.address_line_1 ?? "-"}
              </p>
              <StatusBadge value={activeOrder.status} type="order" />
              <p className="text-xs text-muted-foreground">Updated {formatDate(activeOrder.updated_at ?? activeOrder.created_at)}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active order right now.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
