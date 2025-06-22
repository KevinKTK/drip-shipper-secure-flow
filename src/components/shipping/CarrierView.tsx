import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Ship, AlertCircle, Wallet, Shield, ExternalLink } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import InsurancePolicyModal from './InsurancePolicyModal';
import PlatformProtectionCard from './PlatformProtectionCard';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbiItem } from 'viem';
import { decodeEventLog } from 'viem';
import JourneyNFT from '@/../contracts/ABI/JourneyNFT.json';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface JourneyMintedEventArgs {
  tokenId: bigint;
  carrier: string;
  vesselId: bigint;
}

interface JourneyMintedEvent {
  eventName: 'JourneyMinted';
  args: JourneyMintedEventArgs;
}

const CarrierView = () => {
  // --- STATE MANAGEMENT ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [arrivalDate, setArrivalDate] = useState<Date>();
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [availableCapacity, setAvailableCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, tokenId?: string, contract?: string }>({ open: false });

  // --- HOOKS INITIALIZATION ---
  const { isConnected, address, loading: authLoading } = useAuth();
  const { address: wagmiAddress, chain } = useAccount();
  const queryClient = useQueryClient();
  const journeyNFTAddress = CONTRACT_ADDRESSES.journeyNFT as `0x${string}`;

  // Fetch user's vessels from Supabase
  const { data: userVessels } = useQuery({
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

  const { data: insuranceTemplates } = useQuery({
    queryKey: ['insurance-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('insurance_templates').select('*').eq('policy_type', 'carrier').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // --- WAGMI HOOKS for Blockchain Interaction ---
  const { data: mintTxHash, isPending: isMintingPending, writeContract, error: mintError } = useWriteContract();

  const { data: mintTxReceipt, isLoading: isMintingTxLoading, isSuccess: isMintingTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // --- DATABASE MUTATION ---
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase.from('orders').insert([orderData]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Journey route saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Reset form
      setTitle('');
      setDescription('');
      setOriginPort('');
      setDestinationPort('');
      setDepartureDate(undefined);
      setArrivalDate(undefined);
      setSelectedVessel(null);
      setAvailableCapacity('');
      setPrice('');
      setSelectedInsurance(null);
    },
    onError: (error: any) => {
      console.error('Database save error:', error);
      toast.error('NFT was minted, but failed to save journey route to database. Please contact support.', {
        description: `Tx Hash: ${mintTxHash}`
      });
    },
  });

  // --- SUBMIT HANDLER ---
  const handleCreateRoute = () => {
    if (!isConnected || !wagmiAddress) {
      toast.error('Please connect your wallet to create a journey route');
      return;
    }

    if (!title || !originPort || !destinationPort || !departureDate || !price || !selectedVessel || !availableCapacity) {
      toast.error('Please fill in all required fields and select a vessel');
      return;
    }

    toast.info('Minting Journey NFT, please confirm in your wallet...');
    writeContract({
      address: journeyNFTAddress,
      abi: JourneyNFT.abi,
      functionName: 'mintJourney',
      args: [
        wagmiAddress,
        BigInt(selectedVessel.nft_token_id || 0),
        originPort,
        destinationPort,
        BigInt(Math.floor(departureDate.getTime() / 1000)), // Convert to Unix timestamp
        BigInt(arrivalDate ? Math.floor(arrivalDate.getTime() / 1000) : Math.floor(addDays(departureDate, 14).getTime() / 1000))
      ],
      account: wagmiAddress,
      chain,
    });
  };

  // --- EFFECT to handle the workflow AFTER minting is successful ---
  useEffect(() => {
    if (isMintingTxSuccess && mintTxReceipt) {
      toast.success('Journey NFT Minted! Saving route details...');

      // Parse the transaction logs to find the minted token ID
      let mintedTokenId: string | null = null;
      const eventAbi = parseAbiItem('event JourneyMinted(uint256 indexed tokenId, address indexed carrier, uint256 indexed vesselId)');

      for (const log of mintTxReceipt.logs) {
        try {
          const decodedLog = decodeEventLog({ 
            abi: [eventAbi], 
            data: log.data, 
            topics: log.topics 
          }) as JourneyMintedEvent;
          
          if (decodedLog.eventName === 'JourneyMinted') {
            mintedTokenId = decodedLog.args.tokenId.toString();
            break;
          }
        } catch (e) {
          // This log was not the one we were looking for, ignore error
        }
      }

      if (mintedTokenId) {
        const orderData = {
          order_type: 'vessel',
          title,
          description,
          origin_port: originPort,
          destination_port: destinationPort,
          departure_date: departureDate ? format(departureDate, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
          arrival_date: arrivalDate ? format(arrivalDate, 'yyyy-MM-dd') : null,
          vessel_type: selectedVessel.vessel_type,
          weight_tons: availableCapacity ? parseInt(availableCapacity) : null,
          price_eth: parseFloat(price),
          is_insured: !!selectedInsurance,
          selected_insurance_policy_id: selectedInsurance?.isTemplate ? selectedInsurance.id : null,
          user_insurance_policy_id: selectedInsurance?.isTemplate ? null : selectedInsurance.id,
          status: 'pending',
          wallet_address: address,
          nft_token_id: mintedTokenId,
          nft_contract_address: journeyNFTAddress,
          // Mandatory penalty system fields
          penalty_rate_per_day: 10,
          max_penalty_percentage: 100,
          expected_delivery_timestamp: arrivalDate ? arrivalDate.toISOString() : addDays(departureDate!, 14).toISOString(),
          penalty_amount_eth: 0,
          is_penalty_applied: false,
        };
        createOrderMutation.mutate(orderData);
      } else {
        toast.error('Could not extract Token ID from minting transaction. Please contact support.', {
          description: `Tx Hash: ${mintTxHash}`
        });
      }
    }
  }, [isMintingTxSuccess, mintTxReceipt]);

  // Effect for handling minting errors
  useEffect(() => {
    if (mintError) {
      toast.error((mintError as any).message || "An error occurred during minting.");
    }
  }, [mintError]);

  const calculateTotal = () => {
    const basePrice = parseFloat(price) || 0;
    const insurancePremium = selectedInsurance ? selectedInsurance.premium_eth : 0;
    return basePrice + insurancePremium;
  };

  const handleInsuranceSelect = (insurance: any) => {
    setSelectedInsurance(insurance);
    setShowInsuranceModal(false);
  };

  // --- UNIFIED LOADING STATE ---
  const isProcessing = isMintingPending || isMintingTxLoading || createOrderMutation.isPending;

  if (authLoading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
        </div>
    );
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Journey Route Form */}
        <Card className="maritime-card maritime-card-glow">
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
              <Ship className="w-5 h-5 text-[#D4AF37]" />
              Register Vessel Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && (
                <div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[#FF6B6B]">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-serif text-sm">Please connect your wallet to register vessel routes</span>
                    </div>
                  </div>
                </div>
            )}

            {isConnected && address && (
                <div className="bg-[#64FFDA]/20 border border-[#64FFDA]/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-[#64FFDA]">
                    <Wallet className="w-4 h-4" />
                    <span className="font-serif text-sm">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
                  </div>
                </div>
            )}

            {/* Vessel Selection */}
            <div className="space-y-4 p-4 bg-[#1E3A5F]/30 rounded-lg border border-[#D4AF37]/20">
              <h3 className="text-[#D4AF37] font-serif font-medium">Select Your Vessel</h3>
              
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Select Vessel *</Label>
                <Select value={selectedVessel?.id || ''} onValueChange={(value) => {
                  const vessel = userVessels?.find(v => v.id === value);
                  setSelectedVessel(vessel);
                }} disabled={isProcessing || !isConnected}>
                  <SelectTrigger className="maritime-input">
                    <SelectValue placeholder="Choose a vessel from your fleet" />
                  </SelectTrigger>
                  <SelectContent className="maritime-card">
                    {userVessels?.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id} className="text-[#FFFFFF] font-serif">
                        {vessel.title} - {vessel.vessel_type?.replace('_', ' ').toUpperCase()} ({vessel.weight_tons} tons)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {userVessels?.length === 0 && (
                  <p className="text-xs text-[#CCD6F6]/70 font-serif">
                    No vessels found. Please register a vessel first in the "My Vessels" tab.
                  </p>
                )}
              </div>

              {selectedVessel && (
                <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#64FFDA]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-[#64FFDA]" />
                      <span className="text-[#64FFDA] font-serif font-medium">{selectedVessel.title}</span>
                    </div>
                    {selectedVessel.nft_token_id && selectedVessel.nft_contract_address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#64FFDA] hover:bg-[#64FFDA]/10 p-1"
                        onClick={() => window.open(`https://cardona-zkevm.polygonscan.com/token/${selectedVessel.nft_contract_address}?a=${selectedVessel.nft_token_id}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-[#CCD6F6] font-serif">
                    <p>Type: {selectedVessel.vessel_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p>Capacity: {selectedVessel.weight_tons} tons</p>
                    {selectedVessel.nft_token_id && (
                      <p>NFT Token ID: {selectedVessel.nft_token_id}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Route Information */}
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Route Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Hamburg to Rotterdam Express Route" className="maritime-input" disabled={isProcessing || !isConnected} />
            </div>

            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Route Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details about your route..." className="maritime-input min-h-[80px]" disabled={isProcessing || !isConnected} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Origin Port *</Label>
                <Input value={originPort} onChange={(e) => setOriginPort(e.target.value)} placeholder="e.g., Hamburg" className="maritime-input" disabled={isProcessing || !isConnected} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Destination Port *</Label>
                <Input value={destinationPort} onChange={(e) => setDestinationPort(e.target.value)} placeholder="e.g., Rotterdam" className="maritime-input" disabled={isProcessing || !isConnected} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Departure Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal maritime-input", !departureDate && "text-muted-foreground")} disabled={isProcessing || !isConnected}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 maritime-card">
                    <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Arrival Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal maritime-input", !arrivalDate && "text-muted-foreground")} disabled={isProcessing || !isConnected}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {arrivalDate ? format(arrivalDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 maritime-card">
                    <Calendar mode="single" selected={arrivalDate} onSelect={setArrivalDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Available Capacity (tons) *</Label>
                <Input type="number" value={availableCapacity} onChange={(e) => setAvailableCapacity(e.target.value)} placeholder="5000" className="maritime-input" disabled={isProcessing || !isConnected} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Rate (ETH per ton) *</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.1" className="maritime-input" disabled={isProcessing || !isConnected} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#CCD6F6] font-serif">Optional Insurance Coverage</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowInsuranceModal(true)} className="maritime-button-outline" disabled={isProcessing || !isConnected}>
                  Browse Policies
                </Button>
              </div>
              {selectedInsurance && (
                  <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#64FFDA]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Ship className="w-4 h-4 text-[#64FFDA]" />
                      <span className="text-[#64FFDA] font-serif font-medium">{selectedInsurance.policy_name}</span>
                      {!selectedInsurance.isTemplate && (
                        <Badge className="bg-[#64FFDA] text-[#0A192F] text-xs">Custom</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#CCD6F6] mb-2 font-serif">{selectedInsurance.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#CCD6F6] font-serif">Premium:</span>
                      <span className="text-[#D4AF37] font-medium">{selectedInsurance.premium_eth} ETH</span>
                    </div>
                  </div>
              )}
            </div>

            <Button onClick={handleCreateRoute} disabled={isProcessing || !isConnected} className="w-full maritime-button bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0A192F] font-serif">
              {isProcessing ? 'Processing...' : 'Register Route & Mint Journey NFT'}
            </Button>
          </CardContent>
        </Card>

        {/* Route Summary */}
        <div className="space-y-6">
          <PlatformProtectionCard />
          
          <Card className="maritime-card maritime-card-glow">
            <CardHeader>
              <CardTitle className="text-[#FFFFFF] font-serif font-medium">Your Route Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-[#CCD6F6] font-serif">
                <div className="flex justify-between">
                  <span>Vessel:</span>
                  <span className="text-[#FFFFFF]">{selectedVessel?.title || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span className="text-[#FFFFFF]">{originPort || 'Origin'} → {destinationPort || 'Destination'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Departure:</span>
                  <span className="text-[#FFFFFF]">
                  {departureDate ? format(departureDate, 'MMM dd, yyyy') : 'Not selected'}
                </span>
                </div>
                {arrivalDate && (
                    <div className="flex justify-between">
                      <span>Arrival:</span>
                      <span className="text-[#FFFFFF]">{format(arrivalDate, 'MMM dd, yyyy')}</span>
                    </div>
                )}
                <div className="flex justify-between">
                  <span>Vessel Type:</span>
                  <span className="text-[#FFFFFF]">
                  {selectedVessel?.vessel_type ? selectedVessel.vessel_type.replace('_', ' ').toUpperCase() : 'Not selected'}
                </span>
                </div>
                {availableCapacity && (
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="text-[#FFFFFF]">{availableCapacity} tons</span>
                    </div>
                )}
              </div>

              <div className="border-t border-[#CCD6F6]/20 pt-4 space-y-3">
                <div className="flex justify-between text-[#CCD6F6] font-serif">
                  <span>Rate per ton:</span>
                  <span className="text-[#FFFFFF]">{price || '0'} ETH</span>
                </div>
                {selectedInsurance && (
                    <div className="flex justify-between text-[#CCD6F6] font-serif">
                      <span>Insurance Premium:</span>
                      <span className="text-[#64FFDA]">{selectedInsurance.premium_eth} ETH</span>
                    </div>
                )}
              </div>
              
              {/* Mandatory Penalty Protection Summary */}
              <div className="bg-[#D4AF37]/10 p-4 rounded-lg border border-[#D4AF37]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-serif font-medium">Automatic Penalty Protection</span>
                  <Badge className="bg-[#D4AF37] text-[#0A192F] text-xs">Included</Badge>
                </div>
                <div className="space-y-1 text-xs text-[#CCD6F6] font-serif">
                  <p>• 10% penalty per 24h delay from your payout</p>
                  <p>• Automatic refund to cargo owner</p>
                  <p>• Incentivizes on-time delivery</p>
                </div>
              </div>

              {selectedInsurance && (
                  <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#64FFDA]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Ship className="w-4 h-4 text-[#64FFDA]" />
                      <span className="text-[#64FFDA] font-serif font-medium">Insurance Coverage</span>
                      {!selectedInsurance.isTemplate && (
                        <Badge className="bg-[#64FFDA] text-[#0A192F] text-xs">Custom Policy</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-[#CCD6F6] font-serif">
                      <div className="flex justify-between">
                        <span>Coverage:</span>
                        <span className="text-[#FFFFFF]">{selectedInsurance.payout_amount_eth} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trigger:</span>
                        <span className="text-[#FFFFFF]">{selectedInsurance.trigger_condition}</span>
                      </div>
                      {selectedInsurance.cargo_damage_threshold_percentage && (
                          <div className="flex justify-between">
                            <span>Threshold:</span>
                            <span className="text-[#FFFFFF]">{selectedInsurance.cargo_damage_threshold_percentage}% damage</span>
                          </div>
                      )}
                    </div>
                  </div>
              )}
              
              {/* See Details Button (only if NFT minted) */}
              {createOrderMutation.data?.nft_token_id && createOrderMutation.data?.nft_contract_address && (
                <Button
                  variant="outline"
                  className="w-full maritime-button border-[#64FFDA] text-[#64FFDA] hover:bg-[#64FFDA]/10 font-serif mt-4"
                  onClick={() => setDetailsModal({ open: true, tokenId: createOrderMutation.data.nft_token_id, contract: createOrderMutation.data.nft_contract_address })}
                >
                  See Details
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <InsurancePolicyModal
            isOpen={showInsuranceModal}
            onClose={() => setShowInsuranceModal(false)}
            onSelectPolicy={handleInsuranceSelect}
            policyType="carrier"
        />

        {/* NFT Details Modal */}
        <Dialog open={detailsModal.open} onOpenChange={open => setDetailsModal({ open, tokenId: open ? detailsModal.tokenId : undefined, contract: open ? detailsModal.contract : undefined })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Journey NFT On-Chain Details</DialogTitle>
              <DialogDescription>
                Token ID: <span className="font-mono">{detailsModal.tokenId}</span><br />
                Contract: <span className="font-mono break-all">{detailsModal.contract}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 text-sm text-[#CCD6F6]">
              <a
                href={`https://cardona-zkevm.polygonscan.com/token/${detailsModal.contract}?a=${detailsModal.tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64FFDA] underline"
              >
                View on Block Explorer
              </a>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailsModal({ open: false })}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default CarrierView;
