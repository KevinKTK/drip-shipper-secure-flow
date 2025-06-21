
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Coins, User, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InsurancePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPolicy: (policy: any) => void;
  policyType: 'shipper' | 'carrier';
}

const InsurancePolicyModal = ({ isOpen, onClose, onSelectPolicy, policyType }: InsurancePolicyModalProps) => {
  const { address } = useAuth();

  // Fetch template policies
  const { data: templatePolicies, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['insurance-templates', policyType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_templates')
        .select('*')
        .eq('policy_type', policyType)
        .eq('is_active', true)
        .order('premium_eth', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  // Fetch user's custom policies
  const { data: userPolicies, isLoading: isLoadingUserPolicies } = useQuery({
    queryKey: ['user-insurance-policies', address],
    queryFn: async () => {
      if (!address) return [];
      
      const { data, error } = await supabase
        .from('user_insurance_policies')
        .select('*')
        .eq('wallet_address', address)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!address
  });

  const isLoading = isLoadingTemplates || isLoadingUserPolicies;

  const handleSelectPolicy = (policy: any, isTemplate: boolean = true) => {
    const formattedPolicy = {
      id: policy.id,
      policy_name: policy.policy_name,
      premium_eth: policy.premium_eth,
      payout_amount_eth: policy.payout_amount_eth,
      description: policy.description,
      trigger_condition: policy.trigger_condition,
      delay_threshold_hours: policy.delay_threshold_hours,
      isTemplate,
    };
    onSelectPolicy(formattedPolicy);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden bg-[#0A192F] border border-[#D4AF37]/30">
        <DialogHeader>
          <DialogTitle className="text-[#FFFFFF] font-serif font-medium text-2xl">
            Select an Insurance Policy
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {isLoading ? (
            <div className="text-center py-8 text-[#CCD6F6]">Loading policies...</div>
          ) : (
            <div className="space-y-6">
              {/* User's Custom Policies */}
              {userPolicies && userPolicies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-[#64FFDA]" />
                    <h3 className="text-[#64FFDA] font-serif font-medium text-lg">Your Custom Policies</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPolicies.map((policy) => (
                      <Card key={policy.id} className="maritime-card maritime-card-glow cursor-pointer hover:scale-105 transition-transform">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-[#FFFFFF] font-serif font-medium text-lg">
                              {policy.policy_name}
                            </CardTitle>
                            <Badge className="bg-[#64FFDA] text-[#0A192F] font-medium">
                              <User className="w-3 h-3 mr-1" />
                              Custom
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-[#CCD6F6] font-serif text-sm">{policy.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#CCD6F6] text-sm font-serif">Premium:</span>
                              <span className="text-[#D4AF37] font-medium flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                {policy.premium_eth} ETH
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#CCD6F6] text-sm font-serif">Payout:</span>
                              <span className="text-[#64FFDA] font-medium flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                {policy.payout_amount_eth} ETH
                              </span>
                            </div>
                            {policy.delay_threshold_hours && (
                              <div className="flex justify-between items-center">
                                <span className="text-[#CCD6F6] text-sm font-serif">Threshold:</span>
                                <span className="text-[#CCD6F6] font-medium flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {policy.delay_threshold_hours}h delay
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-[#CCD6F6]/20 pt-4">
                            <div className="text-xs text-[#CCD6F6]/70 mb-3 font-serif">
                              Trigger: {policy.trigger_condition}
                            </div>
                            <Button
                              onClick={() => handleSelectPolicy(policy, false)}
                              className="w-full maritime-button bg-[#64FFDA] hover:bg-[#4DD0E1] text-[#0A192F] font-serif"
                            >
                              Select This Policy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Policies */}
              {templatePolicies && templatePolicies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-[#D4AF37] font-serif font-medium text-lg">Standard Policies</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templatePolicies.map((policy) => (
                      <Card key={policy.id} className="maritime-card maritime-card-glow cursor-pointer hover:scale-105 transition-transform">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-[#FFFFFF] font-serif font-medium text-lg">
                              {policy.policy_name}
                            </CardTitle>
                            <Badge className="bg-[#D4AF37] text-[#0A192F] font-medium">
                              <Shield className="w-3 h-3 mr-1" />
                              Template
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-[#CCD6F6] font-serif text-sm">{policy.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#CCD6F6] text-sm font-serif">Premium:</span>
                              <span className="text-[#D4AF37] font-medium flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                {policy.premium_eth} ETH
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[#CCD6F6] text-sm font-serif">Payout:</span>
                              <span className="text-[#64FFDA] font-medium flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                {policy.payout_amount_eth} ETH
                              </span>
                            </div>
                            {policy.delay_threshold_hours && (
                              <div className="flex justify-between items-center">
                                <span className="text-[#CCD6F6] text-sm font-serif">Threshold:</span>
                                <span className="text-[#CCD6F6] font-medium flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {policy.delay_threshold_hours}h delay
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-[#CCD6F6]/20 pt-4">
                            <div className="text-xs text-[#CCD6F6]/70 mb-3 font-serif">
                              Trigger: {policy.trigger_condition}
                            </div>
                            <Button
                              onClick={() => handleSelectPolicy(policy, true)}
                              className="w-full maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif"
                            >
                              Select This Policy
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No policies available */}
              {(!templatePolicies || templatePolicies.length === 0) && (!userPolicies || userPolicies.length === 0) && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                  <p className="text-[#CCD6F6] font-serif">No insurance policies available</p>
                  <p className="text-[#CCD6F6]/70 font-serif text-sm mt-2">
                    Create custom policies using the Contract Builder
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsurancePolicyModal;
