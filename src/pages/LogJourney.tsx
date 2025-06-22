import React, { useState, useEffect } from 'react';
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
import { useJourneyContract } from '@/hooks/useJourneyContract';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets';

const LogJourney = () => {
  const { vesselId } = useParams();
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();
  const queryClient = useQueryClient();
  const { mintJourney, hash, isPending: isMinting, isConfirming, isConfirmed, error: mintError } = useJourneyContract();

  const [formData, setFormData] = useState({
    originPort: '',
    destinationPort: '',
    departureDate: '',
    arrivalDate: '',
    availableCapacity: '',
    priceEth: '', // New price field
  });

  const [pendingJourneyData, setPendingJourneyData] = useState<any>(null);

  // Handle NFT minting confirmation
  useEffect(() => {
    if (isConfirmed && pendingJourneyData && hash) {
      console.log('NFT minted successfully! Transaction hash:', hash);
      toast.success('NFT Minted!', {
        description: 'Journey NFT has been minted successfully. Now saving to database...',
      });

      // Now save to Supabase with the transaction hash
      const dataWithNFT = {
        ...pendingJourneyData,
        nft_transaction_hash: hash,
        journey_nft_contract_address: CONTRACT_ADDRESSES.journeyNFT,
      };

      createJourneyMutation.mutate(dataWithNFT);
      setPendingJourneyData(null);
    }
  }, [isConfirmed, pendingJourneyData, hash]);

  // Handle minting error
  useEffect(() => {
    if (mintError) {
      console.error('NFT minting error:', mintError);
      toast.error('NFT Minting Failed', {
        description: mintError.message || 'Failed to mint Journey NFT. Please try again.',
      });
      setPendingJourneyData(null);
    }
  }, [mintError]);

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
        price_eth: parseFloat(data.priceEth), // Store price in database
        carrier_wallet_address: address,
        nft_transaction_hash: data.nft_transaction_hash,
        journey_nft_contract_address: data.journey_nft_contract_address,
      });

      const { data: result, error } = await supabase
        .from('carrier_routes')
        .insert([{
          vessel_id: vesselId,
          origin_port: data.originPort,
          destination_port: data.destinationPort,
          departure_date: data.departureDate,
          arrival_date: data.arrivalDate,
          available_capacity_kg: parseInt(data.availableCapacity) * 1000,
          price_eth: parseFloat(data.priceEth), // Store price in database
          carrier_wallet_address: address,
          nft_transaction_hash: data.nft_transaction_hash,
          journey_nft_contract_address: data.journey_nft_contract_address,
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
        description: 'Your journey has been minted as an NFT and saved to the database.',
      });
      queryClient.invalidateQueries({ queryKey: ['vessel-journeys'] });
      setFormData({
        originPort: '',
        destinationPort: '',
        departureDate: '',
        arrivalDate: '',
        availableCapacity: '',
        priceEth: '',
      });
    },
    onError: (error: any) => {
      console.error('Journey creation error:', error);

      let errorMessage = 'Failed to log journey';
      let errorDescription = error.message || 'An unexpected error occurred';

      if (error.message?.includes('row-level security policy')) {
        errorMessage = 'Access denied';
        errorDescription = 'You do not have permission to create journeys. Please ensure your wallet is connected.';
      }

      toast.error(errorMessage, {
        description: errorDescription,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast.error('Wallet Required', {
        description: 'Please connect your wallet to log a journey',
      });
      return;
    }

    if (!formData.originPort || !formData.destinationPort || !formData.departureDate || !formData.availableCapacity || !formData.priceEth) {
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

    // Validate price is a positive number
    const price = parseFloat(formData.priceEth);
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid Price', {
        description: 'Please enter a valid price in ETH',
      });
      return;
    }

    // Check if vessel has an NFT token ID
    if (!vessel?.nft_token_id) {
      toast.error('Vessel NFT Required', {
        description: 'This vessel must have an NFT token ID to log journeys',
      });
      return;
    }

    try {
      // Store form data for later use after NFT confirmation
      setPendingJourneyData(formData);

      toast.info('Minting Journey NFT...', {
        description: 'Please confirm the transaction in your wallet.',
      });

      // Convert departure date to Unix timestamp
      const departureTimestamp = Math.floor(new Date(formData.departureDate).getTime() / 1000);

      // Calculate expected arrival timestamp
      let expectedArrivalTimestamp: number;
      if (formData.arrivalDate) {
        // Use provided arrival date
        expectedArrivalTimestamp = Math.floor(new Date(formData.arrivalDate).getTime() / 1000);
      } else {
        // Estimate 14 days from departure if no arrival date provided
        expectedArrivalTimestamp = departureTimestamp + (14 * 24 * 60 * 60);
      }

      // Mint the Journey NFT with all required parameters
      await mintJourney({
        vesselTokenId: vessel.nft_token_id,
        originPort: formData.originPort,
        destinationPort: formData.destinationPort,
        departureTimestamp: departureTimestamp,
        expectedArrivalTimestamp: expectedArrivalTimestamp,
        availableCapacity: parseInt(formData.availableCapacity) * 1000, // Pass capacity in kg
      });

    } catch (error) {
      console.error('Error starting journey creation process:', error);
      setPendingJourneyData(null);
      toast.error('Transaction Failed', {
        description: 'Failed to initiate the journey creation process.',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isProcessing = isMinting || isConfirming || createJourneyMutation.isPending;

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
                    {vessel.nft_token_id && <span> • NFT #{vessel.nft_token_id}</span>}
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
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Destination Port *</Label>
                      <Input
                        value={formData.destinationPort}
                        onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                        placeholder="e.g., Port of Los Angeles"
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                        disabled={isProcessing}
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
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Arrival Date</Label>
                      <Input
                        type="date"
                        value={formData.arrivalDate}
                        onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Available Capacity (tons) *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.availableCapacity}
                        onChange={(e) => handleInputChange('availableCapacity', e.target.value)}
                        placeholder="e.g., 15000"
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#CCD6F6] font-serif">Price (ETH) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        value={formData.priceEth}
                        onChange={(e) => handleInputChange('priceEth', e.target.value)}
                        placeholder="e.g., 5.25"
                        className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || !vessel?.nft_token_id}
                    className="w-full golden-button maritime-button font-serif font-semibold py-3 text-lg"
                  >
                    {isMinting && 'Minting NFT...'}
                    {isConfirming && 'Confirming Transaction...'}
                    {createJourneyMutation.isPending && 'Saving to Database...'}
                    {!isProcessing && 'Log Journey & Mint NFT'}
                  </Button>

                  {!vessel?.nft_token_id && (
                    <p className="text-center text-[#CCD6F6]/70 font-serif text-sm">
                      This vessel needs an NFT token ID to log journeys
                    </p>
                  )}

                  {isProcessing && (
                    <div className="text-center text-[#CCD6F6] font-serif text-sm">
                      {isMinting && "Please confirm the transaction in your wallet..."}
                      {isConfirming && "Waiting for blockchain confirmation..."}
                      {createJourneyMutation.isPending && "Finalizing journey record..."}
                    </div>
                  )}
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
                        {(journey as any).price_eth && (
                          <div className="flex items-center gap-2 text-[#D4AF37] font-serif text-xs">
                            <span>💰 {(journey as any).price_eth} ETH</span>
                          </div>
                        )}
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
