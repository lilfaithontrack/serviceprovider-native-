import React, { useContext, useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "./AuthContext";

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async () => {
    try {
      await login(phone, otp);
      navigation.replace("Orders"); // Navigate to Orders screen
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 12, padding: 8, borderRadius: 6 },
});
