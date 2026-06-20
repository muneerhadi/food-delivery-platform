"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, resolveMediaUrl } from "@/lib/utils";
import type { Restaurant } from "@/types";

export default function AdminRestaurantsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [approvedFilter, setApprovedFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const [approveTarget, setApproveTarget] = useState<Restaurant | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Restaurant | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurants", page, search, approvedFilter, activeFilter],
    queryFn: async () =>
      (
        await adminApi.restaurants({
          page,
          search: search || undefined,
          is_approved: approvedFilter === "all" ? undefined : approvedFilter === "approved",
          is_active: activeFilter === "all" ? undefined : activeFilter === "active",
        })
      ).data.data,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => adminApi.approveRestaurant(id),
    onSuccess: () => {
      toast.success("Restaurant approved");
      setApproveTarget(null);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to approve restaurant")),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => adminApi.rejectRestaurant(id, reason),
    onSuccess: () => {
      toast.success("Restaurant rejected");
      setRejectTarget(null);
      setRejectReason("");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to reject restaurant")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Restaurant> }) => adminApi.updateRestaurant(id, payload),
    onSuccess: () => {
      toast.success("Restaurant updated");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update restaurant")),
  });

  const rows = data?.items ?? [];

  const columns: Array<DataTableColumn<Restaurant>> = useMemo(
    () => [
      {
        key: "logo",
        title: "Logo",
        render: (row) => (
          <div className="h-9 w-9 overflow-hidden rounded-full bg-muted">
            {row.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveMediaUrl(row.logo) ?? ""}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        ),
      },
      { key: "name", title: "Name", render: (row) => row.name },
      { key: "owner", title: "Owner", render: (row) => row.owner?.name ?? "-" },
      { key: "city", title: "City", render: (row) => row.city ?? "-" },
      {
        key: "commission",
        title: "Commission",
        render: (row) => (row.commission_rate ? `${row.commission_rate}%` : formatCurrency(0)),
      },
      {
        key: "status",
        title: "Status",
        render: (row) => (
          <div className="flex gap-1">
            <StatusBadge value={row.is_approved ? "approved" : "pending"} type="active" />
            <StatusBadge value={row.is_open ? "open" : "closed"} type="active" />
          </div>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        className: "w-[330px]",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/admin/restaurants/${row.id}`}>View</Link>
            </Button>
            {!row.is_approved ? (
              <Button size="sm" onClick={() => setApproveTarget(row)}>
                Approve
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setRejectTarget(row)}>
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const input = window.prompt("New commission rate (%)", String(row.commission_rate ?? 0));
                if (!input) return;
                const value = Number(input);
                if (Number.isNaN(value)) {
                  toast.error("Invalid number");
                  return;
                }
                updateMutation.mutate({ id: row.id, payload: { commission_rate: value } });
              }}
            >
              Edit Commission
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateMutation.mutate({ id: row.id, payload: { is_active: !row.is_active } })}
            >
              {row.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ),
      },
    ],
    [toast, updateMutation]
  );

  return (
    <section className="space-y-6">
      <PageHeader title="Restaurants" description="Manage restaurant approvals, commission, and active state." />

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-4">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search restaurant..." />
        <Select value={approvedFilter} onValueChange={setApprovedFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Approved" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All approval states</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All active states</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" onClick={() => reload()}>
          Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        pagination={{
          page: data?.pagination?.current_page ?? 1,
          totalPages: data?.pagination?.last_page ?? 1,
          onPageChange: setPage,
        }}
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve restaurant?"
        description={`Approve "${approveTarget?.name ?? ""}" to go live.`}
        onCancel={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && approveMutation.mutate(approveTarget.id)}
        isLoading={approveMutation.isPending}
      />

      <Dialog open={Boolean(rejectTarget)} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject restaurant</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Reason</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain why this restaurant is rejected..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={rejectMutation.isPending || rejectReason.trim().length < 3}
              onClick={() => {
                if (!rejectTarget) return;
                rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason });
              }}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
