
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, TrendingUp, Sparkles, Shield } from 'lucide-react';
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
  const [includeForceMajeure, setIncludeForceMajeure] = useState(false);
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [aiRiskAssessment, setAiRiskAssessment] = useState<string>('');
  const [isLoadingRiskAssessment, setIsLoadingRiskAssessment] = useState(false);

  const basePremium = policyType === 'shipper' 
    ? Math.round(payoutAmount * 0.05) 
    : Math.round(payoutAmount * 0.08);
  
  const premium = includeForceMajeure 
    ? Math.round(basePremium * 1.2) // 20% increase for force majeure coverage
    : basePremium;

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
      setIncludeForceMajeure(false);
      setSourceLocation('');
      setDestinationLocation('');
      setAiRiskAssessment('');
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
      const baseDescription = `Parametric insurance policy covering shipment delays exceeding ${delayThreshold[0]} hours`;
      const description = includeForceMajeure 
        ? `${baseDescription}. Includes coverage for delays caused by Act of God/Force Majeure events.`
        : baseDescription;
      
      const baseTrigger = `Shipment delay exceeds ${delayThreshold[0]} hours`;
      const triggerCondition = includeForceMajeure 
        ? `${baseTrigger} OR Force Majeure event causes shipment disruption`
        : baseTrigger;

      policyData = {
        ...basePolicyData,
        description,
        delay_threshold_hours: delayThreshold[0],
        trigger_condition: triggerCondition,
        data_source: includeForceMajeure ? 'PortAuthorityAPI + WeatherAPI + DisasterAPI' : 'PortAuthorityAPI',
        cargo_damage_threshold_percentage: null,
      };
    } else {
      const baseDescription = `Parametric insurance policy covering cargo damage exceeding ${damageThreshold[0]}%`;
      const description = includeForceMajeure 
        ? `${baseDescription}. Includes coverage for damage caused by Act of God/Force Majeure events.`
        : baseDescription;
      
      const baseTrigger = `Cargo damage exceeds ${damageThreshold[0]}%`;
      const triggerCondition = includeForceMajeure 
        ? `${baseTrigger} OR Force Majeure event causes cargo damage`
        : baseTrigger;

      policyData = {
        ...basePolicyData,
        description,
        delay_threshold_hours: 0,
        trigger_condition: triggerCondition,
        data_source: includeForceMajeure ? 'CargoInspectionAPI + WeatherAPI + DisasterAPI' : 'CargoInspectionAPI',
        cargo_damage_threshold_percentage: damageThreshold[0],
      };
    }

    createPolicyMutation.mutate(policyData);
  };

  const handleAiRiskAssessment = async () => {
    if (!sourceLocation.trim() || !destinationLocation.trim()) {
      toast({
        title: "Route Information Required",
        description: "Please enter both source and destination locations",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingRiskAssessment(true);
    try {
      // Mock AI risk assessment for now
      // In a real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRiskAssessment = policyType === 'shipper' 
        ? `Route analysis for ${sourceLocation} to ${destinationLocation}:\n\n• Average delays: 15% of shipments experience >24h delays\n• Weather impact: Moderate seasonal risk\n• Port congestion: Low-medium risk\n• Recommended threshold: 48-72 hours`
        : `Cargo risk analysis for ${sourceLocation} to ${destinationLocation}:\n\n• Historical damage rate: 3-5% minor damage\n• Route conditions: Standard maritime risks\n• Handling quality: Good port facilities\n• Recommended threshold: 10-15% damage`;
      
      setAiRiskAssessment(mockRiskAssessment);
      
      toast({
        title: "Risk Assessment Complete",
        description: "AI analysis has been generated for your route",
      });
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: "Could not generate risk assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRiskAssessment(false);
    }
  };

  const getRiskData = () => {
    if (policyType === 'shipper') {
      const baseRisks = [
        { label: '24h delay', probability: '12%' },
        { label: '48h delay', probability: '7%' },
        { label: '72h delay', probability: '3%' },
      ];
      
      if (includeForceMajeure) {
        return [
          ...baseRisks,
          { label: 'Force Majeure delay', probability: '2%' },
        ];
      }
      return baseRisks;
    } else {
      const baseRisks = [
        { label: '5% damage', probability: '8%' },
        { label: '10% damage', probability: '4%' },
        { label: '15% damage', probability: '2%' },
      ];
      
      if (includeForceMajeure) {
        return [
          ...baseRisks,
          { label: 'Force Majeure damage', probability: '1.5%' },
        ];
      }
      return baseRisks;
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
                {/* Policy Type Display */}
                <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#D4AF37]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[#CCD6F6] font-serif text-sm">Current Policy Type</span>
                  </div>
                  <Badge className={`${
                    policyType === 'shipper' 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' 
                      : 'bg-green-500/20 text-green-300 border-green-400/30'
                  } font-serif`}>
                    {policyType === 'shipper' ? 'Delay Protection' : 'Cargo Damage Protection'}
                  </Badge>
                  <p className="text-xs text-[#CCD6F6]/70 mt-2 font-serif">
                    {policyType === 'shipper' 
                      ? 'Covers shipment delays and late deliveries'
                      : 'Covers cargo damage during transportation'
                    }
                  </p>
                </div>

                {/* Route Input Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif text-sm">Source Location</Label>
                    <Input
                      value={sourceLocation}
                      onChange={(e) => setSourceLocation(e.target.value)}
                      placeholder="e.g., Shanghai Port, China"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif text-sm">Destination Location</Label>
                    <Input
                      value={destinationLocation}
                      onChange={(e) => setDestinationLocation(e.target.value)}
                      placeholder="e.g., Los Angeles Port, USA"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleAiRiskAssessment}
                    disabled={isLoadingRiskAssessment || !sourceLocation.trim() || !destinationLocation.trim()}
                    className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#0A192F] font-serif font-semibold text-sm py-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoadingRiskAssessment ? 'Analyzing...' : 'Ask AI for Risk Assessment'}
                  </Button>
                </div>

                {/* AI Risk Assessment Results */}
                {aiRiskAssessment && (
                  <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#D4AF37]/30">
                    <Badge className="bg-[#D4AF37] text-[#0A192F] font-semibold mb-2 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Assessment
                    </Badge>
                    <p className="text-xs text-[#CCD6F6] whitespace-pre-line font-serif">
                      {aiRiskAssessment}
                    </p>
                  </div>
                )}
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
                        Delay Protection
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="carrier" id="carrier" className="border-[#D4AF37] text-[#D4AF37]" />
                      <Label htmlFor="carrier" className="text-[#CCD6F6] font-serif cursor-pointer">
                        Cargo Damage Protection
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
                    placeholder={policyType === 'shipper' ? "e.g., Shanghai-LA Delay Shield" : "e.g., Container Damage Guard"}
                    className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                    disabled={createPolicyMutation.isPending || !isConnected}
                  />
                </div>

                {/* Force Majeure Coverage */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="force-majeure"
                      checked={includeForceMajeure}
                      onCheckedChange={(checked) => setIncludeForceMajeure(checked as boolean)}
                      className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-[#0A192F]"
                      disabled={createPolicyMutation.isPending || !isConnected}
                    />
                    <Label htmlFor="force-majeure" className="text-[#CCD6F6] font-serif cursor-pointer">
                      Include Act of God/Force Majeure Protection
                    </Label>
                  </div>
                  <p className="text-xs text-[#CCD6F6]/70 font-serif ml-6">
                    Covers {policyType === 'shipper' ? 'delays' : 'damage'} caused by natural disasters, extreme weather, political events, and other unforeseeable circumstances.
                  </p>
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
                  <div className="text-xs text-[#CCD6F6]/70 font-serif space-y-1">
                    <p>Base premium: {basePremium} ETH</p>
                    {includeForceMajeure && (
                      <p>Force Majeure surcharge: +{Math.round(basePremium * 0.2)} ETH (+20%)</p>
                    )}
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
                  <div>
                    <p className="text-[#FF6B6B] font-serif text-sm">
                      This will create a parametric {policyType === 'shipper' ? 'delay protection' : 'cargo damage protection'} policy that you can apply to any of your shipments.
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
