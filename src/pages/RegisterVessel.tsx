
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Ship, AlertCircle, Wallet } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseAbiItem, decodeEventLog } from 'viem';
import VesselNFT from '@/../contracts/ABI/VesselNFT.json';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface VesselMintedEventArgs {
  tokenId: bigint;
  owner: string;
  vesselName: string;
}

interface VesselMintedEvent {
  eventName: 'VesselMinted';
  args: VesselMintedEventArgs;
}

const RegisterVessel = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();
  const { address: wagmiAddress, chain } = useAccount();
  const queryClient = useQueryClient();
  const vesselNFTAddress = CONTRACT_ADDRESSES.vesselNFT as `0x${string}`;

  const [formData, setFormData] = useState({
    vesselName: '',
    imoNumber: '',
    vesselType: '',
    capacity: '',
    description: '',
    flagState: '',
    yearBuilt: '',
  });

  const [detailsModal, setDetailsModal] = useState<{ open: boolean, tokenId?: string, contract?: string }>({ open: false });

  // --- WAGMI HOOKS for Blockchain Interaction ---
  const { data: mintTxHash, isPending: isMintingPending, writeContract, error: mintError } = useWriteContract();

  const { data: mintTxReceipt, isLoading: isMintingTxLoading, isSuccess: isMintingTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // --- DATABASE MUTATION ---
  const createVesselMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('orders')
        .insert([{
          title: data.vesselName,
          description: `IMO: ${data.imoNumber}\n${data.description}`,
          order_type: 'vessel',
          vessel_type: data.vesselType,
          weight_tons: parseInt(data.capacity),
          price_eth: 0,
          origin_port: 'TBD',
          destination_port: 'TBD',
          departure_date: new Date().toISOString().split('T')[0],
          arrival_date: new Date().toISOString().split('T')[0],
          wallet_address: address,
          status: 'pending',
          nft_token_id: data.tokenId,
          nft_contract_address: vesselNFTAddress,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Vessel registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-vessels'] });
      navigate('/vessels');
    },
    onError: (error: any) => {
      console.error('Database save error:', error);
      toast.error('NFT was minted, but failed to save vessel to database. Please contact support.', {
        description: `Tx Hash: ${mintTxHash}`
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !wagmiAddress) {
      toast.error('Please connect your wallet to register a vessel');
      return;
    }

    if (!formData.vesselName || !formData.vesselType || !formData.capacity || !formData.imoNumber || !formData.flagState || !formData.yearBuilt) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.info('Minting Vessel NFT, please confirm in your wallet...');
    writeContract({
      address: vesselNFTAddress,
      abi: VesselNFT.abi,
      functionName: 'mintVessel',
      args: [
        wagmiAddress,
        formData.vesselName,
        formData.imoNumber,
        formData.flagState,
        BigInt(formData.yearBuilt)
      ],
      account: wagmiAddress,
      chain,
    });
  };

  // --- EFFECT to handle the workflow AFTER minting is successful ---
  useEffect(() => {
    if (isMintingTxSuccess && mintTxReceipt) {
      toast.success('Vessel NFT Minted! Saving vessel details...');

      // Parse the transaction logs to find the minted token ID
      let mintedTokenId: string | null = null;
      const eventAbi = parseAbiItem('event VesselMinted(uint256 indexed tokenId, address indexed owner, string vesselName)');

      for (const log of mintTxReceipt.logs) {
        try {
          const decodedLog = decodeEventLog({ 
            abi: [eventAbi], 
            data: log.data, 
            topics: log.topics 
          }) as VesselMintedEvent;
          
          if (decodedLog.eventName === 'VesselMinted') {
            mintedTokenId = decodedLog.args.tokenId.toString();
            break;
          }
        } catch (e) {
          // This log was not the one we were looking for, ignore error
        }
      }

      if (mintedTokenId) {
        createVesselMutation.mutate({ ...formData, tokenId: mintedTokenId });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- UNIFIED LOADING STATE ---
  const isProcessing = isMintingPending || isMintingTxLoading || createVesselMutation.isPending;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-4">Register Vessel</h1>
            <p className="text-[#CCD6F6] font-serif mb-8">Please connect your wallet to register a vessel</p>
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

        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">Register New Vessel</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Add a new vessel to your fleet</p>
        </div>

        <div className="max-w-2xl mx-auto page-enter" style={{ animationDelay: '0.2s' }}>
          <Card className="maritime-card maritime-card-glow">
            <CardHeader>
              <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
                <Ship className="w-5 h-5 text-[#D4AF37]" />
                Vessel Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected && (
                <div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[#FF6B6B]">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-serif text-sm">Please connect your wallet to register vessels</span>
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Vessel Name *</Label>
                    <Input
                      value={formData.vesselName}
                      onChange={(e) => handleInputChange('vesselName', e.target.value)}
                      placeholder="e.g., MV Pacific Star"
                      className="maritime-input"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">IMO Number *</Label>
                    <Input
                      value={formData.imoNumber}
                      onChange={(e) => handleInputChange('imoNumber', e.target.value)}
                      placeholder="e.g., IMO1234567"
                      className="maritime-input"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Flag State *</Label>
                    <Input
                      value={formData.flagState}
                      onChange={(e) => handleInputChange('flagState', e.target.value)}
                      placeholder="e.g., Panama"
                      className="maritime-input"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Year Built *</Label>
                    <Input
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                      placeholder="e.g., 2015"
                      className="maritime-input"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Vessel Type *</Label>
                    <Select value={formData.vesselType} onValueChange={(value) => handleInputChange('vesselType', value)} disabled={isProcessing}>
                      <SelectTrigger className="maritime-input">
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent className="maritime-card">
                        <SelectItem value="container_ship">Container Ship</SelectItem>
                        <SelectItem value="bulk_carrier">Bulk Carrier</SelectItem>
                        <SelectItem value="tanker">Tanker</SelectItem>
                        <SelectItem value="ro_ro">Ro-Ro</SelectItem>
                        <SelectItem value="general_cargo">General Cargo</SelectItem>
                        <SelectItem value="lng_carrier">LNG Carrier</SelectItem>
                        <SelectItem value="lpg_carrier">LPG Carrier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Capacity (tons) *</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="e.g., 50000"
                      className="maritime-input"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#CCD6F6] font-serif">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Additional vessel details, certifications, special equipment..."
                    rows={3}
                    className="maritime-input"
                    disabled={isProcessing}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !isConnected}
                  className="w-full maritime-button bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0A192F] font-serif font-semibold py-3 text-lg"
                >
                  {isProcessing ? 'Processing...' : 'Register Vessel & Mint NFT'}
                </Button>

                {/* See Details Button (only if NFT minted) */}
                {createVesselMutation.data?.nft_token_id && createVesselMutation.data?.nft_contract_address && (
                  <Button
                    variant="outline"
                    className="w-full maritime-button border-[#64FFDA] text-[#64FFDA] hover:bg-[#64FFDA]/10 font-serif mt-4"
                    onClick={() => setDetailsModal({ open: true, tokenId: createVesselMutation.data.nft_token_id, contract: createVesselMutation.data.nft_contract_address })}
                  >
                    See NFT Details
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* NFT Details Modal */}
        <Dialog open={detailsModal.open} onOpenChange={open => setDetailsModal({ open, tokenId: open ? detailsModal.tokenId : undefined, contract: open ? detailsModal.contract : undefined })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vessel NFT On-Chain Details</DialogTitle>
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
    </div>
  );
};

export default RegisterVessel;
