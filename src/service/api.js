import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const IS_DEVELOPMENT = true;
const API_BASE_URL = IS_DEVELOPMENT
  ? "http://localhost:8000/api/v1"
  : "https://api.washlinnk.com/v1";

console.log("API running on", API_BASE_URL);

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  service_type?: string;
};

export type Order = {
  id: string;
  user_id: string;
  service_provider_id?: string;
  driver_id?: string;
  status: string;
  subtotal: number;
  delivery: number;
  delivery_charge: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  items: OrderItem[];
  total: number;
};

export type LoginRequest = {
  phone_number: string;
  otp_code: string;
};

export type User = {
  id: string;
  name: string;
  phone_number: string;
  role?: string;
};

export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token automatically
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // --- Auth ---
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await this.api.post("/providers/login", data);
    const { user, access_token } = response.data;
    await AsyncStorage.multiSet([
      ["user", JSON.stringify(user)],
      ["userToken", access_token],
    ]);
    return { user, token: access_token };
  }

  async logout() {
    await AsyncStorage.multiRemove(["user", "userToken"]);
  }

  async getCurrentUser(): Promise<User | null> {
    const stored = await AsyncStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }

  // --- Orders for Service Provider ---
  async getProviderOrders(skip = 0, limit = 100): Promise<Order[]> {
    const response = await this.api.get<Order[]>("/orders/provider-orders", {
      params: { skip, limit },
    });
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: "picked_up" | "confirmed"): Promise<Order> {
    const response = await this.api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  }
}

export const apiService = new ApiService();
