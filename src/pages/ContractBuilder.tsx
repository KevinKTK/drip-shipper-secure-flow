import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Database, Shield, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const ContractBuilder = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isConnected, address } = useAuth();
  const queryClient = useQueryClient();
  const orderId = searchParams.get('orderId');

  const [policyType, setPolicyType] = useState<'shipper' | 'carrier'>('shipper');
  const [delayThreshold, setDelayThreshold] = useState([48]);
  const [damageThreshold, setDamageThreshold] = useState([10]);
  const [payoutAmount, setPayoutAmount] = useState(1000);
  const [policyName, setPolicyName] = useState('');

  // Calculate premium based on policy type
  const premium = policyType === 'shipper' 
    ? Math.round(payoutAmount * 0.05) 
    : Math.round(payoutAmount * 0.08); // Higher premium for cargo damage

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: any) => {
      const { data, error } = await supabase
        .from('user_insurance_policies')
        .insert([policyData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Insurance Policy Created!",
        description: `Policy "${policyName}" has been saved and is now available for your shipments.`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-insurance-policies'] });
      queryClient.invalidateQueries({ queryKey: ['insurance-policies'] });
      
      // Reset form
      setPolicyName('');
      setDelayThreshold([48]);
      setDamageThreshold([10]);
      setPayoutAmount(1000);
      setPolicyType('shipper');
    },
    onError: (error: any) => {
      console.error('Policy creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create insurance policy",
        variant: "destructive",
      });
    },
  });

  const handleMintPolicy = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create insurance policies",
        variant: "destructive",
      });
      return;
    }

    if (!policyName.trim()) {
      toast({
        title: "Policy Name Required",
        description: "Please enter a name for your insurance policy",
        variant: "destructive",
      });
      return;
    }

    const basePolicyData = {
      wallet_address: address,
      policy_name: policyName,
      policy_type: policyType,
      payout_amount_eth: payoutAmount,
      premium_eth: premium,
      is_active: true,
      user_id: null,
    };

    let policyData;
    if (policyType === 'shipper') {
      policyData = {
        ...basePolicyData,
        description: `Parametric insurance policy covering shipment delays exceeding ${delayThreshold[0]} hours`,
        delay_threshold_hours: delayThreshold[0],
        trigger_condition: `Shipment delay exceeds ${delayThreshold[0]} hours`,
        data_source: 'PortAuthorityAPI',
        cargo_damage_threshold_percentage: null,
      };
    } else {
      policyData = {
        ...basePolicyData,
        description: `Parametric insurance policy covering cargo damage exceeding ${damageThreshold[0]}%`,
        delay_threshold_hours: 0,
        trigger_condition: `Cargo damage exceeds ${damageThreshold[0]}%`,
        data_source: 'CargoInspectionAPI',
        cargo_damage_threshold_percentage: damageThreshold[0],
      };
    }

    createPolicyMutation.mutate(policyData);
  };

  const getRiskData = () => {
    if (policyType === 'shipper') {
      return [
        { label: '24h delay', probability: '12%' },
        { label: '48h delay', probability: '7%' },
        { label: '72h delay', probability: '3%' },
      ];
    } else {
      return [
        { label: '5% damage', probability: '8%' },
        { label: '10% damage', probability: '4%' },
        { label: '15% damage', probability: '2%' },
      ];
    }
  };

  const getOracleInfo = () => {
    if (policyType === 'shipper') {
      return {
        name: 'PortAuthorityAPI',
        description: 'Delay verification powered by real-time port authority data'
      };
    } else {
      return {
        name: 'CargoInspectionAPI',
        description: 'Damage assessment via certified cargo inspection reports'
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-semibold text-[#FFFFFF] mb-2">Parametric Insurance Builder</h1>
          <p className="text-[#CCD6F6] font-serif">Create smart insurance policies for your shipping operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Simulator */}
          <div className="page-enter-stagger" style={{ animationDelay: '0.2s' }}>
            <Card className="maritime-card maritime-card-glow">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-[#CCD6F6] font-serif">
                  <p className="text-sm mb-3">
                    Historical {policyType === 'shipper' ? 'delay' : 'damage'} probability for this route:
                  </p>
                  <div className="space-y-2">
                    {getRiskData().map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.label}</span>
                        <span className="text-[#D4AF37]">{item.probability}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#CCD6F6]/20">
                  <Badge className="bg-[#64FFDA] text-[#0A192F] font-semibold mb-2">
                    <Database className="w-3 h-3 mr-1" />
                    Oracle: {getOracleInfo().name}
                  </Badge>
                  <p className="text-xs text-[#CCD6F6]/70">
                    {getOracleInfo().description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Builder */}
          <div className="lg:col-span-2 page-enter-stagger" style={{ animationDelay: '0.4s' }}>
            <Card className="maritime-card maritime-card-glow">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] font-serif font-medium">
                  Build Your Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected && (
                  <div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 rounded-lg p-4">
                    <p className="text-[#FF6B6B] font-serif text-sm">
                      Please connect your wallet to create insurance policies
                    </p>
                  </div>
                )}

                {/* Policy Type Selection */}
                <div className="space-y-3">
                  <Label className="text-[#CCD6F6] font-serif">Policy Type</Label>
                  <RadioGroup
                    value={policyType}
                    onValueChange={(value: 'shipper' | 'carrier') => setPolicyType(value)}
                    className="flex gap-6"
                    disabled={createPolicyMutation.isPending || !isConnected}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shipper" id="shipper" className="border-[#D4AF37] text-[#D4AF37]" />
                      <Label htmlFor="shipper" className="text-[#CCD6F6] font-serif cursor-pointer">
                        Shipper (Delay Protection)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="carrier" id="carrier" className="border-[#D4AF37] text-[#D4AF37]" />
                      <Label htmlFor="carrier" className="text-[#CCD6F6] font-serif cursor-pointer">
                        Carrier (Cargo Damage Protection)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Policy Name */}
                <div className="space-y-2">
                  <Label className="text-[#CCD6F6] font-serif">Policy Name</Label>
                  <Input
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    placeholder={policyType === 'shipper' ? "e.g., Shanghai-LA Delay Protection" : "e.g., Container Damage Shield"}
                    className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                    disabled={createPolicyMutation.isPending || !isConnected}
                  />
                </div>

                {/* Trigger Condition */}
                <div className="space-y-4">
                  <Label className="text-[#CCD6F6] font-serif">Trigger Condition</Label>
                  <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
                    {policyType === 'shipper' ? (
                      <>
                        <p className="text-[#FFFFFF] mb-4 font-serif">
                          If shipment is delayed more than <span className="text-[#D4AF37] font-semibold">{delayThreshold[0]} hours</span>
                        </p>
                        <Slider
                          value={delayThreshold}
                          onValueChange={setDelayThreshold}
                          max={168}
                          min={12}
                          step={12}
                          className="w-full"
                          disabled={createPolicyMutation.isPending || !isConnected}
                        />
                        <div className="flex justify-between text-xs text-[#CCD6F6]/70 mt-2 font-serif">
                          <span>12h</span>
                          <span>168h (7 days)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[#FFFFFF] mb-4 font-serif">
                          If cargo damage exceeds <span className="text-[#D4AF37] font-semibold">{damageThreshold[0]}%</span>
                        </p>
                        <Slider
                          value={damageThreshold}
                          onValueChange={setDamageThreshold}
                          max={100}
                          min={5}
                          step={5}
                          className="w-full"
                          disabled={createPolicyMutation.isPending || !isConnected}
                        />
                        <div className="flex justify-between text-xs text-[#CCD6F6]/70 mt-2 font-serif">
                          <span>5%</span>
                          <span>100%</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Payout Amount */}
                <div className="space-y-2">
                  <Label className="text-[#CCD6F6] font-serif">Payout Amount (ETH)</Label>
                  <Input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif"
                    disabled={createPolicyMutation.isPending || !isConnected}
                  />
                </div>

                {/* Premium Calculation */}
                <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#CCD6F6] font-serif">Premium Required:</span>
                    <span className="text-[#D4AF37] font-semibold text-lg">{premium} ETH</span>
                  </div>
                  <p className="text-xs text-[#CCD6F6]/70 font-serif">
                    Premium calculated based on {policyType} risk assessment and payout amount
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
                  <div>
                    <p className="text-[#FF6B6B] font-serif text-sm">
                      This will create a parametric {policyType} insurance policy that you can apply to any of your shipments.
                    </p>
                  </div>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleMintPolicy}
                  disabled={!policyName || createPolicyMutation.isPending || !isConnected}
                  className="w-full golden-button maritime-button font-serif font-semibold py-3 text-lg"
                >
                  {createPolicyMutation.isPending ? 'Creating Policy...' : 'Create Insurance Policy'}
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
