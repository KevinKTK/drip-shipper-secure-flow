
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Package, Shield, Calendar, MapPin, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Marketplace = () => {
  const navigate = useNavigate();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const cargoOrders = orders?.filter(order => order.order_type === 'cargo') || [];
  const vesselOrders = orders?.filter(order => order.order_type === 'vessel') || [];

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="maritime-card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white font-serif font-medium flex items-center gap-2">
            {order.order_type === 'cargo' ? <Package className="w-5 h-5 text-[#D4AF37]" /> : <Ship className="w-5 h-5 text-[#D4AF37]" />}
            {order.title}
          </CardTitle>
          {order.is_insured && (
            <Badge className="bg-[#D4AF37] text-[#1B365D] font-medium">
              <Shield className="w-3 h-3 mr-1" />
              Insured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-[#A0957B]">
          <MapPin className="w-4 h-4" />
          <span className="font-serif text-sm">{order.origin_port} → {order.destination_port}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[#A0957B]">
          <Calendar className="w-4 h-4" />
          <span className="font-serif text-sm">Departure: {new Date(order.departure_date).toLocaleDateString()}</span>
        </div>

        {order.cargo_type && (
          <Badge variant="outline" className="border-[#A0957B] text-white">
            {order.cargo_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        {order.vessel_type && (
          <Badge variant="outline" className="border-[#A0957B] text-white">
            {order.vessel_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-[#A0957B]/30">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-medium">{order.price_ink} INK</span>
          </div>
          {order.nft_token_id && (
            <span className="text-xs text-[#A0957B]">NFT #{order.nft_token_id}</span>
          )}
        </div>

        <Button 
          className="w-full bg-[#A0957B] hover:bg-[#D4AF37] hover:text-[#1B365D] transition-all duration-300 text-white font-serif"
          onClick={() => navigate(`/contract-builder?orderId=${order.id}`)}
        >
          Create Insurance Policy
        </Button>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-4xl font-serif font-medium text-[#1B365D] mb-2">Maritime Marketplace</h1>
          <p className="text-[#8B755D] font-serif font-light">Discover shipping opportunities and secure your cargo with parametric insurance</p>
        </div>

        <Tabs defaultValue="cargo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1B365D] border border-[#A0957B]/30">
            <TabsTrigger value="cargo" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1B365D] text-white font-serif">
              Available Shipments ({cargoOrders.length})
            </TabsTrigger>
            <TabsTrigger value="vessel" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#1B365D] text-white font-serif">
              Available Vessels ({vesselOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cargo" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cargoOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {cargoOrders.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-[#A0957B] mx-auto mb-4" />
                  <p className="text-[#8B755D] font-serif">No cargo shipments available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="vessel" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vesselOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {vesselOrders.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Ship className="w-16 h-16 text-[#A0957B] mx-auto mb-4" />
                  <p className="text-[#8B755D] font-serif">No vessels available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Marketplace;
