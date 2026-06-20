export type UserRole = "super_admin" | "restaurant_owner" | "driver" | "customer";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ApiErrorMap {
  [key: string]: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiErrorMap;
}

export interface Pagination<T> {
  items: T[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  data?: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  is_active: boolean;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Restaurant {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  delivery_fee?: number;
  min_order_amount?: number;
  delivery_time_min?: number;
  delivery_time_max?: number;
  opening_time?: string | null;
  closing_time?: string | null;
  commission_rate?: number;
  average_rating?: number;
  total_reviews?: number;
  is_open?: boolean;
  is_active?: boolean;
  is_approved?: boolean;
  owner?: User;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  restaurant_id: number;
  name: string;
  image?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  category_id: number;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  is_available: boolean;
  prep_time?: number | null;
  calories?: number | null;
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: number;
  user_id: number;
  title?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
  menu_item?: MenuItem;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  restaurant_id: number;
  driver_id?: number | null;
  status: OrderStatus;
  payment_method?: string | null;
  payment_status: PaymentStatus;
  subtotal?: number;
  delivery_fee?: number;
  discount_amount?: number;
  total?: number;
  total_amount?: number;
  items_count?: number;
  notes?: string | null;
  estimated_delivery_time?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
  delivery_address?: {
    address?: string;
    city?: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
  address?: Address;
  customer?: User;
  restaurant?: Restaurant;
  driver?: User | null;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: number;
  order_id: number;
  restaurant_id: number;
  customer_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
  customer?: User;
}

export interface PromoCode {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  updated_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title?: string;
  body?: string;
  message?: string;
  data?: Record<string, unknown>;
  is_read?: boolean;
  read_at?: string | null;
  created_at: string;
}

export interface AdminDashboard {
  total_restaurants: number;
  total_customers: number;
  total_drivers: number;
  today_revenue: number;
  recent_orders: Order[];
  top_restaurants: Array<{
    restaurant: Restaurant;
    orders_count: number;
    revenue: number;
  }>;
}

export interface RestaurantDashboard {
  today_orders_count: number;
  today_revenue: number;
  pending_orders_count: number;
  average_rating: number;
  recent_orders: Order[];
  restaurant: Restaurant | null;
  needs_setup?: boolean;
}

export interface DriverDashboard {
  today_deliveries: number;
  today_earnings: number;
  week_earnings: number;
  online: boolean;
  active_order?: Order | null;
}

export interface EarningsSummary {
  total_revenue?: number;
  commission_paid?: number;
  net_earnings?: number;
  total_orders?: number;
  today?: number;
  week?: number;
  month?: number;
  all_time?: number;
}
