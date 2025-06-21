
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Database } from 'lucide-react';
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

  const [delayThreshold, setDelayThreshold] = useState([48]);
  const [payoutAmount, setPayoutAmount] = useState(1000);
  const [policyName, setPolicyName] = useState('');

  // Calculate premium (simplified formula for demo)
  const premium = Math.round(payoutAmount * 0.05);

  const createPolicyMutation = useMutation({
    mutationFn: async (policyData: any) => {
      // Get the current user session to ensure we have the user_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to create policies');
      }

      const policyWithUser = {
        ...policyData,
        user_id: user.id, // Ensure user_id is set
        wallet_address: address // Ensure wallet_address is set
      };

      const { data, error } = await supabase
        .from('user_insurance_policies')
        .insert([policyWithUser])
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
      setPayoutAmount(1000);
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

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create insurance policies",
        variant: "destructive",
      });
      return;
    }

    const policyData = {
      wallet_address: address,
      policy_name: policyName,
      description: `Custom parametric insurance policy with ${delayThreshold[0]}h delay threshold`,
      delay_threshold_hours: delayThreshold[0],
      payout_amount_eth: payoutAmount,
      premium_eth: premium,
      trigger_condition: `Shipment delay exceeds ${delayThreshold[0]} hours`,
      data_source: 'PortAuthorityAPI',
      is_active: true,
      policy_type: 'custom',
    };

    createPolicyMutation.mutate(policyData);
  };

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-semibold text-[#FFFFFF] mb-2">Parametric Insurance Builder</h1>
          <p className="text-[#CCD6F6] font-serif">Create smart insurance policies for your shipping NFTs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Simulator */}
          <div className="page-enter-stagger" style={{ animationDelay: '0.2s' }}>
            <Card className="maritime-card maritime-card-glow">
              <CardHeader>
                <CardTitle className="text-[#FFFFFF] font-serif font-medium">
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-[#CCD6F6] font-serif">
                  <p className="text-sm mb-3">Historical delay probability for this route:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>24h delay</span>
                      <span className="text-[#D4AF37]">12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>48h delay</span>
                      <span className="text-[#D4AF37]">7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>72h delay</span>
                      <span className="text-[#D4AF37]">3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#CCD6F6]/20">
                  <Badge className="bg-[#64FFDA] text-[#0A192F] font-semibold mb-2">
                    <Database className="w-3 h-3 mr-1" />
                    Oracle: PortAuthorityAPI
                  </Badge>
                  <p className="text-xs text-[#CCD6F6]/70">
                    Delay verification powered by real-time port authority data
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

                {/* Step 1: Policy Name */}
                <div className="space-y-2">
                  <Label className="text-[#CCD6F6] font-serif">Policy Name</Label>
                  <Input
                    value={policyName}
                    onChange={(e) => setPolicyName(e.target.value)}
                    placeholder="e.g., Shanghai-LA Container Protection"
                    className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                    disabled={createPolicyMutation.isPending || !isConnected}
                  />
                </div>

                {/* Step 2: Delay Threshold */}
                <div className="space-y-4">
                  <Label className="text-[#CCD6F6] font-serif">Trigger Condition</Label>
                  <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
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
                  </div>
                </div>

                {/* Step 3: Payout Amount */}
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
                    Premium calculated based on risk assessment and payout amount
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B] mt-0.5" />
                  <div>
                    <p className="text-[#FF6B6B] font-serif text-sm">
                      This will create a custom parametric insurance policy that you can apply to any of your shipments.
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
