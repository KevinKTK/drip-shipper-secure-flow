
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Calendar, Package, Trash2, ExternalLink, DollarSign } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Journey {
  id: string;
  origin_port: string;
  destination_port: string;
  departure_date: string;
  available_capacity_kg: number;
  created_at: string;
  nft_transaction_hash?: string;
  journey_nft_contract_address?: string;
  price_eth?: number;
}

interface JourneyCardProps {
  journey: Journey;
  onSelect: (journey: Journey) => void;
  onDelete: (id: string) => void;
}

const JourneyCard = ({ journey, onSelect, onDelete }: JourneyCardProps) => {
  const [isSettingPrice, setIsSettingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const queryClient = useQueryClient();
  
  const departureDate = new Date(journey.departure_date);
  const isPastJourney = departureDate < new Date();
  const isPriced = journey.price_eth !== null && journey.price_eth !== undefined;
  
  const setPriceMutation = useMutation({
    mutationFn: async (price: number) => {
      const { data, error } = await supabase
        .from('carrier_routes')
        .update({ price_eth: price })
        .eq('id', journey.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Journey priced successfully!', {
        description: 'Your journey is now available on the marketplace.',
      });
      queryClient.invalidateQueries({ queryKey: ['vessel-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['carrier-routes'] });
      setIsSettingPrice(false);
      setPriceInput('');
    },
    onError: (error: any) => {
      console.error('Error setting journey price:', error);
      toast.error('Failed to set price', {
        description: error.message || 'Please try again.',
      });
    },
  });

  const handleSetPrice = () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid Price', {
        description: 'Please enter a valid price in ETH.',
      });
      return;
    }
    setPriceMutation.mutate(price);
  };

  return (
    <Card className={`maritime-card maritime-card-glow min-w-[280px] cursor-pointer transition-all duration-300 hover:scale-105 ${
      isPastJourney ? 'opacity-75' : ''
    }`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-[#CCD6F6]">
            <MapPin className="w-4 h-4" />
            <span className="font-serif text-sm">{journey.origin_port} → {journey.destination_port}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(journey.id);
            }}
            className="h-6 w-6 p-0 text-[#CCD6F6]/50 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-[#CCD6F6]">
          <Calendar className="w-4 h-4" />
          <span className="font-serif text-sm">
            {departureDate.toLocaleDateString()}
            {isPastJourney && <span className="text-[#CCD6F6]/50 ml-1">(Past)</span>}
          </span>
        </div>

        {journey.available_capacity_kg && (
          <div className="flex items-center gap-2 text-[#CCD6F6]">
            <Package className="w-4 h-4" />
            <span className="font-serif text-sm">{journey.available_capacity_kg.toLocaleString()} kg</span>
          </div>
        )}

        {/* Price Display */}
        {isPriced && (
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <DollarSign className="w-4 h-4" />
            <span className="font-serif text-sm font-medium">{journey.price_eth} ETH</span>
            <span className="text-xs text-[#64FFDA] bg-[#64FFDA]/20 px-2 py-1 rounded">On Marketplace</span>
          </div>
        )}

        {/* Smart Contract Link */}
        {journey.nft_transaction_hash && (
          <a 
            href={`https://cardona-zkevm.polygonscan.com/tx/${journey.nft_transaction_hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#64FFDA] hover:text-[#64FFDA]/80 text-sm font-serif"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            View on Blockchain
          </a>
        )}

        <div className="text-xs text-[#CCD6F6]/50 font-serif">
          Logged: {new Date(journey.created_at).toLocaleDateString()}
        </div>

        {/* Pricing Section */}
        {!isPriced && !isPastJourney && (
          <div className="space-y-2">
            {!isSettingPrice ? (
              <Button 
                className="w-full maritime-button bg-[#D4AF37]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#D4AF37] font-serif border border-[#D4AF37]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingPrice(true);
                }}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Price for Marketplace
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Price in ETH"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="maritime-glow bg-[#1E3A5F] border-[#CCD6F6]/30 text-[#FFFFFF] placeholder-[#CCD6F6]/50 font-serif"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSetPrice}
                    disabled={setPriceMutation.isPending}
                    className="flex-1 golden-button maritime-button font-serif"
                  >
                    {setPriceMutation.isPending ? 'Setting...' : 'Set Price'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSettingPrice(false);
                      setPriceInput('');
                    }}
                    className="flex-1 text-[#CCD6F6] hover:text-[#D4AF37] font-serif"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Use Route Button - only show if not priced */}
        {!isPriced && (
          <Button 
            className="w-full maritime-button bg-[#CCD6F6]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] font-serif border border-[#CCD6F6]/30"
            onClick={() => onSelect(journey)}
          >
            Use This Route
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
