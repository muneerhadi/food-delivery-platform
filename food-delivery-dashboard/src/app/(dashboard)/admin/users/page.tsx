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
import type { User, UserRole } from "@/types";

const roleOptions: UserRole[] = ["super_admin", "restaurant_owner", "driver", "customer"];

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

const initialCreateUserForm: CreateUserForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "restaurant_owner",
};

export default function AdminUsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(initialCreateUserForm);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn: async () =>
      (
        await adminApi.users({
          page,
          search: search || undefined,
          role: role === "all" ? undefined : role,
        })
      ).data.data,
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateUserForm) => adminApi.createUser(payload),
    onSuccess: () => {
      toast.success("User created");
      setCreateOpen(false);
      setForm(initialCreateUserForm);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to create user")),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: number) => adminApi.toggleUserActive(id),
    onSuccess: () => {
      toast.success("User status updated");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update user status")),
  });

  const rows = data?.data ?? [];

  const columns: Array<DataTableColumn<User>> = useMemo(
    () => [
      {
        key: "avatar",
        title: "Avatar",
        render: (user) => (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {(user.name || "U")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        ),
      },
      { key: "name", title: "Name", render: (user) => user.name },
      { key: "email", title: "Email", render: (user) => user.email },
      { key: "role", title: "Role", render: (user) => <StatusBadge value={user.role} type="role" /> },
      { key: "phone", title: "Phone", render: (user) => user.phone ?? "-" },
      { key: "status", title: "Status", render: (user) => <StatusBadge value={user.is_active ? "active" : "inactive"} type="active" /> },
      { key: "joined", title: "Joined", render: (user) => formatDate(user.created_at) },
      {
        key: "actions",
        title: "Actions",
        render: (user) => (
          <Button variant="outline" size="sm" onClick={() => toggleActiveMutation.mutate(user.id)}>
            {user.is_active ? "Deactivate" : "Activate"}
          </Button>
        ),
      },
    ],
    [toggleActiveMutation]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage all platform users by role and status."
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create User
          </Button>
        }
      />

      <div className="grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-3">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={reload}>
          Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoading}
        pagination={{
          page: data?.current_page ?? 1,
          totalPages: data?.last_page ?? 1,
          onPageChange: setPage,
        }}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value as UserRole }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.name || !form.email || !form.password}
            >
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
