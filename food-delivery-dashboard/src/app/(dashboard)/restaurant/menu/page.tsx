"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageSection } from "@/components/shared/PageSection";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { cn, formatCurrency, resolveMediaUrl } from "@/lib/utils";
import type { Category, MenuItem } from "@/types";

interface MenuItemForm {
  id?: number;
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_available: boolean;
  imageFile: File | null;
  imagePreview: string | null;
}

const defaultItemForm: MenuItemForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  is_available: true,
  imageFile: null,
  imagePreview: null,
};

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      {hint ? <p className="mb-2 text-xs text-muted-foreground">{hint}</p> : <div className="mb-2" />}
      {children}
    </div>
  );
}

export default function RestaurantMenuPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState<MenuItemForm>(defaultItemForm);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "item"; id: number; name: string } | null>(
    null
  );

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["restaurant-categories"],
    queryFn: async () => (await restaurantApi.categories()).data.data,
  });

  const { data: menuItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["restaurant-menu-items"],
    queryFn: async () => (await restaurantApi.menuItems()).data.data,
  });

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const filteredItems = useMemo(
    () => menuItems.filter((item) => !selectedCategoryId || item.category_id === selectedCategoryId),
    [menuItems, selectedCategoryId]
  );

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: ["restaurant-categories"] });
    queryClient.invalidateQueries({ queryKey: ["restaurant-menu-items"] });
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) =>
      restaurantApi.createCategory({
        name,
        sort_order: categories.length + 1,
        is_active: true,
      }),
    onSuccess: () => {
      toast.success("Category added");
      setNewCategoryName("");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to add category")),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => restaurantApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      setDeleteTarget(null);
      setSelectedCategoryId(null);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to delete category")),
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedCategories: Category[]) =>
      restaurantApi.reorderCategories(
        orderedCategories.map((category, index) => ({ id: category.id, sort_order: index + 1 }))
      ),
    onSuccess: () => reload(),
  });

  const saveItemMutation = useMutation({
    mutationFn: async (payload: MenuItemForm) => {
      const request = {
        name: payload.name,
        description: payload.description,
        price: Number(payload.price),
        category_id: Number(payload.category_id),
        is_available: payload.is_available,
      };

      const response = payload.id
        ? await restaurantApi.updateMenuItem(payload.id, request)
        : await restaurantApi.createMenuItem(request);

      const savedItem = response.data.data;

      if (payload.imageFile && savedItem?.id) {
        await restaurantApi.uploadMenuItemImage(savedItem.id, payload.imageFile);
      }

      return savedItem;
    },
    onSuccess: () => {
      toast.success("Menu item saved");
      setItemDialogOpen(false);
      setItemForm(defaultItemForm);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to save menu item")),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => restaurantApi.deleteMenuItem(id),
    onSuccess: () => {
      toast.success("Menu item deleted");
      setDeleteTarget(null);
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to delete menu item")),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (id: number) => restaurantApi.toggleMenuItemAvailability(id),
    onSuccess: () => {
      toast.success("Availability updated");
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to update availability")),
  });

  const moveCategory = (id: number, direction: "up" | "down") => {
    const index = categories.findIndex((category) => category.id === id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const cloned = [...categories];
    const [moved] = cloned.splice(index, 1);
    cloned.splice(targetIndex, 0, moved);
    reorderMutation.mutate(cloned);
  };

  const openCreateItemDialog = () => {
    setItemForm({
      ...defaultItemForm,
      category_id: selectedCategoryId ? String(selectedCategoryId) : "",
    });
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: MenuItem) => {
    setItemForm({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category_id: String(item.category_id),
      is_available: item.is_available,
      imageFile: null,
      imagePreview: resolveMediaUrl(item.image),
    });
    setItemDialogOpen(true);
  };

  const isPageLoading = loadingCategories || loadingItems;
  const isDeleting =
    deleteCategoryMutation.isPending || deleteItemMutation.isPending;

  if (isPageLoading) {
    return <LoadingSpinner label="Loading menu..." />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Menu management"
        description="Organize categories and items that customers see in the app."
        actions={
          <Button onClick={openCreateItemDialog} disabled={categories.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Add item
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,300px)_1fr]">
        <PageSection
          title="Categories"
          description="Group your dishes. Select one to edit its items."
          badge={categories.length}
          contentClassName="space-y-4"
        >
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="New category name"
              onKeyDown={(event) => {
                if (event.key === "Enter" && newCategoryName.trim()) {
                  createCategoryMutation.mutate(newCategoryName.trim());
                }
              }}
            />
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => newCategoryName.trim() && createCategoryMutation.mutate(newCategoryName.trim())}
              disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
            >
              Add
            </Button>
          </div>

          {categories.length === 0 ? (
            <EmptyState message="Create your first category to start adding menu items." />
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => {
                const itemCount = menuItems.filter((item) => item.category_id === category.id).length;
                const isSelected = selectedCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-2 py-2 transition-colors",
                      isSelected ? "border-primary/40 bg-primary/5" : "border-border/60 hover:bg-muted/40"
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 px-2 py-1 text-left"
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      <p className="truncate text-sm font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                    </button>
                    <div className="flex shrink-0 items-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveCategory(category.id, "up")}
                        disabled={index === 0 || reorderMutation.isPending}
                        aria-label="Move category up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveCategory(category.id, "down")}
                        disabled={index === categories.length - 1 || reorderMutation.isPending}
                        aria-label="Move category down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          setDeleteTarget({ type: "category", id: category.id, name: category.name })
                        }
                        aria-label="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageSection>

        <PageSection
          title={selectedCategory?.name ?? "Menu items"}
          description={
            selectedCategory
              ? "Edit items in this category. Toggle availability without deleting."
              : "Select a category to manage its items."
          }
          badge={filteredItems.length}
          actions={
            selectedCategory ? (
              <Button size="sm" variant="outline" onClick={openCreateItemDialog}>
                <Plus className="mr-1 h-4 w-4" />
                Add item
              </Button>
            ) : null
          }
          contentClassName="space-y-4"
        >
          {!selectedCategory ? (
            <EmptyState message="Choose a category on the left to view and edit its menu items." />
          ) : filteredItems.length === 0 ? (
            <EmptyState message={`No items in "${selectedCategory.name}" yet. Click "Add item" to create one.`} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
                >
                  <div className="relative h-36 bg-muted/40">
                    {item.image ? (
                      <Image
                        src={resolveMediaUrl(item.image) ?? ""}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <StatusBadge value={item.is_available ? "active" : "inactive"} type="active" />
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="font-semibold leading-tight">{item.name}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">{formatCurrency(item.price)}</p>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {item.description?.trim() || "No description yet."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => toggleItemMutation.mutate(item.id)}
                        disabled={toggleItemMutation.isPending}
                      >
                        {item.is_available ? "Hide" : "Show"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditItemDialog(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget({ type: "item", id: item.id, name: item.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </PageSection>
      </div>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{itemForm.id ? "Edit menu item" : "Add menu item"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <Field label="Item name">
              <Input
                placeholder="e.g. Margherita Pizza"
                value={itemForm.name}
                onChange={(event) => setItemForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>

            <Field label="Description" hint="Optional. Shown to customers on the menu.">
              <Textarea
                rows={3}
                placeholder="Ingredients, size, or notes..."
                value={itemForm.description}
                onChange={(event) => setItemForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={itemForm.price}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </Field>
              <Field label="Category">
                <Select
                  value={itemForm.category_id}
                  onValueChange={(value) => setItemForm((prev) => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Available to customers</p>
                <p className="text-xs text-muted-foreground">Turn off to hide without deleting.</p>
              </div>
              <Switch
                checked={itemForm.is_available}
                onCheckedChange={(checked) => setItemForm((prev) => ({ ...prev, is_available: checked }))}
              />
            </div>

            <Field label="Photo" hint="Optional. Square or landscape photo of the dish.">
              <ImageUpload
                label="Upload item photo"
                value={itemForm.imagePreview}
                className="min-h-[160px]"
                onReject={(message) => toast.error(message)}
                onChange={(file) =>
                  setItemForm((prev) => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview,
                  }))
                }
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveItemMutation.mutate(itemForm)}
              disabled={
                saveItemMutation.isPending || !itemForm.name || !itemForm.price || !itemForm.category_id
              }
            >
              {saveItemMutation.isPending ? "Saving..." : itemForm.id ? "Save changes" : "Create item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === "category" ? "Delete category?" : "Delete menu item?"}
        description={
          deleteTarget?.type === "category"
            ? `"${deleteTarget.name}" and its items may be affected. This cannot be undone.`
            : `"${deleteTarget?.name}" will be removed from your menu permanently.`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "category") {
            deleteCategoryMutation.mutate(deleteTarget.id);
          } else {
            deleteItemMutation.mutate(deleteTarget.id);
          }
        }}
      />
    </PageShell>
  );
}
