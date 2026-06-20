"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { driverApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate, orderDeliveryAddress, orderTotal } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const completedStatuses = new Set<OrderStatus>(["delivered", "cancelled"]);
const activeStatuses = new Set<OrderStatus>(["ready", "picked_up", "on_the_way"]);

function nextDriverStatus(status: OrderStatus): { status: OrderStatus; label: string } | null {
  if (status === "ready") return { status: "picked_up", label: "Mark Picked Up" };
  if (status === "picked_up") return { status: "on_the_way", label: "On The Way" };
  if (status === "on_the_way") return { status: "delivered", label: "Mark Delivered" };
  return null;
}

function OrderCard({
  order,
  onAdvance,
  onAccept,
  loading,
  mode,
}: {
  order: Order;
  onAdvance?: (order: Order) => void;
  onAccept?: (order: Order) => void;
  loading: boolean;
  mode: "available" | "active" | "completed";
}) {
  const action = mode === "active" ? nextDriverStatus(order.status) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>#{order.order_number}</span>
          <StatusBadge value={order.status} type="order" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Restaurant: </span>
          {order.restaurant?.name ?? "-"}
        </p>
        <p>
          <span className="text-muted-foreground">Restaurant Address: </span>
          {order.restaurant?.address ?? "-"}
        </p>
        <p>
          <span className="text-muted-foreground">Customer: </span>
          {order.customer?.name ?? "-"}
        </p>
        <p>
          <span className="text-muted-foreground">Delivery Address: </span>
          {orderDeliveryAddress(order)}
        </p>
        <p className="font-semibold">{formatCurrency(orderTotal(order))}</p>
        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
        {mode === "available" && onAccept ? (
          <Button size="sm" onClick={() => onAccept(order)} disabled={loading} className="w-full">
            {loading ? "Accepting..." : "Accept Order"}
          </Button>
        ) : null}
        {mode === "active" && action && onAdvance ? (
          <Button size="sm" onClick={() => onAdvance(order)} disabled={loading} className="w-full">
            {loading ? "Updating..." : action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function DriverOrdersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: availableOrders = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ["driver-available-orders"],
    queryFn: async () => (await driverApi.availableOrders({ per_page: 100 })).data.data.items ?? [],
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["driver-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100 })).data.data.items ?? [],
  });

  const acceptMutation = useMutation({
    mutationFn: async (orderNumber: string) => driverApi.acceptOrder(orderNumber),
    onSuccess: () => {
      toast.success("Order accepted");
      queryClient.invalidateQueries({ queryKey: ["driver-available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard-orders"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to accept order")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) =>
      driverApi.updateOrderStatus(orderNumber, status),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["driver-orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver-dashboard-orders"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update order")),
  });

  const activeOrders = useMemo(() => orders.filter((order) => activeStatuses.has(order.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((order) => completedStatuses.has(order.status)), [orders]);

  return (
    <section className="space-y-6">
      <PageHeader title="My Orders" description="Accept ready orders and update delivery status." />

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">Available ({availableOrders.length})</TabsTrigger>
          <TabsTrigger value="active">My Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {loadingAvailable ? (
            <p className="text-sm text-muted-foreground">Loading available orders...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {availableOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  mode="available"
                  loading={acceptMutation.isPending}
                  onAccept={(target) => acceptMutation.mutate(target.order_number)}
                />
              ))}
              {availableOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                  No orders ready for pickup.
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {loadingOrders ? (
            <p className="text-sm text-muted-foreground">Loading active orders...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeOrders.map((order) => {
                const action = nextDriverStatus(order.status);
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    mode="active"
                    loading={updateMutation.isPending}
                    onAdvance={(target) =>
                      action &&
                      updateMutation.mutate({
                        orderNumber: target.order_number,
                        status: action.status,
                      })
                    }
                  />
                );
              })}
              {activeOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                  No active deliveries. Accept an order from the Available tab.
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} mode="completed" loading={false} />
            ))}
            {completedOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                No completed orders yet.
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
