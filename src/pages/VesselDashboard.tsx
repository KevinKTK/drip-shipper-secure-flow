
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ship, Plus, Package } from 'lucide-react';
import Navigation from '@/components/Navigation';
import VesselCard from '@/components/vessel/VesselCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VesselDashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();

  const { data: vessels, isLoading } = useQuery({
    queryKey: ['user-vessels', address],
    queryFn: async () => {
      if (!address) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_type', 'vessel')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!address && isConnected,
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-4">My Vessels</h1>
            <p className="text-[#CCD6F6] font-serif mb-8">Please connect your wallet to manage your vessels</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">My Vessels</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Manage your fleet and log journeys</p>
        </div>

        <div className="mb-8 page-enter" style={{ animationDelay: '0.2s' }}>
          <Button
            onClick={() => navigate('/vessels/register')}
            className="golden-button maritime-button font-serif font-semibold py-3 px-6 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Register New Vessel
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="maritime-card maritime-card-glow animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-[#CCD6F6]/20 rounded w-3/4"></div>
                  <div className="h-4 bg-[#CCD6F6]/20 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-[#CCD6F6]/20 rounded"></div>
                    <div className="h-4 bg-[#CCD6F6]/20 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vessels && vessels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-enter" style={{ animationDelay: '0.4s' }}>
            {vessels.map((vessel, index) => (
              <VesselCard
                key={vessel.id}
                vessel={vessel}
                onLogJourney={() => navigate(`/vessels/${vessel.id}/log-journey`)}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <Card className="maritime-card maritime-card-glow text-center py-12 page-enter" style={{ animationDelay: '0.4s' }}>
            <CardContent>
              <Ship className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
              <h3 className="text-xl font-serif font-medium text-[#FFFFFF] mb-2">
                No Vessels Registered
              </h3>
              <p className="text-[#CCD6F6] font-serif mb-6">
                You have not registered any vessels yet. Register your first vessel to begin managing journeys.
              </p>
              <Button
                onClick={() => navigate('/vessels/register')}
                className="golden-button maritime-button font-serif font-semibold py-3 px-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                Register Your First Vessel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VesselDashboard;
