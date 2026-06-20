"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/lib/api";
import { formatCurrency, formatDate, orderDeliveryAddress } from "@/lib/utils";

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderNumber],
    queryFn: async () => (await adminApi.order(orderNumber)).data.data,
    enabled: Boolean(orderNumber),
  });

  if (isLoading) return <LoadingSpinner label="Loading order detail..." />;
  if (!data) return <p className="text-sm text-muted-foreground">Order not found.</p>;

  return (
    <PageShell>
      <PageHeader
        title={`Order ${data.order_number}`}
        description="View-only order details. Status changes are handled by restaurants and drivers."
      />

      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <StatusBadge value={data.status} type="order" />
          <StatusBadge value={data.payment_status} type="payment" />
          <span className="text-sm text-muted-foreground">Placed {formatDate(data.created_at)}</span>
          <span className="text-sm font-semibold">{formatCurrency(data.total_amount)}</span>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <PageSection title="Customer" contentClassName="space-y-2 text-sm">
          <p className="font-medium">{data.customer?.name ?? "—"}</p>
          <p className="text-muted-foreground">{data.customer?.phone ?? "—"}</p>
          <p className="text-muted-foreground">{orderDeliveryAddress(data)}</p>
        </PageSection>

        <PageSection title="Restaurant" contentClassName="space-y-2 text-sm">
          <p className="font-medium">{data.restaurant?.name ?? "—"}</p>
          <p className="text-muted-foreground">{data.restaurant?.phone ?? "—"}</p>
          <p className="text-muted-foreground">{data.restaurant?.address ?? "—"}</p>
        </PageSection>

        <PageSection title="Driver" contentClassName="space-y-2 text-sm">
          <p className="font-medium">{data.driver?.name ?? "Not assigned"}</p>
          <p className="text-muted-foreground">{data.driver?.phone ?? "—"}</p>
        </PageSection>
      </div>

      <PageSection title="Payment summary" contentClassName="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">Method: </span>
          {data.payment_method ?? "—"}
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
        <p className="font-semibold sm:col-span-2">
          <span className="text-muted-foreground">Total: </span>
          {formatCurrency(data.total_amount)}
        </p>
      </PageSection>

      <PageSection title="Order items" contentClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit price</TableHead>
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
      </PageSection>
    </PageShell>
  );
}
