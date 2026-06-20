import axios, { AxiosError } from "axios";
import type {
  AdminDashboard,
  ApiResponse,
  Category,
  DriverDashboard,
  DriverLocation,
  EarningsSummary,
  MenuItem,
  Notification,
  Order,
  Pagination,
  PromoCode,
  Restaurant,
  RestaurantDashboard,
  Review,
  User,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

type QueryParams = Record<string, string | number | boolean | undefined>;

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string; role: User["role"] }>>("/auth/login", {
      email,
      password,
    }),
  logout: () => api.post<ApiResponse<null>>("/auth/logout"),
  me: () => api.get<ApiResponse<User>>("/auth/me"),
};

export const adminApi = {
  dashboard: () => api.get<ApiResponse<AdminDashboard>>("/admin/dashboard"),
  restaurants: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Restaurant>>>("/admin/restaurants", { params }),
  restaurant: (id: number) => api.get<ApiResponse<Restaurant>>(`/admin/restaurants/${id}`),
  approveRestaurant: (id: number) => api.post<ApiResponse<Restaurant>>(`/admin/restaurants/${id}/approve`),
  rejectRestaurant: (id: number, reason: string) =>
    api.post<ApiResponse<Restaurant>>(`/admin/restaurants/${id}/reject`, { reason }),
  updateRestaurant: (id: number, payload: Partial<Restaurant>) =>
    api.put<ApiResponse<Restaurant>>(`/admin/restaurants/${id}`, payload),
  users: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<User>>>("/admin/users", { params }),
  user: (id: number) => api.get<ApiResponse<User>>(`/admin/users/${id}`),
  createUser: (payload: Partial<User> & { password: string }) =>
    api.post<ApiResponse<User>>("/admin/users", payload),
  updateUser: (id: number, payload: Partial<User>) => api.put<ApiResponse<User>>(`/admin/users/${id}`, payload),
  toggleUserActive: (id: number) => api.post<ApiResponse<User>>(`/admin/users/${id}/toggle-active`),
  orders: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Order>>>("/admin/orders", { params }),
  order: (orderNumber: string) => api.get<ApiResponse<Order>>(`/admin/orders/${orderNumber}`),
  promos: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<PromoCode>>>("/admin/promos", { params }),
  promo: (id: number) => api.get<ApiResponse<PromoCode>>(`/admin/promos/${id}`),
  createPromo: (payload: Partial<PromoCode>) => api.post<ApiResponse<PromoCode>>("/admin/promos", payload),
  updatePromo: (id: number, payload: Partial<PromoCode>) =>
    api.put<ApiResponse<PromoCode>>(`/admin/promos/${id}`, payload),
  deletePromo: (id: number) => api.delete<ApiResponse<null>>(`/admin/promos/${id}`),
  analyticsRevenue: (period: "week" | "month" | "year") =>
    api.get<ApiResponse<Array<{ period: string; revenue: number }>>>("/admin/analytics/revenue", {
      params: { period },
    }),
  analyticsOrders: (period: "week" | "month" | "year") =>
    api.get<ApiResponse<Array<{ period: string; orders_count: number }>>>("/admin/analytics/orders", {
      params: { period },
    }),
  analyticsTopRestaurants: () =>
    api.get<ApiResponse<Array<{ restaurant: Restaurant; orders_count: number; revenue: number }>>>(
      "/admin/analytics/top-restaurants"
    ),
  analyticsTopDrivers: () =>
    api.get<ApiResponse<Array<{ driver: User; deliveries_count: number }>>>("/admin/analytics/top-drivers"),
  profile: () => api.get<ApiResponse<User>>("/admin/profile"),
  updateProfile: (payload: Partial<User>) => api.put<ApiResponse<User>>("/admin/profile", payload),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<User>>("/admin/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    api.put<ApiResponse<null>>("/admin/profile/password", payload),
};

export const restaurantApi = {
  dashboard: () => api.get<ApiResponse<RestaurantDashboard>>("/restaurant/dashboard"),
  profile: () => api.get<ApiResponse<Restaurant>>("/restaurant/profile"),
  createProfile: (payload: RestaurantProfilePayload) =>
    api.post<ApiResponse<Restaurant>>("/restaurant/profile", mapRestaurantProfilePayload(payload)),
  updateProfile: (payload: RestaurantProfilePayload) =>
    api.put<ApiResponse<Restaurant>>("/restaurant/profile", mapRestaurantProfilePayload(payload)),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<Restaurant>>("/restaurant/profile/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<Restaurant>>("/restaurant/profile/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  toggleStatus: () => api.post<ApiResponse<Restaurant>>("/restaurant/toggle-status"),
  categories: () => api.get<ApiResponse<Category[]>>("/restaurant/categories"),
  createCategory: (payload: Partial<Category>) =>
    api.post<ApiResponse<Category>>("/restaurant/categories", payload),
  updateCategory: (id: number, payload: Partial<Category>) =>
    api.put<ApiResponse<Category>>(`/restaurant/categories/${id}`, payload),
  deleteCategory: (id: number) => api.delete<ApiResponse<null>>(`/restaurant/categories/${id}`),
  reorderCategories: (categories: Array<{ id: number; sort_order: number }>) =>
    api.post<ApiResponse<Category[]>>("/restaurant/categories/reorder", { categories }),
  menuItems: (params?: QueryParams) =>
    api.get<ApiResponse<MenuItem[]>>("/restaurant/menu-items", { params }),
  createMenuItem: (payload: Partial<MenuItem>) =>
    api.post<ApiResponse<MenuItem>>("/restaurant/menu-items", payload),
  updateMenuItem: (id: number, payload: Partial<MenuItem>) =>
    api.put<ApiResponse<MenuItem>>(`/restaurant/menu-items/${id}`, payload),
  deleteMenuItem: (id: number) => api.delete<ApiResponse<null>>(`/restaurant/menu-items/${id}`),
  toggleMenuItemAvailability: (id: number) =>
    api.post<ApiResponse<MenuItem>>(`/restaurant/menu-items/${id}/toggle-availability`),
  uploadMenuItemImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<MenuItem>>(`/restaurant/menu-items/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  orders: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Order>>>("/restaurant/orders", { params }),
  order: (orderNumber: string) => api.get<ApiResponse<Order>>(`/restaurant/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber: string, status: string) =>
    api.post<ApiResponse<Order>>(`/restaurant/orders/${orderNumber}/update-status`, { status }),
  earnings: (period?: "week" | "month" | "year") =>
    api.get<ApiResponse<EarningsSummary>>("/restaurant/earnings", { params: { period } }),
  earningsHistory: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Record<string, unknown>>>>("/restaurant/earnings/history", { params }),
};

export const driverApi = {
  dashboard: () => api.get<ApiResponse<DriverDashboard>>("/driver/dashboard"),
  availableOrders: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Order>>>("/driver/orders/available", { params }),
  upcomingOrders: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Order>>>("/driver/orders/upcoming", { params }),
  acceptOrder: (orderNumber: string) =>
    api.post<ApiResponse<Order>>(`/driver/orders/${orderNumber}/accept`),
  orders: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Order>>>("/driver/orders", { params }),
  order: (orderNumber: string) => api.get<ApiResponse<Order>>(`/driver/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber: string, status: string) =>
    api.post<ApiResponse<Order>>(`/driver/orders/${orderNumber}/update-status`, { status }),
  location: () => api.get<ApiResponse<DriverLocation>>("/driver/location"),
  updateLocation: (payload: Partial<DriverLocation>) =>
    api.post<ApiResponse<DriverLocation>>("/driver/location", payload),
  earnings: () => api.get<ApiResponse<EarningsSummary>>("/driver/earnings"),
  earningsHistory: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Record<string, unknown>>>>("/driver/earnings/history", { params }),
  profile: () => api.get<ApiResponse<User>>("/driver/profile"),
  updateProfile: (payload: Partial<User>) => api.put<ApiResponse<User>>("/driver/profile", payload),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post<ApiResponse<User>>("/driver/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (payload: { current_password: string; password: string; password_confirmation: string }) =>
    api.put<ApiResponse<null>>("/driver/profile/password", payload),
};

export const customerApi = {
  restaurants: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Restaurant>>>("/restaurants", { params }),
  restaurantReviews: (slug: string, params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Review>>>(`/restaurants/${slug}/reviews`, { params }),
};

export const notificationApi = {
  list: (params?: QueryParams) =>
    api.get<ApiResponse<Pagination<Notification>>>("/notifications", { params }),
  markAsRead: (id: number) => api.post<ApiResponse<Notification>>(`/notifications/${id}/read`),
  readAll: () => api.post<ApiResponse<null>>("/notifications/read-all"),
};

export const extractApiError = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as ApiResponse<unknown> | undefined)?.message;
    if (message) return message;
  }
  return fallback;
};

export const isNotFoundError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

type RestaurantProfilePayload = {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  opening_time?: string;
  closing_time?: string;
  min_order_amount?: number;
  delivery_fee?: number;
  delivery_time_min?: number;
  delivery_time_max?: number;
};

function mapRestaurantProfilePayload(payload: RestaurantProfilePayload) {
  return {
    name: payload.name,
    description: payload.description,
    address: payload.address,
    city: payload.city,
    phone: payload.phone,
    email: payload.email,
    opening_time: payload.opening_time,
    closing_time: payload.closing_time,
    minimum_order: payload.min_order_amount,
    delivery_fee: payload.delivery_fee,
    delivery_time: payload.delivery_time_max ?? payload.delivery_time_min,
  };
}
