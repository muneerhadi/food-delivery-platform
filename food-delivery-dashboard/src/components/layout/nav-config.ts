import {
  BarChart3,
  Bell,
  Home,
  MenuSquare,
  Percent,
  ReceiptText,
  Store,
  Truck,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const navByRole: Record<Exclude<UserRole, "customer">, NavItem[]> = {
  super_admin: [
    { label: "Dashboard", href: "/admin", icon: Home },
    { label: "Restaurants", href: "/admin/restaurants", icon: Store },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Orders", href: "/admin/orders", icon: ReceiptText },
    { label: "Promo Codes", href: "/admin/promos", icon: Percent },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: UserRound },
  ],
  restaurant_owner: [
    { label: "Dashboard", href: "/restaurant", icon: Home },
    { label: "Menu", href: "/restaurant/menu", icon: MenuSquare },
    { label: "Orders", href: "/restaurant/orders", icon: ReceiptText },
    { label: "Earnings", href: "/restaurant/earnings", icon: WalletCards },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/restaurant/settings", icon: UserRound },
  ],
  driver: [
    { label: "Dashboard", href: "/driver", icon: Home },
    { label: "My Orders", href: "/driver/orders", icon: Truck },
    { label: "Earnings", href: "/driver/earnings", icon: WalletCards },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Settings", href: "/driver/settings", icon: UserRound },
  ],
};
