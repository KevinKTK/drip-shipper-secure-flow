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
import { SkeletonOrderCard } from '@/components/ui/maritime-skeleton';

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
    <Card className="maritime-card maritime-card-glow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            {order.order_type === 'cargo' ? <Package className="w-5 h-5 text-[#D4AF37]" /> : <Ship className="w-5 h-5 text-[#D4AF37]" />}
            {order.title}
          </CardTitle>
          {order.is_insured && (
            <Badge className="bg-[#64FFDA] text-[#0A192F] font-medium">
              <Shield className="w-3 h-3 mr-1" />
              Insured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <MapPin className="w-4 h-4" />
          <span className="font-serif text-sm">{order.origin_port} → {order.destination_port}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <Calendar className="w-4 h-4" />
          <span className="font-serif text-sm">Departure: {new Date(order.departure_date).toLocaleDateString()}</span>
        </div>

        {order.cargo_type && (
          <Badge variant="outline" className="border-[#CCD6F6]/30 text-[#CCD6F6]">
            {order.cargo_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        {order.vessel_type && (
          <Badge variant="outline" className="border-[#CCD6F6]/30 text-[#CCD6F6]">
            {order.vessel_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-[#CCD6F6]/20">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-medium">{order.price_ink} ETH</span>
          </div>
          {order.nft_token_id && (
            <span className="text-xs text-[#CCD6F6]/70">NFT #{order.nft_token_id}</span>
          )}
        </div>
        {order.nft_token_id && order.nft_contract_address && (
          <a
            href={`https://explorer-sepolia.inkonchain.com/token/${order.nft_contract_address}/instance/${order.nft_token_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 w-full"
          >
            <Button
              variant="outline"
              className="w-full maritime-button bg-[#1E3A5F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] border border-[#D4AF37]/50 font-serif"
            >
              See NFT contract (ink-scan)
            </Button>
          </a>
        )}

        <Button 
          className="w-full maritime-button bg-[#CCD6F6]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] font-serif border border-[#CCD6F6]/30"
          onClick={() => navigate(`/contract-builder?orderId=${order.id}`)}
        >
          Create Insurance Policy
        </Button>
      </CardContent>
    </Card>
  );

  const SkeletonGrid = ({ count }: { count: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonOrderCard key={index} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">Maritime Marketplace</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Discover shipping opportunities and secure your cargo with parametric insurance</p>
        </div>

        <div className="page-enter" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="cargo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1E3A5F] border border-[#D4AF37]/30">
              <TabsTrigger 
                value="cargo" 
                className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
              >
                Available Shipments ({isLoading ? '...' : cargoOrders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="vessel" 
                className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
              >
                Available Vessels ({isLoading ? '...' : vesselOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cargo" className="mt-6">
              {isLoading ? (
                <SkeletonGrid count={6} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cargoOrders.map((order, index) => (
                    <div key={order.id} className="page-enter-stagger" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                      <OrderCard order={order} />
                    </div>
                  ))}
                  {cargoOrders.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                      <p className="text-[#CCD6F6] font-serif">No cargo shipments available</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="vessel" className="mt-6">
              {isLoading ? (
                <SkeletonGrid count={6} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vesselOrders.map((order, index) => (
                    <div key={order.id} className="page-enter-stagger" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                      <OrderCard order={order} />
                    </div>
                  ))}
                  {vesselOrders.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Ship className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                      <p className="text-[#CCD6F6] font-serif">No vessels available</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
