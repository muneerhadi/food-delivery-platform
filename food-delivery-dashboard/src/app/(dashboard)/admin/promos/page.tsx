"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/utils";
import type { PromoCode } from "@/types";

interface PromoForm {
  code: string;
  type: "fixed" | "percentage";
  value: string;
  min_order_amount: string;
  usage_limit: string;
  expires_at: string;
  is_active: boolean;
}

const defaultForm: PromoForm = {
  code: "",
  type: "fixed",
  value: "",
  min_order_amount: "",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

export default function AdminPromosPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<PromoForm>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promos", page],
    queryFn: async () => (await adminApi.promos({ page })).data.data,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["admin-promos"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: PromoForm) => {
      const request = {
        code: payload.code,
        type: payload.type,
        value: Number(payload.value),
        min_order_amount: payload.min_order_amount ? Number(payload.min_order_amount) : null,
        usage_limit: payload.usage_limit ? Number(payload.usage_limit) : null,
        expires_at: payload.expires_at || null,
        is_active: payload.is_active,
      };

      if (editingPromo) {
        return adminApi.updatePromo(editingPromo.id, request);
      }
      return adminApi.createPromo(request);
    },
    onSuccess: () => {
      toast.success(editingPromo ? "Promo updated" : "Promo created");
      setOpen(false);
      setEditingPromo(null);
      setForm(defaultForm);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to save promo")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => adminApi.deletePromo(id),
    onSuccess: () => {
      toast.success("Promo deleted");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to delete promo")),
  });

  const columns: Array<DataTableColumn<PromoCode>> = useMemo(
    () => [
      { key: "code", title: "Code", render: (promo) => promo.code },
      { key: "type", title: "Type", render: (promo) => promo.type },
      { key: "value", title: "Value", render: (promo) => promo.value },
      { key: "min_order", title: "Min Order", render: (promo) => promo.min_order_amount ?? "-" },
      { key: "uses", title: "Uses", render: (promo) => `${promo.used_count ?? 0} / ${promo.usage_limit ?? "unlimited"}` },
      { key: "expiry", title: "Expiry", render: (promo) => formatDate(promo.expires_at) },
      { key: "status", title: "Status", render: (promo) => <StatusBadge value={promo.is_active ? "active" : "inactive"} type="active" /> },
      {
        key: "actions",
        title: "Actions",
        render: (promo) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingPromo(promo);
                setForm({
                  code: promo.code,
                  type: promo.type,
                  value: String(promo.value),
                  min_order_amount: promo.min_order_amount ? String(promo.min_order_amount) : "",
                  usage_limit: promo.usage_limit ? String(promo.usage_limit) : "",
                  expires_at: promo.expires_at ? promo.expires_at.slice(0, 10) : "",
                  is_active: promo.is_active,
                });
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(promo.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [deleteMutation]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Promo Codes"
        description="Create and manage discount campaigns."
        actions={
          <Button
            onClick={() => {
              setEditingPromo(null);
              setForm(defaultForm);
              setOpen(true);
            }}
          >
            Create Promo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        pagination={{
          page: data?.pagination?.current_page ?? 1,
          totalPages: data?.pagination?.last_page ?? 1,
          onPageChange: setPage,
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as PromoForm["type"] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="value">Value</Label>
              <Input id="value" type="number" value={form.value} onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="min_order_amount">Min Order</Label>
              <Input
                id="min_order_amount"
                type="number"
                value={form.min_order_amount}
                onChange={(event) => setForm((prev) => ({ ...prev, min_order_amount: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={form.usage_limit}
                onChange={(event) => setForm((prev) => ({ ...prev, usage_limit: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Input
                id="expires_at"
                type="date"
                value={form.expires_at}
                onChange={(event) => setForm((prev) => ({ ...prev, expires_at: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!form.code || !form.value || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>
              {saveMutation.isPending ? "Saving..." : "Save Promo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
