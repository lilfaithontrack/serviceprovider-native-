import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { apiService, Order, OrderStatus } from "./api";
import { AuthContext } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ProviderOrdersScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiService.getProviderOrders();
      if (response.data) {
        setOrders(response.data);
        await AsyncStorage.setItem("providerOrders", JSON.stringify(response.data));
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      Alert.alert("Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      const storedOrders = await AsyncStorage.getItem("providerOrders");
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      fetchOrders();
    };
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, status);
      if (response.data) {
        Alert.alert("Success", `Order marked as ${status}`);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID: {item.id}</Text>
          <Text>Status: {item.status}</Text>
          <Text>Pickup: {item.pickup_address}</Text>
          <Text>Delivery: {item.delivery_address}</Text>
          <Text>Total: {item.total_amount}</Text>

          {item.status === OrderStatus.ASSIGNED && (
            <Button
              title="Mark as Picked Up"
              onPress={() => updateOrderStatus(item.id, OrderStatus.PICKED_UP)}
            />
          )}

          {item.status === OrderStatus.PICKED_UP && (
            <Button
              title="Mark as Confirmed"
              onPress={() => updateOrderStatus(item.id, OrderStatus.COMPLETED)}
            />
          )}
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text>No orders assigned yet.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  orderId: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});
