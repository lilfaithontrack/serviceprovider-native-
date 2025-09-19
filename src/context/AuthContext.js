import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, User } from "./api";

interface AuthContextType {
  user: User | null;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("providerUser");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    loadUser();
  }, []);

  const login = async (phone: string, otp: string) => {
    const response = await apiService.verifyOTP({ phone_number: phone, otp_code: otp });
    if (response.data?.user) {
      setUser(response.data.user);
      await AsyncStorage.setItem("providerUser", JSON.stringify(response.data.user));
      await AsyncStorage.setItem("providerToken", response.data.access_token);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.multiRemove(["providerUser", "providerToken"]);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
