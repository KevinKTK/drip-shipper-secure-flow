
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar, Shield, Coins, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InsurancePolicyModal from './InsurancePolicyModal';

interface ShipmentForm {
  origin: string;
  destination: string;
  commodity: string;
  weight: number;
  pickupDate: string;
  deliveryDate: string;
  budget: number;
}

interface SelectedPolicy {
  id: string;
  policy_name: string;
  premium_ink: number;
}

const ShipperView = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ShipmentForm>({
    origin: '',
    destination: '',
    commodity: '',
    weight: 0,
    pickupDate: '',
    deliveryDate: '',
    budget: 1000
  });
  const [selectedPolicy, setSelectedPolicy] = useState<SelectedPolicy | null>(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ShipmentForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMintOrder = async () => {
    if (!form.origin || !form.destination || !form.commodity || !form.pickupDate || !form.deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        title: `${form.commodity} - ${form.origin} to ${form.destination}`,
        description: `Shipping ${form.weight}kg of ${form.commodity}`,
        origin_port: form.origin,
        destination_port: form.destination,
        departure_date: form.pickupDate,
        arrival_date: form.deliveryDate,
        order_type: 'cargo',
        cargo_type: 'container',
        weight_tons: Math.round(form.weight / 1000),
        price_ink: form.budget,
        is_insured: !!selectedPolicy,
        selected_insurance_policy_id: selectedPolicy?.id || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Created Successfully!",
        description: `Your shipment order #${data.id.slice(0, 8)} has been listed on the marketplace`,
      });

      // Reset form
      setForm({
        origin: '',
        destination: '',
        commodity: '',
        weight: 0,
        pickupDate: '',
        deliveryDate: '',
        budget: 1000
      });
      setSelectedPolicy(null);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = form.budget + (selectedPolicy?.premium_ink || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Form */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="floating-label-input">
              <Input
                id="origin"
                value={form.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="e.g., Port of Shanghai"
                className="maritime-input"
              />
              <Label htmlFor="origin" className="floating-label">Origin Port</Label>
            </div>
            <div className="floating-label-input">
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Port of Long Beach"
                className="maritime-input"
              />
              <Label htmlFor="destination" className="floating-label">Destination Port</Label>
            </div>
          </div>

          <div className="floating-label-input">
            <Input
              id="commodity"
              value={form.commodity}
              onChange={(e) => handleInputChange('commodity', e.target.value)}
              placeholder="e.g., 20 Tons of Grade A Coffee Beans"
              className="maritime-input"
            />
            <Label htmlFor="commodity" className="floating-label">Commodity</Label>
          </div>

          <div className="floating-label-input">
            <Input
              id="weight"
              type="number"
              value={form.weight}
              onChange={(e) => handleInputChange('weight', Number(e.target.value))}
              placeholder="Weight in kg"
              className="maritime-input"
            />
            <Label htmlFor="weight" className="floating-label">Weight (kg)</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="floating-label-input">
              <Input
                id="pickupDate"
                type="date"
                value={form.pickupDate}
                onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                className="maritime-input"
              />
              <Label htmlFor="pickupDate" className="floating-label">Pickup Date</Label>
            </div>
            <div className="floating-label-input">
              <Input
                id="deliveryDate"
                type="date"
                value={form.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                className="maritime-input"
              />
              <Label htmlFor="deliveryDate" className="floating-label">Delivery Date</Label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[#CCD6F6] font-serif">Budget (INK): {form.budget.toLocaleString()}</Label>
            <Slider
              value={[form.budget]}
              onValueChange={(value) => handleInputChange('budget', value[0])}
              max={10000}
              min={100}
              step={50}
              className="maritime-slider"
            />
          </div>
        </CardContent>
      </Card>

      {/* Right Column - Summary */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium">Your Shipping Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-[#CCD6F6] font-serif">
            <div className="flex justify-between">
              <span>Route:</span>
              <span className="text-[#FFFFFF]">{form.origin || '---'} → {form.destination || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span>Commodity:</span>
              <span className="text-[#FFFFFF]">{form.commodity || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span>Weight:</span>
              <span className="text-[#FFFFFF]">{form.weight ? `${form.weight.toLocaleString()} kg` : '---'}</span>
            </div>
            <div className="flex justify-between">
              <span>Pickup:</span>
              <span className="text-[#FFFFFF]">{form.pickupDate || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span className="text-[#FFFFFF]">{form.deliveryDate || '---'}</span>
            </div>
          </div>

          <div className="border-t border-[#CCD6F6]/20 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#CCD6F6] font-serif">Insurance:</span>
              <Button
                variant="outline"
                onClick={() => setShowInsuranceModal(true)}
                className="maritime-button text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
              >
                <Shield className="w-4 h-4 mr-2" />
                Browse Policies
              </Button>
            </div>
            
            {selectedPolicy && (
              <div className="bg-[#1E3A5F]/30 p-3 rounded border border-[#D4AF37]/30">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64FFDA]">{selectedPolicy.policy_name}</span>
                  <span className="text-[#D4AF37]">+{selectedPolicy.premium_ink} INK</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#CCD6F6]/20 pt-4 space-y-2">
            <div className="flex justify-between text-[#CCD6F6] font-serif">
              <span>Base Budget:</span>
              <span>{form.budget.toLocaleString()} INK</span>
            </div>
            {selectedPolicy && (
              <div className="flex justify-between text-[#CCD6F6] font-serif">
                <span>Insurance Premium:</span>
                <span>{selectedPolicy.premium_ink.toLocaleString()} INK</span>
              </div>
            )}
            <div className="flex justify-between text-[#D4AF37] font-serif font-medium text-lg border-t border-[#CCD6F6]/20 pt-2">
              <span>Total Cost:</span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {totalCost.toLocaleString()} INK
              </span>
            </div>
          </div>

          <Button
            onClick={handleMintOrder}
            disabled={isSubmitting}
            className="w-full maritime-button bg-[#D4AF37] hover:bg-[#B8860B] text-[#0A192F] font-serif font-medium"
          >
            {isSubmitting ? 'Minting Order...' : 'Mint Shipment Order'}
          </Button>
        </CardContent>
      </Card>

      <InsurancePolicyModal
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
        onSelectPolicy={setSelectedPolicy}
        policyType="shipper"
      />
    </div>
  );
};

export default ShipperView;
