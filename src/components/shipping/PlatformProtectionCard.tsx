
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PlatformProtectionCard = () => {
  return (
    <Card className="maritime-card border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/10 to-[#1E3A5F]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#0A192F]" />
          </div>
          Platform Protection Guarantee
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-[#CCD6F6] font-serif text-sm leading-relaxed">
          Every Drip$hippa contract includes our <span className="text-[#D4AF37] font-medium">Automated Delay Penalty</span>. 
          A 10% partial refund of the total freight cost will be automatically issued to you for each 24-hour period of delay.
        </p>
        <p className="text-[#CCD6F6] font-serif text-sm leading-relaxed">
          This amount is deducted directly from the Carrier's final payout - no additional fees required.
        </p>
        <div className="bg-[#1E3A5F]/60 p-3 rounded-lg border border-[#D4AF37]/20">
          <div className="text-xs text-[#D4AF37] font-serif space-y-1">
            <div className="flex justify-between">
              <span>Penalty Rate:</span>
              <span className="font-medium">10% per 24h delay</span>
            </div>
            <div className="flex justify-between">
              <span>Maximum Penalty:</span>
              <span className="font-medium">100% of freight cost</span>
            </div>
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="font-medium text-[#64FFDA]">Mandatory on all orders</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformProtectionCard;
