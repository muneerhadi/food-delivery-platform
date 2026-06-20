"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { driverApi, extractApiError } from "@/lib/api";
import { formatCurrency, formatDate, orderDeliveryAddress, orderTotal } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { useEffect, useMemo, useState } from "react";

const activeStatuses = new Set<OrderStatus>(["ready", "picked_up", "on_the_way"]);

function nextDriverStatus(status: OrderStatus): { status: OrderStatus; label: string } | null {
  if (status === "ready") return { status: "picked_up", label: "Mark Picked Up" };
  if (status === "picked_up") return { status: "on_the_way", label: "On The Way" };
  if (status === "on_the_way") return { status: "delivered", label: "Mark Delivered" };
  return null;
}

export default function DriverDashboardPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem("driver-online-status");
    setOnline(value === "true");
  }, []);

  const { data: availableOrders = [] } = useQuery({
    queryKey: ["driver-available-orders"],
    queryFn: async () => (await driverApi.availableOrders({ per_page: 50 })).data.data.items ?? [],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["driver-dashboard-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100, status: "active" })).data.data.items ?? [],
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ["driver-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100 })).data.data.items ?? [],
  });

  const { data: earnings } = useQuery({
    queryKey: ["driver-dashboard-earnings"],
    queryFn: async () => (await driverApi.earnings()).data.data,
  });

  const acceptMutation = useMutation({
    mutationFn: async (orderNumber: string) => driverApi.acceptOrder(orderNumber),
    onSuccess: () => {
      toast.success("Order accepted");
      queryClient.invalidateQueries({ queryKey: ["driver-available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to accept order")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) =>
      driverApi.updateOrderStatus(orderNumber, status),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update order")),
  });

  const activeOrder = useMemo(
    () => orders.find((order) => activeStatuses.has(order.status)),
    [orders]
  );

  const todayDeliveries = useMemo(() => {
    const today = new Date().toDateString();
    return allOrders.filter(
      (order) => order.status === "delivered" && new Date(order.updated_at ?? order.created_at).toDateString() === today
    ).length;
  }, [allOrders]);

  const todayEarnings = Number(earnings?.today ?? 0);
  const weekEarnings = Number(earnings?.week ?? 0);
  const activeAction = activeOrder ? nextDriverStatus(activeOrder.status) : null;

  return (
    <section className="space-y-6">
      <PageHeader title="Driver Dashboard" description="Accept ready orders and complete deliveries." />

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
          <CardTitle>Ready for Pickup ({availableOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders waiting for a driver right now.</p>
          ) : (
            availableOrders.map((order) => (
              <div key={order.id} className="rounded-xl border p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-semibold">#{order.order_number}</p>
                    <p>
                      <span className="text-muted-foreground">Restaurant: </span>
                      {order.restaurant?.name ?? "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Deliver to: </span>
                      {orderDeliveryAddress(order)}
                    </p>
                    <p className="font-medium">{formatCurrency(orderTotal(order))}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptMutation.mutate(order.order_number)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? "Accepting..." : "Accept Order"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Active Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          {activeOrder ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-semibold">#{activeOrder.order_number}</p>
                <StatusBadge value={activeOrder.status} type="order" />
              </div>
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
                {orderDeliveryAddress(activeOrder)}
              </p>
              <p className="font-semibold">{formatCurrency(orderTotal(activeOrder))}</p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDate(activeOrder.updated_at ?? activeOrder.created_at)}
              </p>
              {activeAction ? (
                <Button
                  className="w-full"
                  onClick={() =>
                    updateMutation.mutate({
                      orderNumber: activeOrder.order_number,
                      status: activeAction.status,
                    })
                  }
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Updating..." : activeAction.label}
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active delivery. Accept a ready order above.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
