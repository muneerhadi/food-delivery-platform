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
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const completedStatuses = new Set<OrderStatus>(["delivered", "cancelled"]);
const activeStatuses = new Set<OrderStatus>(["confirmed", "ready", "picked_up", "on_the_way"]);

function nextDriverStatus(status: OrderStatus): { status: OrderStatus; label: string } | null {
  if (status === "confirmed" || status === "ready") return { status: "picked_up", label: "Picked Up" };
  if (status === "picked_up") return { status: "on_the_way", label: "On The Way" };
  if (status === "on_the_way") return { status: "delivered", label: "Delivered" };
  return null;
}

function OrderCard({
  order,
  onAdvance,
  loading,
}: {
  order: Order;
  onAdvance: (order: Order) => void;
  loading: boolean;
}) {
  const action = nextDriverStatus(order.status);
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
          {order.address?.address_line_1 ?? "-"}
        </p>
        <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
        {action ? (
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

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["driver-orders"],
    queryFn: async () => (await driverApi.orders({ per_page: 100 })).data.data.data,
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
      <PageHeader title="My Orders" description="Track active deliveries and completed drop-offs." />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading active orders...</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeOrders.map((order) => {
                const action = nextDriverStatus(order.status);
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
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
                  No active orders.
                </div>
              ) : null}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} loading={false} onAdvance={() => undefined} />
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
