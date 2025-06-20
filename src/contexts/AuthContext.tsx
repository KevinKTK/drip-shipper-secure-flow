
import React, { createContext, useContext } from 'react';
import { useAccount } from 'wagmi';

interface AuthContextType {
  user: { address: string } | null;
  loading: boolean;
  isConnected: boolean;
  address: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected, isConnecting } = useAccount();

  const value = {
    user: isConnected && address ? { address } : null,
    loading: isConnecting,
    isConnected,
    address,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
