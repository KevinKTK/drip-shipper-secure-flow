import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ship, Search, MapPin, Calendar, Package, Shield, Coins, History, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InsurancePolicyModal from './InsurancePolicyModal';
import JourneyCard from './JourneyCard';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface RouteForm {
  originPort: string;
  destinationPort: string;
  departureDate: string;
  arrivalDate: string;
  availableCapacity: string;
  priceEth: string;
}

const CarrierView = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedVesselId, setSelectedVesselId] = useState<string>('');
  const [routeForm, setRouteForm] = useState<RouteForm>({
    originPort: '',
    destinationPort: '',
    departureDate: '',
    arrivalDate: '',
    availableCapacity: '',
    priceEth: ''
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  const { isConnected, address } = useAuth();

  // Query for user's vessels
  const { data: userVessels, isLoading: loadingVessels } = useQuery({
    queryKey: ['user-vessels', address],
    queryFn: async () => {
      if (!address) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_type', 'vessel')
        .eq('wallet_address', address)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!address
  });

  // Query for logged journeys
  const { data: loggedJourneys, isLoading: loadingJourneys, refetch: refetchJourneys } = useQuery({
    queryKey: ['logged-journeys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carrier_routes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: directMatches, isLoading: loadingDirect } = useQuery({
    queryKey: ['direct-matches', routeForm],
    queryFn: async () => {
      if (!hasSearched) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('origin_port', routeForm.originPort)
        .eq('destination_port', routeForm.destinationPort)
        .eq('departure_date', routeForm.departureDate)
        .eq('order_type', 'cargo')
        .eq('status', 'pending');
      
      if (error) throw error;
      return data || [];
    },
    enabled: hasSearched
  });

  const { data: nearbyMatches, isLoading: loadingNearby } = useQuery({
    queryKey: ['nearby-matches', routeForm],
    queryFn: async () => {
      if (!hasSearched) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`origin_port.eq.${routeForm.originPort},destination_port.eq.${routeForm.destinationPort}`)
        .eq('order_type', 'cargo')
        .eq('status', 'pending')
        .neq('origin_port', routeForm.originPort)
        .neq('destination_port', routeForm.destinationPort);
      
      if (error) throw error;
      return data || [];
    },
    enabled: hasSearched
  });

  const { data: carrierPolicies } = useQuery({
    queryKey: ['carrier-insurance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_templates')
        .select('*')
        .eq('policy_type', 'carrier')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    }
  });

  const selectedVessel = userVessels?.find(vessel => vessel.id === selectedVesselId);

  const handleVesselSelect = (vesselId: string) => {
    setSelectedVesselId(vesselId);
    const vessel = userVessels?.find(v => v.id === vesselId);
    if (vessel) {
      // Pre-fill capacity from selected vessel
      setRouteForm(prev => ({
        ...prev,
        availableCapacity: vessel.weight_tons ? `${vessel.weight_tons * 1000} kg` : ''
      }));
      
      toast({
        title: "Vessel Selected",
        description: `${vessel.title} selected for journey logging`,
      });
    }
  };

  const handleSearch = async () => {
    if (!selectedVesselId) {
      toast({
        title: "No Vessel Selected",
        description: "Please select a vessel from your fleet first",
        variant: "destructive"
      });
      return;
    }

    if (!routeForm.originPort || !routeForm.destinationPort || !routeForm.departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in origin port, destination port, and departure date",
        variant: "destructive"
      });
      return;
    }

    // Validate arrival date is after departure date if provided
    if (routeForm.arrivalDate && routeForm.departureDate && new Date(routeForm.arrivalDate) <= new Date(routeForm.departureDate)) {
      toast({
        title: "Invalid Date Range",
        description: "Arrival date must be after departure date",
        variant: "destructive"
      });
      return;
    }

    // Log the route with vessel association and create marketplace entry
    try {
      const selectedVessel = userVessels?.find(v => v.id === selectedVesselId);
      if (!selectedVessel) {
        throw new Error('Selected vessel not found');
      }

      // Convert capacity string to number for database, default to 0 if empty
      const capacityInKg = routeForm.availableCapacity ? 
        parseInt(routeForm.availableCapacity.replace(/[^\d]/g, '')) || 0 : 0;

      const priceEth = routeForm.priceEth ? parseFloat(routeForm.priceEth) : 0;

      // Create entry in carrier_routes table for journey tracking
      await supabase
        .from('carrier_routes')
        .insert([{
          vessel_id: selectedVesselId,
          origin_port: routeForm.originPort,
          destination_port: routeForm.destinationPort,
          departure_date: routeForm.departureDate,
          arrival_date: routeForm.arrivalDate || null,
          available_capacity_kg: capacityInKg,
          carrier_wallet_address: address
        }]);

      // Create entry in orders table for marketplace visibility
      await supabase
        .from('orders')
        .insert([{
          title: selectedVessel.title,
          order_type: 'vessel',
          origin_port: routeForm.originPort,
          destination_port: routeForm.destinationPort,
          departure_date: routeForm.departureDate,
          arrival_date: routeForm.arrivalDate || null,
          weight_tons: selectedVessel.weight_tons || Math.floor(capacityInKg / 1000),
          vessel_type: selectedVessel.vessel_type,
          description: selectedVessel.description,
          price_eth: priceEth,
          wallet_address: address,
          status: 'pending'
        }]);
      
      // Refetch logged journeys to show the new one
      refetchJourneys();
      
      toast({
        title: "Journey Logged Successfully",
        description: "Your journey has been logged and is now available on the marketplace",
      });
    } catch (error) {
      console.error('Error logging route:', error);
      toast({
        title: "Error",
        description: "Failed to log journey. Please try again.",
        variant: "destructive"
      });
    }

    setHasSearched(true);
  };

  const handleAcceptJob = async (orderId: string) => {
    toast({
      title: "Job Accepted",
      description: "You have successfully accepted this shipping job",
    });
  };

  const handleSelectJourney = (journey: any) => {
    setRouteForm({
      originPort: journey.origin_port,
      destinationPort: journey.destination_port,
      departureDate: journey.departure_date,
      arrivalDate: journey.arrival_date || '',
      availableCapacity: journey.available_capacity_kg ? journey.available_capacity_kg.toLocaleString() + ' kg' : '',
      priceEth: ''
    });
    
    // Select the vessel associated with this journey if available
    if (journey.vessel_id) {
      setSelectedVesselId(journey.vessel_id);
    }
    
    toast({
      title: "Route Selected",
      description: "Form filled with selected journey details",
    });
  };

  const handleDeleteJourney = async (journeyId: string) => {
    try {
      await supabase
        .from('carrier_routes')
        .delete()
        .eq('id', journeyId);
      
      refetchJourneys();
      
      toast({
        title: "Journey Deleted",
        description: "Journey has been removed from your logs",
      });
    } catch (error) {
      console.error('Error deleting journey:', error);
      toast({
        title: "Error",
        description: "Failed to delete journey",
        variant: "destructive"
      });
    }
  };

  // State for details modal
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, order: any | null }>({ open: false, order: null });

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="maritime-card maritime-card-glow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
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

        <div className="flex justify-between items-center pt-3 border-t border-[#CCD6F6]/20">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-medium">{order.price_eth} ETH</span>
          </div>
          {order.weight_tons && (
            <span className="text-xs text-[#CCD6F6]/70">{order.weight_tons} tons</span>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
        <Button 
          className="w-full maritime-button bg-[#64FFDA] hover:bg-[#4FD1C7] text-[#0A192F] font-serif"
          onClick={() => handleAcceptJob(order.id)}
        >
          Accept Job
        </Button>
          {(order.nft_token_id && order.nft_contract_address) && (
            <Button
              variant="outline"
              className="w-full maritime-button border-[#64FFDA] text-[#64FFDA] hover:bg-[#64FFDA]/10 font-serif"
              onClick={() => setDetailsModal({ open: true, order })}
            >
              See Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const PolicyCard = ({ policy }: { policy: any }) => (
    <Card className="maritime-card maritime-card-glow">
      <CardHeader>
        <CardTitle className="text-[#FFFFFF] font-serif font-medium">{policy.policy_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[#CCD6F6] font-serif text-sm">{policy.description}</p>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[#D4AF37] font-medium">Premium: {policy.premium_eth} ETH</div>
            <div className="text-[#64FFDA] font-medium">Payout: {policy.payout_amount_eth} ETH</div>
          </div>
        </div>

        <Button 
          className="w-full maritime-button bg-[#CCD6F6]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] font-serif border border-[#CCD6F6]/30"
        >
          Purchase Policy
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Vessel Selection */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#D4AF37]" />
            Select Your Vessel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-[#CCD6F6] font-serif mb-4">Please connect your wallet to access your vessel fleet</p>
            </div>
          ) : loadingVessels ? (
            <div className="text-center py-8 text-[#CCD6F6]">Loading your vessels...</div>
          ) : !userVessels || userVessels.length === 0 ? (
            <div className="text-center py-8">
              <Ship className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
              <p className="text-[#CCD6F6] font-serif mb-4">No vessels found in your fleet</p>
              <Button
                onClick={() => navigate('/register-vessel')}
                className="maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Your First Vessel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="maritime-form-group">
                <Label htmlFor="vesselSelect" className="maritime-label">Choose Vessel</Label>
                <Select value={selectedVesselId} onValueChange={handleVesselSelect}>
                  <SelectTrigger className="maritime-input">
                    <SelectValue placeholder="Select a vessel from your fleet" />
                  </SelectTrigger>
                  <SelectContent className="maritime-card bg-[#1E3A5F] border-[#CCD6F6]/30">
                    {userVessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id} className="text-[#FFFFFF] font-serif">
                        {vessel.title} - {vessel.weight_tons || 0} tons
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedVessel && (
                <div className="bg-[#1E3A5F]/30 p-4 rounded-lg border border-[#CCD6F6]/20">
                  <h4 className="text-[#D4AF37] font-serif font-medium mb-2">Selected Vessel Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#CCD6F6]/70">Type:</span>
                      <span className="text-[#FFFFFF] ml-2">{selectedVessel.vessel_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div>
                      <span className="text-[#CCD6F6]/70">Capacity:</span>
                      <span className="text-[#FFFFFF] ml-2">{selectedVessel.weight_tons || 0} tons</span>
                    </div>
                  </div>
                  {selectedVessel.description && (
                    <p className="text-[#CCD6F6] text-sm mt-2">{selectedVessel.description}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Input Form */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#D4AF37]" />
            Log Your Journey & List on Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            <div className="maritime-form-group">
              <Label htmlFor="originPort" className="maritime-label">Origin Port</Label>
              <Input
                id="originPort"
                value={routeForm.originPort}
                onChange={(e) => setRouteForm(prev => ({ ...prev, originPort: e.target.value }))}
                placeholder="e.g., Shanghai"
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="destinationPort" className="maritime-label">Destination Port</Label>
              <Input
                id="destinationPort"
                value={routeForm.destinationPort}
                onChange={(e) => setRouteForm(prev => ({ ...prev, destinationPort: e.target.value }))}
                placeholder="e.g., Long Beach"
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="departureDate" className="maritime-label">Departure Date</Label>
              <Input
                id="departureDate"
                type="date"
                value={routeForm.departureDate}
                onChange={(e) => setRouteForm(prev => ({ ...prev, departureDate: e.target.value }))}
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="arrivalDate" className="maritime-label">Arrival Date</Label>
              <Input
                id="arrivalDate"
                type="date"
                value={routeForm.arrivalDate}
                onChange={(e) => setRouteForm(prev => ({ ...prev, arrivalDate: e.target.value }))}
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="availableCapacity" className="maritime-label">Available Capacity</Label>
              <Input
                id="availableCapacity"
                type="text"
                value={routeForm.availableCapacity}
                onChange={(e) => setRouteForm(prev => ({ ...prev, availableCapacity: e.target.value }))}
                placeholder="e.g., 50,000 kg"
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="priceEth" className="maritime-label">Rate (ETH)</Label>
              <Input
                id="priceEth"
                type="number"
                step="0.001"
                value={routeForm.priceEth}
                onChange={(e) => setRouteForm(prev => ({ ...prev, priceEth: e.target.value }))}
                placeholder="0.0"
                className="maritime-input"
                disabled={!selectedVesselId}
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={!selectedVesselId}
              className="maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif mt-6"
            >
              <Search className="w-4 h-4 mr-2" />
              List on Marketplace
            </Button>
          </div>
          
          {!selectedVesselId && (
            <p className="text-[#CCD6F6]/70 text-sm mt-2 font-serif">
              Please select a vessel first to log journey details
            </p>
          )}
        </CardContent>
      </Card>

      {/* Your Logged Journeys Section */}
      {loggedJourneys && loggedJourneys.length > 0 && (
        <Card className="maritime-card maritime-card-glow">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
              <History className="w-5 h-5 text-[#D4AF37]" />
              Your Logged Journeys ({loggedJourneys.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingJourneys ? (
              <div className="text-center py-8 text-[#CCD6F6]">Loading your journeys...</div>
            ) : (
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  {loggedJourneys.map((journey) => (
                    <JourneyCard
                      key={journey.id}
                      journey={journey}
                      onSelect={handleSelectJourney}
                      onDelete={handleDeleteJourney}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {hasSearched && (
        <Card className="maritime-card maritime-card-glow">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] font-serif font-medium">Available Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="direct" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1E3A5F] border border-[#D4AF37]/30">
                <TabsTrigger 
                  value="direct" 
                  className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
                >
                  Direct Matches ({directMatches?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="nearby" 
                  className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
                >
                  Nearby Opportunities ({nearbyMatches?.length || 0})
                </TabsTrigger>
                <TabsTrigger 
                  value="insurance" 
                  className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
                >
                  Carrier Insurance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="direct" className="mt-6">
                {loadingDirect ? (
                  <div className="text-center py-8 text-[#CCD6F6]">Loading direct matches...</div>
                ) : directMatches?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                    <p className="text-[#CCD6F6] font-serif">No exact matches found for your route</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {directMatches?.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="nearby" className="mt-6">
                {loadingNearby ? (
                  <div className="text-center py-8 text-[#CCD6F6]">Loading nearby opportunities...</div>
                ) : nearbyMatches?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                    <p className="text-[#CCD6F6] font-serif">No nearby opportunities found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nearbyMatches?.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="insurance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carrierPolicies?.map((policy) => (
                    <PolicyCard key={policy.id} policy={policy} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* NFT Details Modal */}
      <Dialog open={detailsModal.open} onOpenChange={open => setDetailsModal({ open, order: open ? detailsModal.order : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>NFT On-Chain Details</DialogTitle>
            <DialogDescription>
              Token ID: <span className="font-mono">{detailsModal.order?.nft_token_id}</span><br />
              Contract: <span className="font-mono break-all">{detailsModal.order?.nft_contract_address}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-[#CCD6F6]">
            <a
              href={`https://cardona-zkevm.polygonscan.com/token/${detailsModal.order?.nft_contract_address}?a=${detailsModal.order?.nft_token_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64FFDA] underline"
            >
              View on Block Explorer
            </a>
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailsModal({ open: false, order: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarrierView;
