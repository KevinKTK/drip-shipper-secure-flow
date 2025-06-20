
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Package, Trash2 } from 'lucide-react';

interface Journey {
  id: string;
  origin_port: string;
  destination_port: string;
  departure_date: string;
  available_capacity_kg: number;
  created_at: string;
}

interface JourneyCardProps {
  journey: Journey;
  onSelect: (journey: Journey) => void;
  onDelete: (id: string) => void;
}

const JourneyCard = ({ journey, onSelect, onDelete }: JourneyCardProps) => {
  const departureDate = new Date(journey.departure_date);
  const isPastJourney = departureDate < new Date();
  
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

        <div className="text-xs text-[#CCD6F6]/50 font-serif">
          Logged: {new Date(journey.created_at).toLocaleDateString()}
        </div>

        <Button 
          className="w-full maritime-button bg-[#CCD6F6]/20 hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#CCD6F6] font-serif border border-[#CCD6F6]/30"
          onClick={() => onSelect(journey)}
        >
          Use This Route
        </Button>
      </CardContent>
    </Card>
  );
};

export default JourneyCard;
