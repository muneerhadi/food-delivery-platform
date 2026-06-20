"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { restaurantApi, extractApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, resolveMediaUrl } from "@/lib/utils";
import type { Category } from "@/types";

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

export default function RestaurantMenuPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState<MenuItemForm>(defaultItemForm);

  const { data: categories = [] } = useQuery({
    queryKey: ["restaurant-categories"],
    queryFn: async () => (await restaurantApi.categories()).data.data,
  });

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["restaurant-menu-items"],
    queryFn: async () => (await restaurantApi.menuItems()).data.data,
  });

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

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
      if (payload.id) {
        return restaurantApi.updateMenuItem(payload.id, request);
      }
      return restaurantApi.createMenuItem(request);
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
      reload();
    },
    onError: (error) => toast.error(extractApiError(error, "Failed to delete menu item")),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (id: number) => restaurantApi.toggleMenuItemAvailability(id),
    onSuccess: () => reload(),
  });

  const filteredItems = useMemo(
    () => menuItems.filter((item) => !selectedCategoryId || item.category_id === selectedCategoryId),
    [menuItems, selectedCategoryId]
  );

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

  return (
    <section className="space-y-6">
      <PageHeader
        title="Menu Management"
        description="Organize categories and menu items."
        actions={
          <Button
            onClick={() => {
              setItemForm({
                ...defaultItemForm,
                category_id: selectedCategoryId ? String(selectedCategoryId) : "",
              });
              setItemDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="New category"
              />
              <Button
                size="sm"
                onClick={() => newCategoryName.trim() && createCategoryMutation.mutate(newCategoryName.trim())}
              >
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    selectedCategoryId === category.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{category.name}</p>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveCategory(category.id, "up");
                        }}
                        disabled={index === 0}
                      >
                        Up
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveCategory(category.id, "down");
                        }}
                        disabled={index === categories.length - 1}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteCategoryMutation.mutate(category.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading menu...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <StatusBadge value={item.is_available ? "active" : "inactive"} type="active" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description ?? "No description"}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleItemMutation.mutate(item.id)}>
                        {item.is_available ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
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
                        }}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteItemMutation.mutate(item.id)}>
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                    No menu items in this category yet.
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{itemForm.id ? "Edit Menu Item" : "Create Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={itemForm.name} onChange={(event) => setItemForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                value={itemForm.description}
                onChange={(event) => setItemForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={itemForm.price}
                  onChange={(event) => setItemForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
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
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Availability</p>
                <p className="text-xs text-muted-foreground">Show this item in customer app</p>
              </div>
              <Switch
                checked={itemForm.is_available}
                onCheckedChange={(checked) => setItemForm((prev) => ({ ...prev, is_available: checked }))}
              />
            </div>
            <ImageUpload
              value={itemForm.imagePreview}
              onChange={(file) =>
                setItemForm((prev) => ({
                  ...prev,
                  imageFile: file,
                  imagePreview: file ? URL.createObjectURL(file) : prev.imagePreview,
                }))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveItemMutation.mutate(itemForm)}
              disabled={
                saveItemMutation.isPending || !itemForm.name || !itemForm.price || !itemForm.category_id
              }
            >
              {saveItemMutation.isPending ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
