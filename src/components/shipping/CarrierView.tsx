import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Ship, Search, MapPin, Calendar, Package, Shield, Coins, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InsurancePolicyModal from './InsurancePolicyModal';
import JourneyCard from './JourneyCard';

interface RouteForm {
  originPort: string;
  destinationPort: string;
  departureDate: string;
  availableCapacity: number;
}

const CarrierView = () => {
  const { toast } = useToast();
  const [routeForm, setRouteForm] = useState<RouteForm>({
    originPort: '',
    destinationPort: '',
    departureDate: '',
    availableCapacity: 0
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

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

  const handleSearch = async () => {
    if (!routeForm.originPort || !routeForm.destinationPort || !routeForm.departureDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all route details",
        variant: "destructive"
      });
      return;
    }

    // Log the route
    try {
      await supabase
        .from('carrier_routes')
        .insert([{
          origin_port: routeForm.originPort,
          destination_port: routeForm.destinationPort,
          departure_date: routeForm.departureDate,
          available_capacity_kg: routeForm.availableCapacity
        }]);
      
      // Refetch logged journeys to show the new one
      refetchJourneys();
    } catch (error) {
      console.error('Error logging route:', error);
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
      availableCapacity: journey.available_capacity_kg || 0
    });
    
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
            <span className="text-[#D4AF37] font-medium">{order.price_ink} INK</span>
          </div>
          {order.weight_tons && (
            <span className="text-xs text-[#CCD6F6]/70">{order.weight_tons} tons</span>
          )}
        </div>

        <Button 
          className="w-full maritime-button bg-[#64FFDA] hover:bg-[#4FD1C7] text-[#0A192F] font-serif"
          onClick={() => handleAcceptJob(order.id)}
        >
          Accept Job
        </Button>
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
            <div className="text-[#D4AF37] font-medium">Premium: {policy.premium_ink} INK</div>
            <div className="text-[#64FFDA] font-medium">Payout: {policy.payout_amount_ink} INK</div>
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
      {/* Route Input Form */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#D4AF37]" />
            Log Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="floating-label-input">
              <Input
                id="originPort"
                value={routeForm.originPort}
                onChange={(e) => setRouteForm(prev => ({ ...prev, originPort: e.target.value }))}
                placeholder="e.g., Shanghai"
                className="maritime-input"
              />
              <Label htmlFor="originPort" className="floating-label">Origin Port</Label>
            </div>

            <div className="floating-label-input">
              <Input
                id="destinationPort"
                value={routeForm.destinationPort}
                onChange={(e) => setRouteForm(prev => ({ ...prev, destinationPort: e.target.value }))}
                placeholder="e.g., Long Beach"
                className="maritime-input"
              />
              <Label htmlFor="destinationPort" className="floating-label">Destination Port</Label>
            </div>

            <div className="floating-label-input">
              <Input
                id="departureDate"
                type="date"
                value={routeForm.departureDate}
                onChange={(e) => setRouteForm(prev => ({ ...prev, departureDate: e.target.value }))}
                className="maritime-input"
              />
              <Label htmlFor="departureDate" className="floating-label">Departure Date</Label>
            </div>

            <div className="floating-label-input">
              <Input
                id="availableCapacity"
                type="number"
                value={routeForm.availableCapacity}
                onChange={(e) => setRouteForm(prev => ({ ...prev, availableCapacity: Number(e.target.value) }))}
                placeholder="Capacity in kg"
                className="maritime-input"
              />
              <Label htmlFor="availableCapacity" className="floating-label">Capacity (kg)</Label>
            </div>

            <Button
              onClick={handleSearch}
              className="maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Freight
            </Button>
          </div>
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
    </div>
  );
};

export default CarrierView;
