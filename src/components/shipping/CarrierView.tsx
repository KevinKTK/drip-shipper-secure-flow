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
import { useAuth } from '@/contexts/AuthContext';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbiItem, decodeEventLog } from 'viem';
import VesselNFT from '@/../contracts/ABI/VesselNFT.json';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface RouteForm {
  originPort: string;
  destinationPort: string;
  departureDate: string;
  availableCapacity: string;
}

const VESSEL_TYPE_OPTIONS = [
  { value: 'container_ship', label: 'Container Ship' },
  { value: 'bulk_carrier', label: 'Bulk Carrier' },
  { value: 'tanker', label: 'Tanker' },
  { value: 'ro_ro', label: 'Ro-Ro' },
  { value: 'general_cargo', label: 'General Cargo' },
  { value: 'lng_carrier', label: 'LNG Carrier' },
  { value: 'lpg_carrier', label: 'LPG Carrier' },
];

const CarrierView = () => {
  const { toast } = useToast();
  const [routeForm, setRouteForm] = useState<RouteForm>({
    originPort: '',
    destinationPort: '',
    departureDate: '',
    availableCapacity: ''
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
      // Convert capacity string to number for database, default to 0 if empty
      const capacityInKg = routeForm.availableCapacity ? 
        parseInt(routeForm.availableCapacity.replace(/[^\d]/g, '')) || 0 : 0;

      await supabase
        .from('carrier_routes')
        .insert([{
          origin_port: routeForm.originPort,
          destination_port: routeForm.destinationPort,
          departure_date: routeForm.departureDate,
          available_capacity_kg: capacityInKg
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
      availableCapacity: journey.available_capacity_kg ? journey.available_capacity_kg.toLocaleString() + ' kg' : ''
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

  // State for details modal
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, order: any | null }>({ open: false, order: null });
  const [imoError, setImoError] = useState<string | null>(null);

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
            <span className="text-[#D4AF37] font-medium">{order.price_ink} ETH</span>
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
            <div className="text-[#D4AF37] font-medium">Premium: {policy.premium_ink} ETH</div>
            <div className="text-[#64FFDA] font-medium">Payout: {policy.payout_amount_ink} ETH</div>
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

  // Vessel Registration State
  const [vesselName, setVesselName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [vesselType, setVesselType] = useState<
    'container_ship' | 'bulk_carrier' | 'tanker' | 'ro_ro' | 'general_cargo' | 'lng_carrier' | 'lpg_carrier'
  >('');
  const [capacity, setCapacity] = useState('');
  const [vesselPrice, setVesselPrice] = useState('');
  const [vesselDescription, setVesselDescription] = useState('');
  const [vesselOrigin, setVesselOrigin] = useState('');
  const [vesselDestination, setVesselDestination] = useState('');
  const [vesselDeparture, setVesselDeparture] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { isConnected, address, loading: authLoading } = useAuth();
  const { address: wagmiAddress } = useAccount();
  const vesselNFTAddress = CONTRACT_ADDRESSES.vesselNFT;

  const { data: mintTxHash, isPending: isMintingPending, writeContract, error: mintError } = useWriteContract();
  const { data: mintTxReceipt, isLoading: isMintingTxLoading, isSuccess: isMintingTxSuccess } = useWaitForTransactionReceipt({ hash: mintTxHash });

  // Vessel Registration Handler
  const handleRegisterVessel = () => {
    if (!isConnected || !wagmiAddress) {
      toast({ title: 'Please connect your wallet to register a vessel', variant: 'destructive' });
      return;
    }
    if (!vesselName || !imoNumber || !vesselType || !capacity || !vesselPrice || !vesselDescription || !vesselOrigin || !vesselDestination || !vesselDeparture) {
      toast({ title: 'Please fill in all vessel details', variant: 'destructive' });
      return;
    }
    setIsRegistering(true);
    toast({ title: 'Minting Vessel NFT, please confirm in your wallet...' });
    writeContract({
      address: vesselNFTAddress,
      abi: VesselNFT.abi,
      functionName: 'mintVessel',
      args: [wagmiAddress, vesselName, imoNumber, BigInt(capacity)],
    });
  };

  // Effect: After minting, save to Supabase
  React.useEffect(() => {
    if (isMintingTxSuccess && mintTxReceipt) {
      let mintedTokenId = null;
      const eventAbi = parseAbiItem('event VesselMinted(uint256 indexed tokenId, address indexed owner, string name, uint256 capacity)');
      for (const log of mintTxReceipt.logs) {
        try {
          const decodedLog = decodeEventLog({ abi: [eventAbi], data: log.data, topics: log.topics });
          if (decodedLog.eventName === 'VesselMinted') {
            mintedTokenId = (decodedLog.args).tokenId.toString();
            break;
          }
        } catch (e) {}
      }
      if (mintedTokenId) {
        // Save to Supabase orders table
        supabase.from('orders').insert([{
          order_type: 'vessel',
          title: vesselName,
          description: vesselDescription,
          origin_port: vesselOrigin,
          destination_port: vesselDestination,
          departure_date: vesselDeparture,
          vessel_type: vesselType as any,
          weight_tons: parseInt(capacity),
          price_eth: parseFloat(vesselPrice),
          status: 'pending',
          wallet_address: address,
          nft_token_id: mintedTokenId,
          nft_contract_address: vesselNFTAddress,
        }]).then(({ error }) => {
          if (error) {
            toast({ title: 'NFT minted, but failed to save vessel to database', description: error.message, variant: 'destructive' });
          } else {
            toast({ title: 'Vessel registered and NFT minted successfully!' });
            // Reset form
            setVesselName(''); setImoNumber(''); setVesselType(''); setCapacity(''); setVesselPrice(''); setVesselDescription(''); setVesselOrigin(''); setVesselDestination(''); setVesselDeparture('');
          }
          setIsRegistering(false);
        });
      } else {
        toast({ title: 'Could not extract Token ID from minting transaction', variant: 'destructive' });
        setIsRegistering(false);
      }
    }
  }, [isMintingTxSuccess, mintTxReceipt]);

  React.useEffect(() => {
    if (mintError) {
      toast({ title: mintError.shortMessage || 'An error occurred during minting.', variant: 'destructive' });
      setIsRegistering(false);
    }
  }, [mintError]);

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
            <div className="maritime-form-group">
              <Label htmlFor="originPort" className="maritime-label">Origin Port</Label>
              <Input
                id="originPort"
                value={routeForm.originPort}
                onChange={(e) => setRouteForm(prev => ({ ...prev, originPort: e.target.value }))}
                placeholder="e.g., Shanghai"
                className="maritime-input"
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
              />
            </div>

            <div className="maritime-form-group">
              <Label htmlFor="availableCapacity" className="maritime-label">Capacity</Label>
              <Input
                id="availableCapacity"
                type="text"
                value={routeForm.availableCapacity}
                onChange={(e) => setRouteForm(prev => ({ ...prev, availableCapacity: e.target.value }))}
                placeholder="e.g., 50,000 kg"
                className="maritime-input"
              />
            </div>

            <Button
              onClick={handleSearch}
              className="maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif mt-6"
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

      {/* Vessel Registration Form */}
      <Card className="maritime-card maritime-card-glow mb-8">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Ship className="w-5 h-5 text-[#D4AF37]" />
            Register Your Vessel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Vessel Name *</Label>
              <Input value={vesselName} onChange={e => setVesselName(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">IMO Number *</Label>
              <Input
                value={imoNumber}
                onChange={e => {
                  setImoNumber(e.target.value);
                  if (!/^\d{7}$/.test(e.target.value)) {
                    setImoError('IMO number must be exactly 7 digits, e.g., 1234567');
                  } else {
                    setImoError(null);
                  }
                }}
                className="maritime-input"
                disabled={isRegistering}
                maxLength={7}
                pattern="\\d{7}"
                inputMode="numeric"
                placeholder="e.g., 1234567"
              />
              <p className="text-xs text-[#64FFDA] font-serif mt-1">The IMO number is a 7-digit identifier, e.g., 1234567</p>
              {imoError && <p className="text-xs text-red-500 font-serif mt-1">{imoError}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Vessel Type *</Label>
              <Select value={vesselType} onValueChange={setVesselType} disabled={isRegistering}>
                <SelectTrigger className="maritime-input">
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent className="maritime-card">
                  {VESSEL_TYPE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Capacity (tons) *</Label>
              <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Price (ETH) *</Label>
              <Input type="number" value={vesselPrice} onChange={e => setVesselPrice(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[#CCD6F6] font-serif">Description *</Label>
              <Input value={vesselDescription} onChange={e => setVesselDescription(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Origin Port *</Label>
              <Input value={vesselOrigin} onChange={e => setVesselOrigin(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Destination Port *</Label>
              <Input value={vesselDestination} onChange={e => setVesselDestination(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Departure Date *</Label>
              <Input type="date" value={vesselDeparture} onChange={e => setVesselDeparture(e.target.value)} className="maritime-input" disabled={isRegistering} />
            </div>
          </div>
          <Button onClick={handleRegisterVessel} disabled={isRegistering || !isConnected} className="w-full maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif mt-6">
            {isRegistering ? 'Registering...' : 'Register Vessel & Mint NFT'}
          </Button>
        </CardContent>
      </Card>

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
          {/* Placeholder for on-chain data, e.g. owner, metadata, etc. */}
          <div className="mt-4 text-sm text-[#CCD6F6]">
            {/* You can fetch and display more on-chain data here using viem/ethers if desired */}
            <a
              href={`https://explorer-sepolia.inkonchain.com/token/${detailsModal.order?.nft_contract_address}/instance/${detailsModal.order?.nft_token_id}`}
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
