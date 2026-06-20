"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus, User } from "@/types";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "picked_up",
  "on_the_way",
  "delivered",
  "cancelled",
];

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [driverId, setDriverId] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderNumber],
    queryFn: async () => (await adminApi.order(orderNumber)).data.data,
    enabled: Boolean(orderNumber),
  });

  const { data: driverOptions } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const payload = (await adminApi.users({ role: "driver", per_page: 100 })).data.data as unknown as {
        items?: User[];
      };
      return payload.items ?? [];
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => adminApi.updateOrderStatus(orderNumber, newStatus),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderNumber] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update status")),
  });

  const assignDriverMutation = useMutation({
    mutationFn: async (id: number) => adminApi.assignDriver(orderNumber, id),
    onSuccess: () => {
      toast.success("Driver assigned");
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderNumber] });
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to assign driver")),
  });

  if (isLoading) return <LoadingSpinner label="Loading order detail..." />;
  if (!data) return <p className="text-sm text-muted-foreground">Order not found.</p>;

  return (
    <section className="space-y-6">
      <PageHeader title={`Order ${data.order_number}`} description="Inspect and force-update order status when needed." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={data.status} type="order" />
              <StatusBadge value={data.payment_status} type="payment" />
            </div>
            <p>
              <span className="text-muted-foreground">Date: </span>
              {formatDate(data.created_at)}
            </p>
            <p>
              <span className="text-muted-foreground">Payment method: </span>
              {data.payment_method ?? "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Subtotal: </span>
              {formatCurrency(data.subtotal)}
            </p>
            <p>
              <span className="text-muted-foreground">Delivery fee: </span>
              {formatCurrency(data.delivery_fee)}
            </p>
            <p>
              <span className="text-muted-foreground">Discount: </span>
              {formatCurrency(data.discount_amount)}
            </p>
            <p className="text-base font-semibold">
              <span className="text-muted-foreground">Total: </span>
              {formatCurrency(data.total_amount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={() => statusMutation.mutate(status)} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell>{formatCurrency(item.total_price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{data.customer?.name ?? "-"}</p>
            <p>{data.customer?.phone ?? "-"}</p>
            <p className="text-muted-foreground">{data.address?.address_line_1 ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{data.restaurant?.name ?? "-"}</p>
            <p>{data.restaurant?.phone ?? "-"}</p>
            <p className="text-muted-foreground">{data.restaurant?.address ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{data.driver?.name ?? "Not assigned"}</p>
            <p>{data.driver?.phone ?? "-"}</p>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign / Change driver" />
              </SelectTrigger>
              <SelectContent>
                {(driverOptions ?? []).map((driver) => (
                  <SelectItem key={driver.id} value={String(driver.id)}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => driverId && assignDriverMutation.mutate(Number(driverId))}
              disabled={!driverId || assignDriverMutation.isPending}
            >
              {assignDriverMutation.isPending ? "Saving..." : "Assign Driver"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
