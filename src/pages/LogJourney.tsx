import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Ship, Package, Calendar, MapPin } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LogJourney = () => {
  const { vesselId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    originPort: '',
    destinationPort: '',
    departureDate: '',
    arrivalDate: '',
    availableCapacity: '',
  });

  // Fetch vessel details
  const { data: vessel, isLoading: vesselLoading } = useQuery({
    queryKey: ['vessel', vesselId],
    queryFn: async () => {
      if (!vesselId) throw new Error('Vessel ID is required');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', vesselId)
        .eq('order_type', 'vessel')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!vesselId,
  });

  // Fetch journey history for this vessel
  const { data: journeys } = useQuery({
    queryKey: ['vessel-journeys', vesselId],
    queryFn: async () => {
      if (!vesselId) return [];
      
      const { data, error } = await supabase
        .from('carrier_routes')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!vesselId,
  });

  const createJourneyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!address) {
        throw new Error('Wallet address is required');
      }

      console.log('Creating journey with data:', {
        vessel_id: vesselId,
        origin_port: data.originPort,
        destination_port: data.destinationPort,
        departure_date: data.departureDate,
        arrival_date: data.arrivalDate,
        available_capacity_kg: parseInt(data.availableCapacity) * 1000,
        carrier_wallet_address: address,
      });

      const { data: result, error } = await supabase
        .from('carrier_routes')
        .insert([{
          vessel_id: vesselId,
          origin_port: data.originPort,
          destination_port: data.destinationPort,
          departure_date: data.departureDate,
          arrival_date: data.arrivalDate,
          available_capacity_kg: parseInt(data.availableCapacity) * 1000, // Convert tons to kg
          carrier_wallet_address: address,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }
      
      console.log('Journey created successfully:', result);
      return result;
    },
    onSuccess: () => {
      toast.success('Journey logged successfully!', {
        description: 'Your journey has been added and is now available for cargo matching.',
      });
      queryClient.invalidateQueries({ queryKey: ['vessel-journeys'] });
      setFormData({
        originPort: '',
        destinationPort: '',
        departureDate: '',
        arrivalDate: '',
        availableCapacity: '',
      });
    },
    onError: (error: any) => {
      console.error('Journey creation error:', error);
      
      let errorMessage = 'Failed to log journey';
      let errorDescription = error.message || 'An unexpected error occurred';
      
      // Handle specific RLS policy violations
      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'Access denied';
        errorDescription = 'You do not have permission to create journeys. Please ensure your wallet is connected.';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet to log a journey',
      });
      return;
    }

    if (!formData.originPort || !formData.destinationPort || !formData.departureDate || !formData.availableCapacity) {
      toast.error('Missing Information', {
        description: 'Please fill in all required fields',
      });
      return;
    }

    // Validate capacity is a positive number
    const capacity = parseInt(formData.availableCapacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Invalid Capacity', {
        description: 'Please enter a valid capacity in tons',
      });
      return;
    }

    createJourneyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-4">Log Journey</h1>
            <p className="text-[#CCD6F6] font-serif mb-8">Please connect your wallet to log a journey</p>
          </div>
        </div>
      </div>
    );
  }

  if (vesselLoading) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#CCD6F6] font-serif">Loading vessel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vessel) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-4">Vessel Not Found</h1>
            <p className="text-[#CCD6F6] font-serif mb-8">The vessel you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/vessels')} className="golden-button maritime-button font-serif">
              Back to My Vessels
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 page-enter">
          <Button
            onClick={() => navigate('/vessels')}
            variant="ghost"
            className="text-[#CCD6F6] hover:text-[#D4AF37] font-serif"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Vessels
          </Button>
        </div>

        {/* Vessel Context Header */}
        <div className="mb-8 page-enter">
          <Card className="maritime-card maritime-card-glow">
            <CardHeader>
              <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Ship className="w-6 h-6 text-[#0A192F]" />
                </div>
                <div>
                  <div className="text-xl">Logging Journey for: {vessel.title}</div>
                  <div className="text-sm text-[#D4AF37] font-normal">
                    {vessel.vessel_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {vessel.weight_tons} tons capacity
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Journey Form */}
          <div className="lg:col-span-2 page-enter" style={{ animationDelay: '0.2s' }}>
            <Card className="maritime-card maritime-card-glow">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                  Log New Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Origin Port *</Label>
                      <Input
                        value={formData.originPort}
                        onChange={(e) => handleInputChange('originPort', e.target.value)}
                        placeholder="e.g., Port of Shanghai"
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                        disabled={createJourneyMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Destination Port *</Label>
                      <Input
                        value={formData.destinationPort}
                        onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                        placeholder="e.g., Port of Los Angeles"
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                        disabled={createJourneyMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Departure Date *</Label>
                      <Input
                        type="date"
                        value={formData.departureDate}
                        onChange={(e) => handleInputChange('departureDate', e.target.value)}
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif"
                        disabled={createJourneyMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Arrival Date</Label>
                      <Input
                        type="date"
                        value={formData.arrivalDate}
                        onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif"
                        disabled={createJourneyMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Available Capacity (tons) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.availableCapacity}
                      onChange={(e) => handleInputChange('availableCapacity', e.target.value)}
                      placeholder="e.g., 15000"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                      disabled={createJourneyMutation.isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createJourneyMutation.isPending}
                    className="w-full golden-button maritime-button font-serif font-semibold py-3 text-lg"
                  >
                    {createJourneyMutation.isPending ? 'Logging Journey...' : 'Log Journey'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Journey History */}
          <div className="page-enter" style={{ animationDelay: '0.4s' }}>
            <Card className="maritime-card maritime-card-glow">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  Journey History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {journeys && journeys.length > 0 ? (
                  <div className="space-y-4">
                    {journeys.slice(0, 5).map((journey, index) => (
                      <div key={journey.id} className="border-b border-[#CCD6F6]/20 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 text-[#CCD6F6] font-serif text-sm mb-1">
                          <MapPin className="w-3 h-3 text-[#D4AF37]" />
                          <span>{journey.origin_port} → {journey.destination_port}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#CCD6F6] font-serif text-xs">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" />
                          <span>{new Date(journey.departure_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#CCD6F6] font-serif text-xs">
                          <Package className="w-3 h-3 text-[#D4AF37]" />
                          <span>{Math.round((journey.available_capacity_kg || 0) / 1000)} tons available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#CCD6F6] font-serif text-sm text-center py-8">
                    No journeys logged yet for this vessel.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogJourney;
