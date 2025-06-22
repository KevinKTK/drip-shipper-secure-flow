import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, TrendingUp, Sparkles, Shield, Coins } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, parseAbiItem, decodeEventLog, stringToHex } from 'viem';
import InsurancePolicyNFT from '@/../contracts/ABI/InsurancePolicyNFT.json';
import { CONTRACT_ADDRESSES } from '@/lib/walletSecrets';

// --- Type Definitions ---
interface RiskProbability {
  threshold: number;
  probability: number;
}
interface RiskAssessmentData {
  type: 'delay' | 'damage';
  summary: string;
  probabilities: RiskProbability[];
}

interface PolicyMintedEventArgs {
  policyTokenId: bigint;
}

interface PolicyMintedEvent {
  eventName: 'PolicyMinted';
  args: PolicyMintedEventArgs;
}

enum SolidityPolicyType {
  Vessel = 0,
  Cargo = 1,
}
enum SolidityTriggerCondition {
  None = 0,
  ArrivalDelay = 1,
  TemperatureFluctuation = 2,
  WeatherDamage = 3,
}

// --- Component ---
const ContractBuilder = () => {
  const [searchParams] = useSearchParams();
  const { isConnected } = useAuth();
  const queryClient = useQueryClient();
  const { address, chain } = useAccount();
  const insurancePolicyNFTAddress = CONTRACT_ADDRESSES.insurancePolicyNFT as `0x${string}`;

  // Wagmi hooks
  const { data: mintTxHash, isPending: isMintingPending, writeContract, error: mintError, reset: resetWriteContract } = useWriteContract();
  const { data: mintTxReceipt, isLoading: isMintingTxLoading, isSuccess: isMintingTxSuccess } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  });

  // Component State
  const [policyType, setPolicyType] = useState<'shipper' | 'carrier'>('shipper');
  const [delayThreshold, setDelayThreshold] = useState([48]);
  const [damageThreshold, setDamageThreshold] = useState([10]);
  const [payoutAmount, setPayoutAmount] = useState('1');
  const [policyName, setPolicyName] = useState('');
  const [includeForceMajeure, setIncludeForceMajeure] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [aiRiskAssessment, setAiRiskAssessment] = useState<RiskAssessmentData | null>(null);
  const [isLoadingRiskAssessment, setIsLoadingRiskAssessment] = useState(false);
  const policyDataForDb = useRef<any>(null);

  const calculatedPremium = (() => {
    const payout = parseFloat(payoutAmount) || 0;
    const baseRate = policyType === 'shipper' ? 0.05 : 0.08;
    const forceMajeureRate = includeForceMajeure ? 1.2 : 1.0;
    return payout * baseRate * forceMajeureRate;
  })();

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: any) => {
      const { data, error } = await supabase.from('user_insurance_policies').insert([policyData]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const policy = data as any;
      toast.success("Policy Saved to Database!", {
        description: `Policy "${policy.policy_name}" (NFT #${policy.nft_token_id}) is now in your portfolio.`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-insurance-policies', address, policyType] });
    },
    onError: (error: any) => {
      console.error('Policy creation error:', error);
      toast.error("Database Error", { description: `NFT was minted but failed to save. Please contact support. Tx: ${mintTxHash}` });
    },
  });

  const handleMintPolicy = async () => {
    // Validation checks
    if (!isConnected || !address) {
      toast.error("Wallet Required", { description: "Please connect your wallet." });
      return;
    }
    if (!policyName.trim()) {
      toast.error("Policy Name Required", { description: "Please enter a name for your policy." });
      return;
    }
    const payoutInEth = parseFloat(payoutAmount);
    if (isNaN(payoutInEth) || payoutInEth <= 0) {
      toast.error("Invalid Payout", { description: "Payout amount must be a positive number." });
      return;
    }

    try {
      const basePolicyData = {
        wallet_address: address,
        policy_name: policyName,
        payout_amount_eth: payoutInEth,
        premium_eth: calculatedPremium,
        is_active: true,
        policy_type: policyType
      };

      let policyData;
      let contractArgs: (string | bigint | `0x${string}`)[];

      const payoutAmountWei = parseEther(payoutAmount);
      const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60);

      if (policyType === 'shipper') {
        const policyTypeEnum = BigInt(SolidityPolicyType.Cargo);
        const triggerConditionEnum = BigInt(includeForceMajeure ? SolidityTriggerCondition.WeatherDamage : SolidityTriggerCondition.ArrivalDelay);
        const dataSource = stringToHex(includeForceMajeure ? 'PortAuthority_Weather' : 'PortAuthority', { size: 32 });
        const threshold = BigInt(delayThreshold[0]);

        policyData = { ...basePolicyData, delay_threshold_hours: delayThreshold[0] };
        contractArgs = [policyTypeEnum, BigInt(0), payoutAmountWei, triggerConditionEnum, dataSource, threshold, expiryTimestamp];

      } else { // carrier
        const policyTypeEnum = BigInt(SolidityPolicyType.Vessel);
        const triggerConditionEnum = BigInt(includeForceMajeure ? SolidityTriggerCondition.WeatherDamage : SolidityTriggerCondition.TemperatureFluctuation);
        const dataSource = stringToHex(includeForceMajeure ? 'CargoInspect_Weather' : 'CargoInspect', { size: 32 });
        const threshold = BigInt(damageThreshold[0]);

        policyData = { ...basePolicyData, cargo_damage_threshold_percentage: damageThreshold[0] };
        contractArgs = [policyTypeEnum, BigInt(0), payoutAmountWei, triggerConditionEnum, dataSource, threshold, expiryTimestamp];
      }

      policyDataForDb.current = policyData;
      toast.info("Minting Policy NFT", { description: "Please confirm in your wallet..." });

      console.log("Submitting transaction with arguments:", contractArgs);

      writeContract({
        address: insurancePolicyNFTAddress,
        abi: InsurancePolicyNFT.abi,
        functionName: 'mintPolicy',
        args: contractArgs,
        // value: premiumWei, // REMOVED FOR DEMO PURPOSES
        account: address,
        chain,
        gas: BigInt(500000),
      });

    } catch (e) {
      console.error("Error during argument preparation:", e);
      toast.error("Client Error", { description: "Failed to prepare the transaction. Check console for details."});
    }
  };

  // --- EFFECT HOOKS for Transaction Lifecycle ---

  // 1. When the transaction is successfully mined
  useEffect(() => {
    if (isMintingTxSuccess && mintTxReceipt) {
      let mintedTokenId: string | null = null;
      const eventAbi = parseAbiItem('event PolicyMinted(uint256 indexed policyTokenId, address indexed policyHolder, uint8 triggerCondition, uint256 payoutAmount)');

      for (const log of mintTxReceipt.logs) {
        if (log.address.toLowerCase() === insurancePolicyNFTAddress.toLowerCase()) {
          try {
            const decodedLog = decodeEventLog({ abi: [eventAbi], data: log.data, topics: log.topics }) as PolicyMintedEvent;
            if (decodedLog.eventName === 'PolicyMinted') {
              mintedTokenId = decodedLog.args.policyTokenId.toString();
              break;
            }
          } catch (e) { /* Ignore decoding errors for other events */ }
        }
      }

      if (mintedTokenId && policyDataForDb.current) {
        toast.success('NFT Minted Successfully!', {
          description: `Policy NFT with Token ID #${mintedTokenId} has been created on-chain. Saving to database...`,
        });
        const finalPolicyData = { ...policyDataForDb.current, nft_token_id: mintedTokenId, nft_contract_address: insurancePolicyNFTAddress };
        createPolicyMutation.mutate(finalPolicyData);
      } else {
        toast.error('Could not extract Token ID from transaction.', { description: `Tx Hash: ${mintTxHash}` });
      }

      policyDataForDb.current = null;
      resetWriteContract();
    }
  }, [isMintingTxSuccess, mintTxReceipt]);
  
  // 2. When the transaction is sent to the wallet
  useEffect(() => {
    if (mintTxHash) {
      toast.info("Transaction Sent!", {
        description: "Waiting for blockchain confirmation...",
        action: {
          label: "View on Explorer",
          onClick: () => window.open(`https://cardona-zkevm.polygonscan.com/tx/${mintTxHash}`, '_blank'),
        },
      });
    }
  }, [mintTxHash]);

  // 3. When there is a wallet/network error
  useEffect(() => {
    if (mintError) {
      toast.error("Minting Error", { description: (mintError as any).shortMessage || mintError.message });
      resetWriteContract();
    }
  }, [mintError]);

  const handleAiRiskAssessment = async () => {
    if (!sourceLocation.trim() || !destinationLocation.trim()) {
      toast.error("Route Information Required", { description: "Please enter both source and destination" });
      return;
    }
    setIsLoadingRiskAssessment(true);
    setAiRiskAssessment(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-risk-assessor', { body: { origin: sourceLocation, destination: destinationLocation, policyType: policyType === 'shipper' ? 'delay' : 'damage' } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setAiRiskAssessment(data);
      toast.success("Risk Assessment Complete", { description: "AI analysis has been generated" });
    } catch (error: any) {
      console.error("Risk assessment error:", error);
      toast.error("Assessment Failed", { description: error.message || "Could not generate risk assessment." });
    } finally {
      setIsLoadingRiskAssessment(false);
    }
  };

  const isProcessing = isMintingPending || isMintingTxLoading || createPolicyMutation.isPending;

  return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center mb-8 page-enter">
            <h1 className="text-4xl font-serif font-semibold text-[#FFFFFF] mb-2">Parametric Insurance Builder</h1>
            <p className="text-[#CCD6F6] font-serif">Create smart insurance policies for your shipping operations</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Risk Simulator Column */}
            <div className="page-enter-stagger" style={{ animationDelay: '0.2s' }}>
              <Card className="maritime-card maritime-card-glow">
                <CardHeader><CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#D4AF37]" />Risk Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#D4AF37]/30">
                    <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-[#D4AF37]" /><span className="text-[#CCD6F6] font-serif text-sm">Current Policy Type</span></div>
                    <Badge className={`${policyType === 'shipper' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' : 'bg-green-500/20 text-green-300 border-green-400/30'} font-serif`}>{policyType === 'shipper' ? 'Delay Protection' : 'Cargo Damage Protection'}</Badge>
                    <p className="text-xs text-[#CCD6F6]/70 mt-2 font-serif">{policyType === 'shipper' ? 'Covers shipment delays' : 'Covers cargo damage'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label className="text-[#CCD6F6] font-serif text-sm">Source Location</Label><Input value={sourceLocation} onChange={(e) => setSourceLocation(e.target.value)} placeholder="e.g., Shanghai Port, China" className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif text-sm" /></div>
                    <div className="space-y-2"><Label className="text-[#CCD6F6] font-serif text-sm">Destination Location</Label><Input value={destinationLocation} onChange={(e) => setDestinationLocation(e.target.value)} placeholder="e.g., Los Angeles Port, USA" className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif text-sm" /></div>
                    <Button onClick={handleAiRiskAssessment} disabled={isLoadingRiskAssessment || !sourceLocation.trim() || !destinationLocation.trim()} className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#0A192F] font-serif font-semibold text-sm py-2"><Sparkles className="w-4 h-4 mr-2" />{isLoadingRiskAssessment ? 'Analyzing...' : 'Ask AI for Risk Assessment'}</Button>
                  </div>
                  {aiRiskAssessment && (
                      <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#D4AF37]/30 transition-all duration-500">
                        <Badge className="bg-[#D4AF37] text-[#0A192F] font-semibold mb-2 text-xs"><Sparkles className="w-3 h-3 mr-1" />AI Assessment</Badge>
                        <p className="text-xs text-[#CCD6F6]/90 font-serif mb-3 italic">"{aiRiskAssessment.summary}"</p>
                        <Separator className="bg-[#D4AF37]/20 my-3" />
                        <div className="space-y-2">
                          {aiRiskAssessment.probabilities.map((p) => (
                              <div key={p.threshold} className="flex justify-between items-center font-serif text-sm"><span className="text-[#CCD6F6]">{`Prob. of > ${p.threshold}${aiRiskAssessment.type === 'delay' ? 'h delay' : '% damage'}:`}</span><span className="text-lg font-semibold text-[#64FFDA]">{(p.probability * 100).toFixed(1)}%</span></div>
                          ))}
                        </div>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Policy Builder Column */}
            <div className="lg:col-span-2 page-enter-stagger" style={{ animationDelay: '0.4s' }}>
              <Card className="maritime-card maritime-card-glow">
                <CardHeader><CardTitle className="text-[#FFFFFF] font-serif font-medium">Build Your Policy</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {!isConnected && (<div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 rounded-lg p-4"><p className="text-[#FF6B6B] font-serif text-sm">Please connect your wallet to create insurance policies</p></div>)}
                  <div className="space-y-3">
                    <Label className="text-[#CCD6F6] font-serif">Policy Type</Label>
                    <RadioGroup value={policyType} onValueChange={(value: 'shipper' | 'carrier') => setPolicyType(value)} className="flex gap-6" disabled={isProcessing || !isConnected}>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="shipper" id="shipper" className="border-[#D4AF37] text-[#D4AF37]" /><Label htmlFor="shipper" className="text-[#CCD6F6] font-serif cursor-pointer">Delay Protection</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="carrier" id="carrier" className="border-[#D4AF37] text-[#D4AF37]" /><Label htmlFor="carrier" className="text-[#CCD6F6] font-serif cursor-pointer">Cargo Damage Protection</Label></div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2"><Label className="text-[#CCD6F6] font-serif">Policy Name</Label><Input value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder={policyType === 'shipper' ? "e.g., Shanghai-LA Delay Shield" : "e.g., Container Damage Guard"} className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif" disabled={isProcessing || !isConnected}/></div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2"><Checkbox id="force-majeure" checked={includeForceMajeure} onCheckedChange={(checked) => setIncludeForceMajeure(checked as boolean)} className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-[#0A192F]" disabled={isProcessing || !isConnected} /><Label htmlFor="force-majeure" className="text-[#CCD6F6] font-serif cursor-pointer">Include Act of God/Force Majeure Protection</Label></div>
                    <p className="text-xs text-[#CCD6F6]/70 font-serif ml-6">Covers {policyType === 'shipper' ? 'delays' : 'damage'} caused by natural disasters, extreme weather, etc.</p>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[#CCD6F6] font-serif">Trigger Condition</Label>
                    <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
                      {policyType === 'shipper' ? (
                          <>
                            <p className="text-[#FFFFFF] mb-4 font-serif">If shipment is delayed more than <span className="text-[#D4AF37] font-semibold">{delayThreshold[0]} hours</span></p>
                            <Slider value={delayThreshold} onValueChange={setDelayThreshold} max={168} min={12} step={12} className="w-full" disabled={isProcessing || !isConnected} />
                            <div className="flex justify-between text-xs text-[#CCD6F6]/70 mt-2 font-serif"><span>12h</span><span>168h (7 days)</span></div>
                          </>
                      ) : (
                          <>
                            <p className="text-[#FFFFFF] mb-4 font-serif">If cargo damage exceeds <span className="text-[#D4AF37] font-semibold">{damageThreshold[0]}%</span></p>
                            <Slider value={damageThreshold} onValueChange={setDamageThreshold} max={100} min={5} step={5} className="w-full" disabled={isProcessing || !isConnected} />
                            <div className="flex justify-between text-xs text-[#CCD6F6]/70 mt-2 font-serif"><span>5%</span><span>100%</span></div>
                          </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2"><Label className="text-[#CCD6F6] font-serif">Payout Amount (ETH)</Label><Input type="number" step="0.1" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif" disabled={isProcessing || !isConnected}/></div>
                  <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
                    <div className="flex justify-between items-center mb-2"><span className="text-[#CCD6F6] font-serif">Premium Required:</span><span className="text-[#D4AF37] font-semibold text-lg">{calculatedPremium.toFixed(4)} ETH</span></div>
                    <div className="text-xs text-[#CCD6F6]/70 font-serif space-y-1">
                      <p>Base premium: {(parseFloat(payoutAmount) * (policyType === 'shipper' ? 0.05 : 0.08)).toFixed(4)} ETH</p>
                      {includeForceMajeure && (<p>Force Majeure surcharge: +{(parseFloat(payoutAmount) * (policyType === 'shipper' ? 0.05 : 0.08) * 0.2).toFixed(4)} ETH</p>)}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" /><p className="text-[#FF6B6B] font-serif text-sm">This will create a parametric policy that you can apply to your shipments.</p>
                  </div>
                  <Button onClick={handleMintPolicy} disabled={!policyName || isProcessing || !isConnected} className="w-full golden-button maritime-button font-serif font-semibold py-3 text-lg">
                    {isProcessing ? (isMintingPending ? 'Waiting for signature...' : isMintingTxLoading ? 'Minting NFT...' : 'Saving to database...') : 'Create & Mint Policy NFT'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ContractBuilder;
