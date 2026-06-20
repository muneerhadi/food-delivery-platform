"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoRow } from "@/components/shared/InfoRow";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { driverApi, extractApiError } from "@/lib/api";
import { formatCurrency, formatDate, orderDeliveryAddress, orderTotal } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { useEffect, useMemo, useState } from "react";

const activeStatuses = new Set<OrderStatus>(["ready", "picked_up", "on_the_way"]);

function nextDriverStatus(status: OrderStatus): { status: OrderStatus; label: string } | null {
  if (status === "ready") return { status: "picked_up", label: "Mark Picked Up" };
  if (status === "picked_up") return { status: "on_the_way", label: "On The Way" };
  if (status === "on_the_way") return { status: "delivered", label: "Mark Delivered" };
  return null;
}

function OrderPanel({
  order,
  action,
}: {
  order: Order;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">#{order.order_number}</span>
          <StatusBadge value={order.status} type="order" />
        </div>
        <span className="text-sm font-semibold">{formatCurrency(orderTotal(order))}</span>
      </div>
      <div className="space-y-2">
        <InfoRow label="Restaurant" value={order.restaurant?.name ?? "-"} />
        {order.restaurant?.address ? <InfoRow label="Pickup" value={order.restaurant.address} /> : null}
        <InfoRow label="Deliver to" value={orderDeliveryAddress(order)} />
        {order.customer?.name ? <InfoRow label="Customer" value={order.customer.name} /> : null}
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default function DriverDashboardPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem("driver-online-status");
    setOnline(value === "true");
  }, []);

  const { data: upcomingOrders = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ["driver-upcoming-orders"],
    queryFn: async () => (await driverApi.upcomingOrders({ per_page: 50 })).data.data.items ?? [],
    refetchInterval: 15000,
  });

  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ["driver-available-orders"],
    queryFn: async () => (await driverApi.availableOrders({ per_page: 50 })).data.data.items ?? [],
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["driver-dashboard-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100, status: "active" })).data.data.items ?? [],
  });

  const { data: allOrders = [], isLoading: loadingAllOrders } = useQuery({
    queryKey: ["driver-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100 })).data.data.items ?? [],
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
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
  const isPageLoading = loadingUpcoming || loadingAvailable || loadingOrders || loadingAllOrders || loadingEarnings;

  if (isPageLoading) {
    return <LoadingSpinner label="Loading driver dashboard..." />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Driver Dashboard"
        description="See what's being prepared, accept ready orders, and finish deliveries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's deliveries" value={todayDeliveries} />
        <StatCard title="Today's earnings" value={formatCurrency(todayEarnings)} />
        <StatCard title="This week" value={formatCurrency(weekEarnings)} />
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">You're</p>
              <div className="mt-2">
                <StatusBadge value={online ? "online" : "offline"} type="active" />
              </div>
            </div>
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

      <div className="grid gap-6 xl:grid-cols-2">
        <PageSection
          title="Upcoming orders"
          badge={upcomingOrders.length}
          description="Orders accepted or being prepared at the restaurant."
          contentClassName="space-y-3"
        >
          {upcomingOrders.length === 0 ? (
            <EmptyState message="Nothing in the kitchen yet. Orders show up here when a restaurant starts preparing." />
          ) : (
            upcomingOrders.map((order) => (
              <OrderPanel
                key={order.id}
                order={order}
                action={
                  <p className="text-xs text-muted-foreground">
                    {order.status === "confirmed"
                      ? "Restaurant accepted — food will be prepared soon."
                      : "Restaurant is preparing this order."}
                  </p>
                }
              />
            ))
          )}
        </PageSection>

        <PageSection
          title="Ready for pickup"
          badge={availableOrders.length}
          description="Accept an order when it's ready at the restaurant."
          contentClassName="space-y-3"
        >
          {availableOrders.length === 0 ? (
            <EmptyState message="No orders waiting for pickup right now." />
          ) : (
            availableOrders.map((order) => (
              <OrderPanel
                key={order.id}
                order={order}
                action={
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => acceptMutation.mutate(order.order_number)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? "Accepting..." : "Accept order"}
                  </Button>
                }
              />
            ))
          )}
        </PageSection>
      </div>

      <PageSection title="Active delivery" description="Your current delivery and next step.">
        {activeOrder ? (
          <OrderPanel
            order={activeOrder}
            action={
              <div className="space-y-3">
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
            }
          />
        ) : (
          <EmptyState message="No active delivery. Accept a ready order above to start." />
        )}
      </PageSection>
    </PageShell>
  );
}
