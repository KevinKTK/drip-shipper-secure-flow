
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, Ship, AlertCircle, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InsurancePolicyModal from './InsurancePolicyModal';
import { useQuery } from '@tanstack/react-query';

const ShipperView = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [cargoType, setCargoType] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [price, setPrice] = useState('');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: insuranceTemplates } = useQuery({
    queryKey: ['insurance-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_templates')
        .select('*')
        .eq('policy_type', 'shipper')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!user) {
        throw new Error('You must be logged in to create an order');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Reset form
      setTitle('');
      setDescription('');
      setOriginPort('');
      setDestinationPort('');
      setDepartureDate(undefined);
      setCargoType('');
      setWeight('');
      setVolume('');
      setPrice('');
      setSelectedInsurance(null);
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order');
    },
  });

  const handleCreateOrder = () => {
    if (!user) {
      toast.error('Please sign in to create an order');
      return;
    }

    if (!title || !originPort || !destinationPort || !departureDate || !cargoType || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const orderData = {
      order_type: 'cargo',
      title,
      description,
      origin_port: originPort,
      destination_port: destinationPort,
      departure_date: format(departureDate, 'yyyy-MM-dd'),
      cargo_type: cargoType,
      weight_tons: weight ? parseInt(weight) : null,
      volume_cbm: volume ? parseInt(volume) : null,
      price_ink: parseFloat(price),
      is_insured: !!selectedInsurance,
      selected_insurance_policy_id: selectedInsurance?.id || null,
      status: 'pending'
    };

    createOrderMutation.mutate(orderData);
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(price) || 0;
    const insurancePremium = selectedInsurance ? selectedInsurance.premium_ink : 0;
    return basePrice + insurancePremium;
  };

  const handleInsuranceSelect = (insurance: any) => {
    setSelectedInsurance(insurance);
    setShowInsuranceModal(false);
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create Order Form */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            Create Shipping Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Check */}
          {!user && (
            <div className="bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FF6B6B]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-serif text-sm">Please sign in to create shipping orders</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0A192F] font-serif"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Order Title */}
          <div className="space-y-2">
            <Label className="text-[#CCD6F6] font-serif">Order Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Electronics Shipment to Rotterdam"
              className="maritime-input"
              disabled={!user}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#CCD6F6] font-serif">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about your cargo..."
              className="maritime-input min-h-[80px]"
              disabled={!user}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Origin Port *</Label>
              <Input
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                placeholder="e.g., Hamburg"
                className="maritime-input"
                disabled={!user}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Destination Port *</Label>
              <Input
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="e.g., Rotterdam"
                className="maritime-input"
                disabled={!user}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#CCD6F6] font-serif">Departure Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal maritime-input",
                    !departureDate && "text-muted-foreground"
                  )}
                  disabled={!user}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 maritime-card">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-[#CCD6F6] font-serif">Cargo Type *</Label>
            <Select value={cargoType} onValueChange={setCargoType} disabled={!user}>
              <SelectTrigger className="maritime-input">
                <SelectValue placeholder="Select cargo type" />
              </SelectTrigger>
              <SelectContent className="maritime-card">
                <SelectItem value="dry_bulk">Dry Bulk</SelectItem>
                <SelectItem value="liquid_bulk">Liquid Bulk</SelectItem>
                <SelectItem value="container">Container</SelectItem>
                <SelectItem value="breakbulk">Breakbulk</SelectItem>
                <SelectItem value="project_cargo">Project Cargo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Weight (tons)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="1000"
                className="maritime-input"
                disabled={!user}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#CCD6F6] font-serif">Volume (CBM)</Label>
              <Input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="500"
                className="maritime-input"
                disabled={!user}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#CCD6F6] font-serif">Budget (ETH) *</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1000"
              className="maritime-input"
              disabled={!user}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[#CCD6F6] font-serif">Insurance Coverage</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInsuranceModal(true)}
                className="maritime-button-outline"
                disabled={!user}
              >
                Browse Policies
              </Button>
            </div>
            
            {selectedInsurance && (
              <div className="bg-[#1E3A5F] p-3 rounded-lg border border-[#64FFDA]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#64FFDA] font-serif font-medium">{selectedInsurance.policy_name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInsurance(null)}
                    className="h-6 w-6 p-0 text-[#CCD6F6] hover:text-[#FF6B6B]"
                    disabled={!user}
                  >
                    ×
                  </Button>
                </div>
                <p className="text-xs text-[#CCD6F6] mb-2 font-serif">{selectedInsurance.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#CCD6F6] font-serif">Premium:</span>
                  <span className="text-[#D4AF37] font-medium">{selectedInsurance.premium_ink} ETH</span>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleCreateOrder}
            disabled={createOrderMutation.isPending || !user}
            className="w-full maritime-button bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0A192F] font-serif"
          >
            {createOrderMutation.isPending ? 'Creating Order...' : 'Create Shipping Order'}
          </Button>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="maritime-card maritime-card-glow">
        <CardHeader>
          <CardTitle className="text-[#FFFFFF] font-serif font-medium">Your Shipping Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3 text-[#CCD6F6] font-serif">
            <div className="flex justify-between">
              <span>Route:</span>
              <span className="text-[#FFFFFF]">{originPort || 'Origin'} → {destinationPort || 'Destination'}</span>
            </div>
            <div className="flex justify-between">
              <span>Departure:</span>
              <span className="text-[#FFFFFF]">
                {departureDate ? format(departureDate, 'MMM dd, yyyy') : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cargo Type:</span>
              <span className="text-[#FFFFFF]">
                {cargoType ? cargoType.replace('_', ' ').toUpperCase() : 'Not selected'}
              </span>
            </div>
            {weight && (
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="text-[#FFFFFF]">{weight} tons</span>
              </div>
            )}
            {volume && (
              <div className="flex justify-between">
                <span>Volume:</span>
                <span className="text-[#FFFFFF]">{volume} CBM</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#CCD6F6]/20 pt-4 space-y-3">
            <div className="flex justify-between text-[#CCD6F6] font-serif">
              <span>Base Price:</span>
              <span className="text-[#FFFFFF]">{price || '0'} ETH</span>
            </div>
            
            {selectedInsurance && (
              <div className="flex justify-between text-[#CCD6F6] font-serif">
                <span>Insurance Premium:</span>
                <span className="text-[#64FFDA]">{selectedInsurance.premium_ink} ETH</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-medium pt-3 border-t border-[#CCD6F6]/20">
              <span className="text-[#CCD6F6] font-serif">Total Cost:</span>
              <span className="text-[#D4AF37]">{calculateTotal()} ETH</span>
            </div>
          </div>

          {selectedInsurance && (
            <div className="bg-[#1E3A5F] p-4 rounded-lg border border-[#64FFDA]/20">
              <div className="flex items-center gap-2 mb-2">
                <Ship className="w-4 h-4 text-[#64FFDA]" />
                <span className="text-[#64FFDA] font-serif font-medium">Insurance Coverage</span>
              </div>
              <div className="space-y-2 text-sm text-[#CCD6F6] font-serif">
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="text-[#FFFFFF]">{selectedInsurance.payout_amount_ink} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Trigger:</span>
                  <span className="text-[#FFFFFF]">{selectedInsurance.trigger_condition}</span>
                </div>
                {selectedInsurance.delay_threshold_hours && (
                  <div className="flex justify-between">
                    <span>Threshold:</span>
                    <span className="text-[#FFFFFF]">{selectedInsurance.delay_threshold_hours}h delay</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Modal */}
      <InsurancePolicyModal
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
        templates={insuranceTemplates || []}
        onSelect={handleInsuranceSelect}
        userType="shipper"
      />
    </div>
  );
};

export default ShipperView;
