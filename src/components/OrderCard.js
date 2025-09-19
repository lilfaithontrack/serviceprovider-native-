import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';

export default function OrderCard({ order, onUpdateStatus }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order ID: {order.id}</Text>
      <Text style={styles.status}>Status: {order.status}</Text>

      <Text style={styles.address}>
        Pickup: {order.pickup_address}
      </Text>
      <Text style={styles.address}>
        Delivery: {order.delivery_address}
      </Text>

      <Text style={styles.price}>
        Subtotal: ${order.subtotal.toFixed(2)}
      </Text>
      <Text style={styles.price}>
        Delivery Charge: ${order.delivery_charge.toFixed(2)}
      </Text>
      <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>

      {/* Optional: List of items */}
      <View style={styles.itemsContainer}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.item}>
            {item.name} x {item.quantity} - ${item.price.toFixed(2)}
          </Text>
        ))}
      </View>

      {/* Button to update status */}
      <Button
        title="Mark as Delivered"
        onPress={() => onUpdateStatus(order.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#888',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 8,
  },
  itemsContainer: {
    marginVertical: 8,
  },
  item: {
    fontSize: 14,
    color: '#444',
  },
});
