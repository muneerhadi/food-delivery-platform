"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Eye, Percent, RefreshCw, Search, Store } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { resolveMediaUrl } from "@/lib/utils";
import type { Restaurant } from "@/types";

function RestaurantCard({
  restaurant,
  onApprove,
  onReject,
  onToggleActive,
  onEditCommission,
  isUpdating,
}: {
  restaurant: Restaurant;
  onApprove: () => void;
  onReject: () => void;
  onToggleActive: () => void;
  onEditCommission: () => void;
  isUpdating: boolean;
}) {
  const logoUrl = resolveMediaUrl(restaurant.logo);

  return (
    <article className="flex flex-col rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-start gap-4 p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
          {logoUrl ? (
            <Image src={logoUrl} alt={restaurant.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate font-semibold">{restaurant.name}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {restaurant.city ?? restaurant.address ?? "No location set"}
          </p>
          <p className="text-xs text-muted-foreground">
            Owner: {restaurant.owner?.name ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
        <StatusBadge value={restaurant.is_approved ? "approved" : "pending"} type="active" />
        <StatusBadge value={restaurant.is_active ? "active" : "inactive"} type="active" />
        <StatusBadge value={restaurant.is_open ? "open" : "closed"} type="active" />
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {restaurant.commission_rate ?? 0}% commission
        </span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-border/60 p-4">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/restaurants/${restaurant.id}`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        {!restaurant.is_approved ? (
          <Button size="sm" onClick={onApprove} disabled={isUpdating}>
            Approve
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={onReject} disabled={isUpdating}>
          Reject
        </Button>
        <Button size="sm" variant="outline" onClick={onEditCommission} disabled={isUpdating}>
          <Percent className="mr-1.5 h-3.5 w-3.5" />
          Commission
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggleActive} disabled={isUpdating}>
          {restaurant.is_active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </article>
  );
}

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
  const [commissionTarget, setCommissionTarget] = useState<Restaurant | null>(null);
  const [commissionRate, setCommissionRate] = useState("");

  const { data, isLoading, isFetching, refetch } = useQuery({
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
    mutationFn: async ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectRestaurant(id, reason),
    onSuccess: () => {
      toast.success("Restaurant rejected");
      setRejectTarget(null);
      setRejectReason("");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to reject restaurant")),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Restaurant> }) =>
      adminApi.updateRestaurant(id, payload),
    onSuccess: () => {
      toast.success("Restaurant updated");
      setCommissionTarget(null);
      setCommissionRate("");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update restaurant")),
  });

  const rows = data?.items ?? [];
  const currentPage = data?.pagination?.current_page ?? 1;
  const totalPages = data?.pagination?.last_page ?? 1;
  const isUpdating = approveMutation.isPending || rejectMutation.isPending || updateMutation.isPending;

  const openCommissionDialog = (restaurant: Restaurant) => {
    setCommissionTarget(restaurant);
    setCommissionRate(String(restaurant.commission_rate ?? 0));
  };

  return (
    <PageShell>
      <PageHeader
        title="Restaurants"
        description="Review listings, approve new partners, and manage commission and access."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <PageSection
        title="Search & filters"
        description="Find restaurants by name or narrow by approval and active status."
        contentClassName="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name..."
              className="pl-9"
            />
          </div>
          <Select
            value={approvedFilter}
            onValueChange={(value) => {
              setApprovedFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Approval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All approval states</SelectItem>
              <SelectItem value="approved">Approved only</SelectItem>
              <SelectItem value="pending">Pending approval</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={activeFilter}
            onValueChange={(value) => {
              setActiveFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Active status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All active states</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PageSection>

      <PageSection
        title="All restaurants"
        badge={data?.pagination?.total ?? rows.length}
        description="Tap View for full details. Approve pending restaurants before they go live."
        contentClassName="space-y-4"
      >
        {isLoading ? (
          <LoadingSpinner label="Loading restaurants..." />
        ) : rows.length === 0 ? (
          <EmptyState message="No restaurants match your filters. Try clearing search or changing filters." />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isUpdating={isUpdating}
                  onApprove={() => setApproveTarget(restaurant)}
                  onReject={() => {
                    setRejectTarget(restaurant);
                    setRejectReason("");
                  }}
                  onToggleActive={() =>
                    updateMutation.mutate({
                      id: restaurant.id,
                      payload: { is_active: !restaurant.is_active },
                    })
                  }
                  onEditCommission={() => openCommissionDialog(restaurant)}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        )}
      </PageSection>

      <ConfirmDialog
        open={Boolean(approveTarget)}
        title="Approve this restaurant?"
        description={`"${approveTarget?.name ?? ""}" will be approved and can operate on the platform.`}
        confirmText="Approve"
        onCancel={() => setApproveTarget(null)}
        onConfirm={() => approveTarget && approveMutation.mutate(approveTarget.id)}
        isLoading={approveMutation.isPending}
      />

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject restaurant</DialogTitle>
            <DialogDescription>
              {rejectTarget
                ? `Provide a reason for rejecting "${rejectTarget.name}". The owner may see this message.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Rejection reason</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="e.g. Incomplete profile or missing required documents..."
              rows={4}
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
                rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason.trim() });
              }}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject restaurant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(commissionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setCommissionTarget(null);
            setCommissionRate("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit commission rate</DialogTitle>
            <DialogDescription>
              {commissionTarget
                ? `Set the platform commission percentage for "${commissionTarget.name}".`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={commissionRate}
              onChange={(event) => setCommissionRate(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCommissionTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending || commissionRate.trim() === ""}
              onClick={() => {
                if (!commissionTarget) return;
                const value = Number(commissionRate);
                if (Number.isNaN(value) || value < 0 || value > 100) {
                  toast.error("Enter a valid percentage between 0 and 100");
                  return;
                }
                updateMutation.mutate({
                  id: commissionTarget.id,
                  payload: { commission_rate: value },
                });
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save commission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
