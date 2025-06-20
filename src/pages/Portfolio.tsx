
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#1D566E]">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] to-[#1D566E]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white mb-2">Portfolio Dashboard</h1>
          <p className="text-[#3C5B6F] font-sans">Manage your shipping NFTs and insurance policies</p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#0A192F] to-[#1D566E] border-[#3C5B6F]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3C5B6F] text-sm font-sans">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{orders?.length || 0}</p>
                </div>
                <Package className="w-8 h-8 text-[#FFD700]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0A192F] to-[#1D566E] border-[#3C5B6F]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3C5B6F] text-sm font-sans">Portfolio Value</p>
                  <p className="text-2xl font-bold text-[#FFD700]">{totalValue.toLocaleString()} INK</p>
                </div>
                <Coins className="w-8 h-8 text-[#FFD700]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0A192F] to-[#1D566E] border-[#3C5B6F]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3C5B6F] text-sm font-sans">Insured Orders</p>
                  <p className="text-2xl font-bold text-white">{insuredOrders}</p>
                </div>
                <Shield className="w-8 h-8 text-[#FFD700]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0A192F] to-[#1D566E] border-[#3C5B6F]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#3C5B6F] text-sm font-sans">Total Premiums</p>
                  <p className="text-2xl font-bold text-white">{totalPremiums.toLocaleString()} INK</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#FFD700]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="bg-gradient-to-br from-[#0A192F] to-[#1D566E] border-[#3C5B6F]">
          <CardHeader>
            <CardTitle className="text-white font-serif">Your Shipping Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#3C5B6F]">
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Order</th>
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Route</th>
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Type</th>
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Value</th>
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Status</th>
                    <th className="text-left text-[#3C5B6F] font-sans py-3">Insurance</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b border-[#3C5B6F]/30">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {order.order_type === 'cargo' ? 
                            <Package className="w-4 h-4 text-[#FFD700]" /> : 
                            <Ship className="w-4 h-4 text-[#FFD700]" />
                          }
                          <span className="text-white font-sans">{order.title}</span>
                        </div>
                      </td>
                      <td className="py-4 text-[#3C5B6F] font-sans">
                        {order.origin_port} → {order.destination_port}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="border-[#3C5B6F] text-white">
                          {order.order_type}
                        </Badge>
                      </td>
                      <td className="py-4 text-[#FFD700] font-bold">
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
                          <Badge className="bg-[#FFD700] text-[#0A192F]">
                            <Shield className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        ) : (
                          <span className="text-[#3C5B6F] text-sm">Not insured</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {orders?.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-[#3C5B6F] mx-auto mb-4" />
                <p className="text-[#3C5B6F] font-sans">No orders in your portfolio yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
