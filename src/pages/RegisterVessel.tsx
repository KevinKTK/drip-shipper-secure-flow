
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Ship } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const RegisterVessel = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    vesselName: '',
    imoNumber: '',
    vesselType: '',
    capacity: '',
    description: '',
  });

  const createVesselMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('orders')
        .insert([{
          title: data.vesselName,
          description: `IMO: ${data.imoNumber}\n${data.description}`,
          order_type: 'vessel',
          vessel_type: data.vesselType,
          weight_tons: parseInt(data.capacity),
          price_eth: 0, // Default value since pricing is determined elsewhere
          origin_port: 'TBD', // To be determined when logging journeys
          destination_port: 'TBD', // To be determined when logging journeys
          departure_date: new Date().toISOString().split('T')[0], // Default to current date
          arrival_date: new Date().toISOString().split('T')[0], // Default to current date
          wallet_address: address,
          status: 'pending',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Vessel Registered Successfully!",
        description: "Your vessel has been added to your fleet.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-vessels'] });
      navigate('/vessels');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register vessel",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to register a vessel",
        variant: "destructive",
      });
      return;
    }

    if (!formData.vesselName || !formData.vesselType || !formData.capacity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createVesselMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0A192F] maritime-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-4">Register Vessel</h1>
            <p className="text-[#CCD6F6] font-serif mb-8">Please connect your wallet to register a vessel</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 page-enter">
          <Button
            onClick={() => navigate('/vessels')}
            variant="ghost"
            className="text-[#CCD6F6] hover:text-[#D4AF37] font-serif"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Vessels
          </Button>
        </div>

        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">Register New Vessel</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Add a new vessel to your fleet</p>
        </div>

        <div className="max-w-2xl mx-auto page-enter" style={{ animationDelay: '0.2s' }}>
          <Card className="maritime-card maritime-card-glow">
            <CardHeader>
              <CardTitle className="text-[#FFFFFF] font-serif font-medium flex items-center gap-2">
                <Ship className="w-5 h-5 text-[#D4AF37]" />
                Vessel Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Vessel Name *</Label>
                    <Input
                      value={formData.vesselName}
                      onChange={(e) => handleInputChange('vesselName', e.target.value)}
                      placeholder="e.g., MV Pacific Star"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                      disabled={createVesselMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">IMO Number</Label>
                    <Input
                      value={formData.imoNumber}
                      onChange={(e) => handleInputChange('imoNumber', e.target.value)}
                      placeholder="e.g., IMO 1234567"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                      disabled={createVesselMutation.isPending}
                    />
                    <p className="text-xs text-[#CCD6F6]/70 font-serif">
                      International Maritime Organization number for vessel identification
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Vessel Type *</Label>
                    <Select value={formData.vesselType} onValueChange={(value) => handleInputChange('vesselType', value)} disabled={createVesselMutation.isPending}>
                      <SelectTrigger className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] font-serif">
                        <SelectValue placeholder="Select vessel type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E3A5F] border-[#CCD6F6]/30">
                        <SelectItem value="container_ship" className="text-[#FFFFFF] font-serif">Container Ship</SelectItem>
                        <SelectItem value="bulk_carrier" className="text-[#FFFFFF] font-serif">Bulk Carrier</SelectItem>
                        <SelectItem value="tanker" className="text-[#FFFFFF] font-serif">Tanker</SelectItem>
                        <SelectItem value="ro_ro" className="text-[#FFFFFF] font-serif">Ro-Ro</SelectItem>
                        <SelectItem value="general_cargo" className="text-[#FFFFFF] font-serif">General Cargo</SelectItem>
                        <SelectItem value="lng_carrier" className="text-[#FFFFFF] font-serif">LNG Carrier</SelectItem>
                        <SelectItem value="lpg_carrier" className="text-[#FFFFFF] font-serif">LPG Carrier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#CCD6F6] font-serif">Capacity (tons) *</Label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="e.g., 50000"
                      className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                      disabled={createVesselMutation.isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#CCD6F6] font-serif">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Additional vessel details, certifications, special equipment..."
                    rows={3}
                    className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                    disabled={createVesselMutation.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createVesselMutation.isPending}
                  className="w-full golden-button maritime-button font-serif font-semibold py-3 text-lg"
                >
                  {createVesselMutation.isPending ? 'Registering Vessel...' : 'Register Vessel'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterVessel;
