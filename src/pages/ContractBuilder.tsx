
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

const ContractBuilder = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const orderId = searchParams.get('orderId');

  const [delayThreshold, setDelayThreshold] = useState([48]);
  const [payoutAmount, setPayoutAmount] = useState(1000);
  const [policyName, setPolicyName] = useState('');

  // Calculate premium (simplified formula for demo)
  const premium = Math.round(payoutAmount * 0.05);

  const handleMintPolicy = () => {
    toast({
      title: "Insurance Policy Created!",
      description: `Policy "${policyName}" has been minted as an NFT and attached to your shipment.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-semibold text-[#FFFFFF] mb-2">Parametric Insurance Builder</h1>
          <p className="text-[#CCD6F6] font-serif">Create smart insurance policies for your shipping NFTs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Simulator */}
          <Card className="maritime-card">
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

          {/* Policy Builder */}
          <Card className="lg:col-span-2 maritime-card">
            <CardHeader>
              <CardTitle className="text-[#FFFFFF] font-serif font-medium">
                Build Your Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Policy Name */}
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Policy Name</Label>
                <Input
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Shanghai-LA Container Protection"
                  className="bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
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
                  />
                  <div className="flex justify-between text-xs text-[#CCD6F6]/70 mt-2 font-serif">
                    <span>12h</span>
                    <span>168h (7 days)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Payout Amount */}
              <div className="space-y-2">
                <Label className="text-[#CCD6F6] font-serif">Payout Amount (INK)</Label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif"
                />
              </div>

              {/* Premium Calculation */}
              <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#CCD6F6]/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#CCD6F6] font-serif">Premium Required:</span>
                  <span className="text-[#D4AF37] font-semibold text-lg">{premium} INK</span>
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
                    Once minted, this policy cannot be modified. Please review all parameters carefully.
                  </p>
                </div>
              </div>

              {/* Mint Button */}
              <Button
                onClick={handleMintPolicy}
                disabled={!policyName}
                className="w-full golden-button font-serif font-semibold py-3 text-lg"
              >
                Mint Insurance Policy NFT
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractBuilder;
