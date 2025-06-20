
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, Package, Shield, TrendingUp, Coins } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Portfolio = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: policies } = useQuery({
    queryKey: ['insurance-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const totalValue = orders?.reduce((sum, order) => sum + Number(order.price_ink), 0) || 0;
  const insuredOrders = orders?.filter(order => order.is_insured).length || 0;
  const totalPremiums = policies?.reduce((sum, policy) => sum + Number(policy.premium_ink), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F1E8] maritime-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E8] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-medium text-[#1B365D] mb-2">Portfolio Dashboard</h1>
          <p className="text-[#8B755D] font-serif font-light">Manage your shipping NFTs and insurance policies</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="maritime-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0957B] text-sm font-serif">Total Orders</p>
                  <p className="text-2xl font-medium text-white">{orders?.length || 0}</p>
                </div>
                <Package className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="maritime-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0957B] text-sm font-serif">Portfolio Value</p>
                  <p className="text-2xl font-medium text-[#D4AF37]">{totalValue.toLocaleString()} INK</p>
                </div>
                <Coins className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="maritime-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0957B] text-sm font-serif">Insured Orders</p>
                  <p className="text-2xl font-medium text-white">{insuredOrders}</p>
                </div>
                <Shield className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="maritime-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0957B] text-sm font-serif">Total Premiums</p>
                  <p className="text-2xl font-medium text-white">{totalPremiums.toLocaleString()} INK</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="maritime-card">
          <CardHeader>
            <CardTitle className="text-white font-serif font-medium">Your Shipping Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#A0957B]/30">
                    <th className="text-left text-[#A0957B] font-serif py-3">Order</th>
                    <th className="text-left text-[#A0957B] font-serif py-3">Route</th>
                    <th className="text-left text-[#A0957B] font-serif py-3">Type</th>
                    <th className="text-left text-[#A0957B] font-serif py-3">Value</th>
                    <th className="text-left text-[#A0957B] font-serif py-3">Status</th>
                    <th className="text-left text-[#A0957B] font-serif py-3">Insurance</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b border-[#A0957B]/20">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {order.order_type === 'cargo' ? 
                            <Package className="w-4 h-4 text-[#D4AF37]" /> : 
                            <Ship className="w-4 h-4 text-[#D4AF37]" />
                          }
                          <span className="text-white font-serif">{order.title}</span>
                        </div>
                      </td>
                      <td className="py-4 text-[#A0957B] font-serif">
                        {order.origin_port} → {order.destination_port}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="border-[#A0957B] text-white">
                          {order.order_type}
                        </Badge>
                      </td>
                      <td className="py-4 text-[#D4AF37] font-medium font-serif">
                        {Number(order.price_ink).toLocaleString()} INK
                      </td>
                      <td className="py-4">
                        <Badge className={`
                          ${order.status === 'completed' ? 'bg-green-600' : ''}
                          ${order.status === 'pending' ? 'bg-yellow-600' : ''}
                          ${order.status === 'active' ? 'bg-blue-600' : ''}
                        `}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {order.is_insured ? (
                          <Badge className="bg-[#D4AF37] text-[#1B365D]">
                            <Shield className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        ) : (
                          <span className="text-[#A0957B] text-sm font-serif">Not insured</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {orders?.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-[#A0957B] mx-auto mb-4" />
                <p className="text-[#8B755D] font-serif">No orders in your portfolio yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
