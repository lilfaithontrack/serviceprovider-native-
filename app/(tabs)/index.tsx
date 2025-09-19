import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, MapPin, Clock, DollarSign, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../services/api';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  items: Array<{
    id: number;
    product_id: string;
    quantity: number;
    price: number;
    service_type: string;
  }>;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        router.replace('/login');
        return;
      }
      setUser(JSON.parse(storedUser));
      await fetchOrders();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProviderOrders();
      setOrders(response);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      Alert.alert('Success', `Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'assigned': return '#F59E0B';
      case 'picked_up': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'assigned': return 'picked_up';
      case 'picked_up': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'assigned': return 'Mark as Picked Up';
      case 'picked_up': return 'Mark as Completed';
      default: return null;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Package size={16} color="#0066FF" />
          <Text style={styles.orderId}>#{item.id.slice(-8)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressRow}>
          <MapPin size={16} color="#10B981" />
          <Text style={styles.addressLabel}>Pickup:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickup_address}
          </Text>
        </View>
        <View style={styles.addressRow}>
          <MapPin size={16} color="#EF4444" />
          <Text style={styles.addressLabel}>Delivery:</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.delivery_address}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <DollarSign size={16} color="#059669" />
          <Text style={styles.totalAmount}>${item.total_amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.orderTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items ({item.items.length}):</Text>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemText}>
            {orderItem.service_type} x{orderItem.quantity} - ${orderItem.price.toFixed(2)}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      {getNextStatus(item.status) && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => updateOrderStatus(item.id, getNextStatus(item.status)!)}
        >
          <LinearGradient
            colors={['#0066FF', '#10B981']}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {getNextStatusLabel(item.status)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient colors={['#0066FF', '#10B981']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0066FF', '#10B981']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Manage your assigned orders</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchOrders();
              }}
              colors={['#0066FF']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                Orders assigned to you will appear here
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#475569',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    flex: 1,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#059669',
    marginLeft: 4,
  },
  orderTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0066FF',
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});