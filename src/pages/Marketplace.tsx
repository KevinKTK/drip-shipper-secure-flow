
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Package, Shield, Calendar, MapPin, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { SkeletonOrderCard } from '@/components/ui/maritime-skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import InsurancePolicyModal from '@/components/shipping/InsurancePolicyModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useAuth();
  const queryClient = useQueryClient();
  
  const [detailsModal, setDetailsModal] = useState<{ open: boolean, order: any | null }>({ open: false, order: null });
  const [insuranceModal, setInsuranceModal] = useState<{ open: boolean, policy: any | null, loading: boolean }>({ open: false, policy: null, loading: false });
  const [selectInsuranceModal, setSelectInsuranceModal] = useState<{ open: boolean, order: any | null }>({ open: false, order: null });
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const cargoOrders = orders?.filter(order => order.order_type === 'cargo') || [];
  const vesselOrders = orders?.filter(order => order.order_type === 'vessel') || [];

  const fetchInsurancePolicyDetails = async (order: any) => {
    setInsuranceModal({ open: false, policy: null, loading: true });
    
    try {
      let policyData = null;
      
      if (order.selected_insurance_policy_id) {
        // Fetch from insurance_templates table
        const { data, error } = await supabase
          .from('insurance_templates')
          .select('*')
          .eq('id', order.selected_insurance_policy_id)
          .single();
        
        if (error) throw error;
        policyData = { ...data, isTemplate: true };
      } else if (order.user_insurance_policy_id) {
        // Fetch from user_insurance_policies table
        const { data, error } = await supabase
          .from('user_insurance_policies')
          .select('*')
          .eq('id', order.user_insurance_policy_id)
          .single();
        
        if (error) throw error;
        policyData = { ...data, isTemplate: false };
      }
      
      if (policyData) {
        setInsuranceModal({ open: true, policy: policyData, loading: false });
      } else {
        toast({
          title: "Error",
          description: "Insurance policy details not found",
          variant: "destructive",
        });
        setInsuranceModal({ open: false, policy: null, loading: false });
      }
    } catch (error: any) {
      console.error('Error fetching insurance policy:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance policy details",
        variant: "destructive",
      });
      setInsuranceModal({ open: false, policy: null, loading: false });
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="maritime-card maritime-card-glow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            {order.order_type === 'cargo' ? <Package className="w-5 h-5 text-[#D4AF37]" /> : <Ship className="w-5 h-5 text-[#D4AF37]" />}
            {order.title}
          </CardTitle>
          {order.is_insured && (
            <button
              type="button"
              className="focus:outline-none"
              onClick={() => fetchInsurancePolicyDetails(order)}
              title="View Insurance Policy Details"
            >
              <Badge className="bg-[#64FFDA] text-[#0A192F] font-medium cursor-pointer hover:underline">
                <Shield className="w-3 h-3 mr-1" />
                Insured
              </Badge>
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <MapPin className="w-4 h-4" />
          <span className="font-serif text-sm">{order.origin_port} → {order.destination_port}</span>
        </div>
        
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <Calendar className="w-4 h-4" />
          <span className="font-serif text-sm">Departure: {new Date(order.departure_date).toLocaleDateString()}</span>
        </div>

        {order.cargo_type && (
          <Badge variant="outline" className="border-[#CCD6F6]/30 text-[#CCD6F6]">
            {order.cargo_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        {order.vessel_type && (
          <Badge variant="outline" className="border-[#CCD6F6]/30 text-[#CCD6F6]">
            {order.vessel_type.replace('_', ' ').toUpperCase()}
          </Badge>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-[#CCD6F6]/20">
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-medium">{order.price_ink} ETH</span>
          </div>
          {order.nft_token_id && (
            <span className="text-xs text-[#CCD6F6]/70">NFT #{order.nft_token_id}</span>
          )}
        </div>
        
        {/* Mandatory Platform Protection Footer */}
        <div className="bg-[#D4AF37]/10 p-3 rounded-lg border border-[#D4AF37]/30 mt-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#D4AF37] font-serif font-medium text-sm">Automated Delay Penalties Active</span>
          </div>
          <p className="text-xs text-[#CCD6F6] text-center mt-1 font-serif">
            10% refund per 24h delay • Built-in protection
          </p>
        </div>
        
        {order.nft_token_id && order.nft_contract_address && (
          <a
            href={`https://explorer-sepolia.inkonchain.com/token/${order.nft_contract_address}/instance/${order.nft_token_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 w-full"
          >
            <Button
              variant="outline"
              className="w-full maritime-button bg-[#1E3A5F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] border border-[#D4AF37]/50 font-serif"
            >
              See NFT contract (ink-scan)
            </Button>
          </a>
        )}

        {!order.is_insured && (
          <div className="space-y-2">
            <Button 
              className="w-full maritime-button bg-[#64FFDA]/20 hover:bg-[#64FFDA] hover:text-[#0A192F] text-[#64FFDA] font-serif border border-[#64FFDA]/30"
              onClick={() => setSelectInsuranceModal({ open: true, order })}
              disabled={!isConnected}
            >
              <Shield className="w-4 h-4 mr-2" />
              Select Insurance Policy
            </Button>
            <Button 
              className="w-full maritime-button bg-[#CCD6F6]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] font-serif border border-[#CCD6F6]/30"
              onClick={() => navigate(`/contract-builder?orderId=${order.id}`)}
            >
              Create Custom Policy
            </Button>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full maritime-button bg-[#1E3A5F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] border border-[#D4AF37]/50 font-serif mt-2"
          onClick={() => setDetailsModal({ open: true, order })}
        >
          See Details
        </Button>
      </CardContent>
    </Card>
  );

  const SkeletonGrid = ({ count }: { count: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonOrderCard key={index} />
      ))}
    </div>
  );

  const applyInsuranceMutation = useMutation({
    mutationFn: async ({ orderId, policy }: { orderId: string, policy: any }) => {
      const updateData: any = {
        is_insured: true,
        updated_at: new Date().toISOString()
      };

      // Link to the appropriate policy based on whether it's a template or custom policy
      if (policy.isTemplate) {
        updateData.selected_insurance_policy_id = policy.id;
      } else {
        updateData.user_insurance_policy_id = policy.id;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Insurance Applied!",
        description: `Insurance policy "${variables.policy.policy_name}" has been applied to this order.`,
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectInsuranceModal({ open: false, order: null });
    },
    onError: (error: any) => {
      console.error('Apply insurance error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply insurance policy",
        variant: "destructive",
      });
    },
  });

  const handleApplyInsurance = (policy: any) => {
    if (!selectInsuranceModal.order) return;
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to apply insurance policies",
        variant: "destructive",
      });
      return;
    }

    applyInsuranceMutation.mutate({
      orderId: selectInsuranceModal.order.id,
      policy
    });
  };

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">Maritime Marketplace</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Discover shipping opportunities with built-in delay penalty protection</p>
        </div>

        <div className="page-enter" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="cargo" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1E3A5F] border border-[#D4AF37]/30">
              <TabsTrigger 
                value="cargo" 
                className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
              >
                Available Shipments ({isLoading ? '...' : cargoOrders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="vessel" 
                className="maritime-nav-glow data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A192F] text-[#CCD6F6] font-serif"
              >
                Available Vessels ({isLoading ? '...' : vesselOrders.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cargo" className="mt-6">
              {isLoading ? (
                <SkeletonGrid count={6} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cargoOrders.map((order, index) => (
                    <div key={order.id} className="page-enter-stagger" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                      <OrderCard order={order} />
                    </div>
                  ))}
                  {cargoOrders.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                      <p className="text-[#CCD6F6] font-serif">No cargo shipments available</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="vessel" className="mt-6">
              {isLoading ? (
                <SkeletonGrid count={6} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vesselOrders.map((order, index) => (
                    <div key={order.id} className="page-enter-stagger" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                      <OrderCard order={order} />
                    </div>
                  ))}
                  {vesselOrders.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Ship className="w-16 h-16 text-[#CCD6F6]/50 mx-auto mb-4" />
                      <p className="text-[#CCD6F6] font-serif">No vessels available</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={detailsModal.open} onOpenChange={open => setDetailsModal({ open, order: open ? detailsModal.order : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Metadata Details</DialogTitle>
            <DialogDescription>
              Below are the input values for this {detailsModal.order?.order_type === 'cargo' ? 'Shipping Order' : 'Vessel Registration'}:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-[#CCD6F6] space-y-2">
            {detailsModal.order && (
              <>
                <div><b>Title:</b> {detailsModal.order.title}</div>
                <div><b>Description:</b> {detailsModal.order.description}</div>
                <div><b>Origin Port:</b> {detailsModal.order.origin_port}</div>
                <div><b>Destination Port:</b> {detailsModal.order.destination_port}</div>
                <div><b>Departure Date:</b> {detailsModal.order.departure_date && new Date(detailsModal.order.departure_date).toLocaleDateString()}</div>
                {detailsModal.order.order_type === 'cargo' && (
                  <>
                    <div><b>Cargo Type:</b> {detailsModal.order.cargo_type && detailsModal.order.cargo_type.replace('_', ' ').toUpperCase()}</div>
                    <div><b>Weight (tons):</b> {detailsModal.order.weight_tons}</div>
                    <div><b>Volume (CBM):</b> {detailsModal.order.volume_cbm}</div>
                    <div><b>Budget (ETH):</b> {detailsModal.order.price_eth}</div>
                  </>
                )}
                {detailsModal.order.order_type === 'vessel' && (
                  <>
                    <div><b>Vessel Type:</b> {detailsModal.order.vessel_type && detailsModal.order.vessel_type.replace('_', ' ').toUpperCase()}</div>
                    <div><b>Capacity (tons):</b> {detailsModal.order.weight_tons}</div>
                    <div><b>Price (ETH):</b> {detailsModal.order.price_eth}</div>
                    <div><b>IMO Number:</b> {detailsModal.order.imo_number}</div>
                  </>
                )}
                {/* Display penalty protection info */}
                <div className="border-t border-[#CCD6F6]/20 pt-2 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <b className="text-[#D4AF37]">Platform Protection:</b>
                  </div>
                  <div><b>Penalty Rate:</b> {detailsModal.order.penalty_rate_per_day || 10}% per day</div>
                  <div><b>Max Penalty:</b> {detailsModal.order.max_penalty_percentage || 100}%</div>
                  <div><b>Expected Delivery:</b> {detailsModal.order.expected_delivery_timestamp ? new Date(detailsModal.order.expected_delivery_timestamp).toLocaleDateString() : 'TBD'}</div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailsModal({ open: false, order: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insurance Policy Details Modal */}
      <Dialog open={insuranceModal.open || insuranceModal.loading} onOpenChange={open => {
        if (!insuranceModal.loading) {
          setInsuranceModal({ open, policy: open ? insuranceModal.policy : null, loading: false });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insurance Policy Details</DialogTitle>
            <DialogDescription>
              {insuranceModal.loading ? 'Loading insurance policy details...' : 'Below are the details of the insurance policy for this order:'}
            </DialogDescription>
          </DialogHeader>
          {insuranceModal.loading ? (
            <div className="mt-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
              <p className="text-[#CCD6F6] mt-2">Loading...</p>
            </div>
          ) : (
            <div className="mt-4 text-sm text-[#CCD6F6] space-y-2">
              {insuranceModal.policy && (
                <>
                  <div><b>Policy Name:</b> {insuranceModal.policy.policy_name}</div>
                  <div><b>Description:</b> {insuranceModal.policy.description}</div>
                  <div><b>Premium:</b> {insuranceModal.policy.premium_eth} ETH</div>
                  <div><b>Payout:</b> {insuranceModal.policy.payout_amount_eth} ETH</div>
                  <div><b>Policy Type:</b> {insuranceModal.policy.isTemplate ? 'Template Policy' : 'Custom Policy'}</div>
                  <div><b>Trigger Condition:</b> {insuranceModal.policy.trigger_condition}</div>
                  {insuranceModal.policy.delay_threshold_hours && (
                    <div><b>Delay Threshold:</b> {insuranceModal.policy.delay_threshold_hours} hours</div>
                  )}
                  <div><b>Status:</b> Active</div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setInsuranceModal({ open: false, policy: null, loading: false })} disabled={insuranceModal.loading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Insurance Policy Modal */}
      <InsurancePolicyModal
        isOpen={selectInsuranceModal.open}
        onClose={() => setSelectInsuranceModal({ open: false, order: null })}
        onSelectPolicy={handleApplyInsurance}
        policyType="shipper"
      />
    </div>
  );
};

const SkeletonGrid = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonOrderCard key={index} />
    ))}
  </div>
);

export default Marketplace;
