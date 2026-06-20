"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate, orderItemCount, orderTotal } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready"];

const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
};

const restaurantLockedStatuses: OrderStatus[] = [
  "ready",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
];

export default function RestaurantOrdersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<OrderStatus>("pending");
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["restaurant-orders"],
    queryFn: async () => (await restaurantApi.orders({ per_page: 100 })).data.data.items ?? [],
  });

  const { data: selectedOrder, isLoading: detailLoading } = useQuery({
    queryKey: ["restaurant-order", selectedOrderNumber],
    queryFn: async () => (await restaurantApi.order(selectedOrderNumber!)).data.data,
    enabled: Boolean(selectedOrderNumber),
  });

  const grouped = useMemo(
    () =>
      statuses.reduce<Record<OrderStatus, Order[]>>(
        (acc, status) => {
          acc[status] = data.filter((order) => order.status === status);
          return acc;
        },
        {
          pending: [],
          confirmed: [],
          preparing: [],
          ready: [],
          picked_up: [],
          on_the_way: [],
          delivered: [],
          cancelled: [],
        }
      ),
    [data]
  );

  const advanceMutation = useMutation({
    mutationFn: async ({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) =>
      restaurantApi.updateOrderStatus(orderNumber, status),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-order"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-dashboard"] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update order status")),
  });

  return (
    <section className="space-y-6">
      <PageHeader title="Orders" description="Track and process active kitchen orders." />

      <Tabs value={tab} onValueChange={(value) => setTab(value as OrderStatus)}>
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          {statuses.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status.replace("_", " ")}
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {grouped[status]?.map((order) => (
                  <Card key={order.id} className="cursor-pointer hover:border-primary/50" onClick={() => setSelectedOrderNumber(order.order_number)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>#{order.order_number}</span>
                        <StatusBadge value={order.status} type="order" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        {orderItemCount(order)} items - {order.customer?.name?.split(" ")[0] ?? "Customer"}
                      </p>
                      <p className="font-semibold">{formatCurrency(orderTotal(order))}</p>
                      <p className="text-xs text-muted-foreground">Placed {formatDate(order.created_at)}</p>
                    </CardContent>
                  </Card>
                ))}
                {grouped[status]?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                    No {status.replace("_", " ")} orders right now.
                  </div>
                ) : null}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Sheet open={Boolean(selectedOrderNumber)} onOpenChange={(open) => !open && setSelectedOrderNumber(null)}>
        <SheetContent>
          {detailLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading order details...</p>
          ) : selectedOrder ? (
            <>
              <SheetHeader>
                <SheetTitle>Order #{selectedOrder.order_number}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <StatusBadge value={selectedOrder.status} type="order" />
                <p>
                  <span className="text-muted-foreground">Customer: </span>
                  {selectedOrder.customer?.name ?? "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">Total: </span>
                  {formatCurrency(orderTotal(selectedOrder))}
                </p>
                <div className="space-y-1">
                  {(selectedOrder.items ?? []).map((item) => (
                    <p key={item.id}>
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                </div>
                {nextStatusMap[selectedOrder.status] ? (
                  <Button
                    className="w-full"
                    onClick={() =>
                      advanceMutation.mutate({
                        orderNumber: selectedOrder.order_number,
                        status: nextStatusMap[selectedOrder.status] as OrderStatus,
                      })
                    }
                    disabled={advanceMutation.isPending}
                  >
                    {advanceMutation.isPending
                      ? "Updating..."
                      : `Mark as ${nextStatusMap[selectedOrder.status]?.replace(/_/g, " ")}`}
                  </Button>
                ) : restaurantLockedStatuses.includes(selectedOrder.status) ? (
                  <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                    {selectedOrder.status === "ready"
                      ? "This order is ready. Waiting for a driver to pick it up — you can no longer change the status."
                      : "This order has moved past the kitchen. Status updates are handled by the driver."}
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Order not found.</p>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
