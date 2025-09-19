import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IS_DEVELOPMENT = true;
const API_BASE_URL = IS_DEVELOPMENT
  ? 'http://localhost:8000/api/v1'
  : 'https://api.washlinnk.com/v1';

console.log('API running on', API_BASE_URL);

export interface OrderItem {
  id: number;
  product_id: string;
  category_id: number;
  quantity: number;
  price: number;
  service_type: string;
}

export interface Order {
  id: string;
  user_id: string;
  provider_id?: string;
  driver_id?: string;
  status: string;
  total_amount: number;
  pickup_address: string;
  delivery_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_lat?: number;
  delivery_lng?: number;
  notes?: string;
  payment_method?: string;
  cash_on_delivery: boolean;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  picked_up_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  items: OrderItem[];
}

export interface LoginRequest {
  phone_number: string;
  otp: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: number;
  status: string;
  is_verified: boolean;
  rating?: number;
  total_orders_completed?: number;
}

export interface LoginResponse {
  message: string;
  provider: User;
}

export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add auth token automatically
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.multiRemove(['user', 'userToken']);
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth ---
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post('/providers/login', data);
    const { provider } = response.data;
    
    // Store user data and token (assuming token is returned)
    await AsyncStorage.multiSet([
      ['user', JSON.stringify(provider)],
      ['userToken', 'dummy-token'], // Replace with actual token from response
    ]);
    
    return response.data;
  }

  async logout() {
    await AsyncStorage.multiRemove(['user', 'userToken']);
  }

  async getCurrentUser(): Promise<User | null> {
    const stored = await AsyncStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  // --- Orders for Service Provider ---
  async getProviderOrders(skip = 0, limit = 100): Promise<Order[]> {
    const response = await this.api.get<Order[]>('/orders/provider-orders', {
      params: { skip, limit },
    });
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<{ message: string }> {
    const response = await this.api.put(`/orders/provider-orders/${orderId}/status`, { status });
    return response.data;
  }
}

export const apiService = new ApiService();