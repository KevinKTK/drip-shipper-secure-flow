
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, Package, MapPin, Calendar, Plus, Route, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import JourneyCard from './JourneyCard';

const CarrierView = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();
  const queryClient = useQueryClient();

  const { data: vessels, isLoading: vesselsLoading } = useQuery({
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

  const { data: journeys, isLoading: journeysLoading } = useQuery({
    queryKey: ['user-journeys', address],
    queryFn: async () => {
      if (!address) return [];
      
      const { data, error } = await supabase
        .from('carrier_routes')
        .select(`
          *,
          vessel:orders!carrier_routes_vessel_id_fkey(*)
        `)
        .eq('carrier_wallet_address', address)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!address && isConnected,
  });

  const deleteJourneyMutation = useMutation({
    mutationFn: async (journeyId: string) => {
      const { error } = await supabase
        .from('carrier_routes')
        .delete()
        .eq('id', journeyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Journey deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user-journeys'] });
    },
    onError: (error: any) => {
      console.error('Delete journey error:', error);
      toast.error('Failed to delete journey');
    },
  });

  const handleDeleteJourney = (journeyId: string) => {
    if (window.confirm('Are you sure you want to delete this journey?')) {
      deleteJourneyMutation.mutate(journeyId);
    }
  };

  const handleSelectJourney = (journey: any) => {
    toast.info('Journey selected', {
      description: `Route from ${journey.origin_port} to ${journey.destination_port}`,
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <Ship className="w-16 h-16 mx-auto text-[#D4AF37] mb-4" />
        <h3 className="text-xl font-serif font-medium text-[#FFFFFF] mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-[#CCD6F6] font-serif">
          Please connect your wallet to manage your vessels and routes
        </p>
      </div>
    );
  }

  const VesselCard = ({ vessel }: { vessel: any }) => (
    <Card className="maritime-card maritime-card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
          <Ship className="w-5 h-5 text-[#D4AF37]" />
          {vessel.title}
        </CardTitle>
        <p className="text-[#CCD6F6] font-serif text-sm">
          {vessel.vessel_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {vessel.weight_tons} tons
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <Calendar className="w-4 h-4" />
          <span className="font-serif text-sm">Created: {new Date(vessel.created_at).toLocaleDateString()}</span>
        </div>
        {vessel.nft_token_id && (
          <Badge className="bg-[#64FFDA]/20 text-[#64FFDA] border-[#64FFDA]/30">
            NFT #{vessel.nft_token_id}
          </Badge>
        )}
        {vessel.nft_token_id && vessel.nft_contract_address && (
          <a href={`https://cardona-zkevm.polygonscan.com/token/${vessel.nft_contract_address}?a=${vessel.nft_token_id}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="sm" className="w-full maritime-button bg-[#1E3A5F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] border border-[#D4AF37]/50 font-serif">
              <ExternalLink className="w-3 h-3 mr-2" />
              View NFT
            </Button>
          </a>
        )}
        <Button 
          className="w-full maritime-button bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0A192F] font-serif font-semibold"
          onClick={() => navigate(`/vessels/${vessel.id}/log-journey`)}
        >
          <Route className="w-4 h-4 mr-2" />
          Log Journey
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif font-medium text-[#FFFFFF] mb-2">Carrier Dashboard</h2>
          <p className="text-[#CCD6F6] font-serif">Manage your vessels and routes</p>
        </div>
        <Button
          onClick={() => navigate('/vessels/register')}
          className="golden-button maritime-button font-serif font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Vessel
        </Button>
      </div>

      {/* My Vessels Section */}
      <div>
        <h3 className="text-xl font-serif font-medium text-[#FFFFFF] mb-4 flex items-center gap-2">
          <Ship className="w-5 h-5 text-[#D4AF37]" />
          My Vessels ({vesselsLoading ? '...' : vessels?.length || 0})
        </h3>
        
        {vesselsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vessels.map((vessel) => (
              <VesselCard key={vessel.id} vessel={vessel} />
            ))}
          </div>
        ) : (
          <Card className="maritime-card maritime-card-glow text-center py-8">
            <CardContent>
              <Ship className="w-12 h-12 mx-auto text-[#D4AF37] mb-4" />
              <p className="text-[#CCD6F6] font-serif mb-4">No vessels registered yet</p>
              <Button
                onClick={() => navigate('/vessels/register')}
                className="golden-button maritime-button font-serif"
              >
                Register Your First Vessel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* My Routes Section */}
      <div>
        <h3 className="text-xl font-serif font-medium text-[#FFFFFF] mb-4 flex items-center gap-2">
          <Route className="w-5 h-5 text-[#D4AF37]" />
          My Routes ({journeysLoading ? '...' : journeys?.length || 0})
        </h3>
        
        {journeysLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="maritime-card maritime-card-glow animate-pulse min-w-[280px]">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-[#CCD6F6]/20 rounded"></div>
                    <div className="h-4 bg-[#CCD6F6]/20 rounded w-2/3"></div>
                    <div className="h-8 bg-[#CCD6F6]/20 rounded mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : journeys && journeys.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {journeys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                onSelect={handleSelectJourney}
                onDelete={handleDeleteJourney}
              />
            ))}
          </div>
        ) : (
          <Card className="maritime-card maritime-card-glow text-center py-8">
            <CardContent>
              <Route className="w-12 h-12 mx-auto text-[#D4AF37] mb-4" />
              <p className="text-[#CCD6F6] font-serif mb-4">No routes logged yet</p>
              <p className="text-[#CCD6F6]/70 font-serif text-sm">Register a vessel and log your first journey to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CarrierView;
