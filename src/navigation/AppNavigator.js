import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import { AuthProvider } from '../context/AuthContext';
import { OrdersProvider } from '../context/OrdersContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <AuthProvider>
                <OrdersProvider>
                    <Stack.Navigator>
                        <Stack.Screen name="Orders" component={OrdersScreen} />
                        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                    </Stack.Navigator>
                </OrdersProvider>
            </AuthProvider>
        </NavigationContainer>
    );
};

export default AppNavigator;
