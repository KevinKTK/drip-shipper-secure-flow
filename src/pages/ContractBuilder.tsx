
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
    <div className="min-h-screen bg-[#F8F6F0] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-semibold text-[#1B365D] mb-2">Parametric Insurance Builder</h1>
          <p className="text-[#8B755D] font-serif">Create smart insurance policies for your shipping NFTs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Simulator */}
          <Card className="navy-card">
            <CardHeader>
              <CardTitle className="text-white font-serif font-medium">
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80 font-serif">
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
              
              <div className="pt-4 border-t border-white/20">
                <Badge className="bg-[#D4AF37] text-[#1B365D] font-semibold mb-2">
                  <Database className="w-3 h-3 mr-1" />
                  Oracle: PortAuthorityAPI
                </Badge>
                <p className="text-xs text-white/60">
                  Delay verification powered by real-time port authority data
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Builder */}
          <Card className="lg:col-span-2 navy-card">
            <CardHeader>
              <CardTitle className="text-white font-serif font-medium">
                Build Your Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Policy Name */}
              <div className="space-y-2">
                <Label className="text-white font-serif">Policy Name</Label>
                <Input
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Shanghai-LA Container Protection"
                  className="bg-[#2C4A6B] border-white/20 text-white placeholder-white/50 font-serif"
                />
              </div>

              {/* Step 2: Delay Threshold */}
              <div className="space-y-4">
                <Label className="text-white font-serif">Trigger Condition</Label>
                <div className="bg-[#2C4A6B] p-4 rounded-lg border border-white/20">
                  <p className="text-white mb-4 font-serif">
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
                  <div className="flex justify-between text-xs text-white/60 mt-2 font-serif">
                    <span>12h</span>
                    <span>168h (7 days)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Payout Amount */}
              <div className="space-y-2">
                <Label className="text-white font-serif">Payout Amount (INK)</Label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="bg-[#2C4A6B] border-white/20 text-white font-serif"
                />
              </div>

              {/* Premium Calculation */}
              <div className="bg-[#2C4A6B] p-4 rounded-lg border border-white/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-serif">Premium Required:</span>
                  <span className="text-[#D4AF37] font-semibold text-lg">{premium} INK</span>
                </div>
                <p className="text-xs text-white/60 font-serif">
                  Premium calculated based on risk assessment and payout amount
                </p>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-serif text-sm">
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
