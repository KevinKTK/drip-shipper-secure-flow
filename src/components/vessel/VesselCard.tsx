
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ship, Package, Calendar, MapPin, ExternalLink, Hash } from 'lucide-react';

interface VesselCardProps {
  vessel: any;
  onLogJourney: () => void;
  style?: React.CSSProperties;
}

const VesselCard = ({ vessel, onLogJourney, style }: VesselCardProps) => {
  const getVesselTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBlockExplorerUrl = () => {
    if (vessel.nft_token_id && vessel.nft_contract_address) {
      return `https://cardona-zkevm.polygonscan.com/token/${vessel.nft_contract_address}?a=${vessel.nft_token_id}`;
    }
    return null;
  };

  return (
    <Card 
      className="maritime-card bg-slate-800/50 border-slate-600/50 hover:border-cyan-400/50 hover:shadow-cyan-400/20 hover:shadow-lg transition-all duration-300 page-enter-stagger" 
      style={style}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
              <Ship className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <CardTitle className="text-white font-serif font-medium text-lg">
                {vessel.title}
              </CardTitle>
              <p className="text-cyan-400 font-serif text-sm">
                IMO: {vessel.description?.split('IMO: ')[1]?.split('\n')[0] || 'N/A'}
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-400/20 text-emerald-400 border-emerald-400/30 flex-shrink-0">
            {vessel.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-serif text-sm">
            <Package className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Type: {getVesselTypeDisplay(vessel.vessel_type || 'general_cargo')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-slate-200 font-serif text-sm">
            <Package className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Capacity: {vessel.weight_tons || 0} tons</span>
          </div>

          {vessel.nft_token_id && (
            <div className="flex items-center gap-2 text-slate-200 font-serif text-sm">
              <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Token ID: {vessel.nft_token_id}</span>
            </div>
          )}
        </div>

        {vessel.nft_token_id && vessel.nft_contract_address && (
          <div className="pt-2 border-t border-slate-500/20">
            <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-serif text-xs font-medium">NFT Details</p>
                  <p className="text-slate-300 font-serif text-xs">
                    Contract: {vessel.nft_contract_address.slice(0, 6)}...{vessel.nft_contract_address.slice(-4)}
                  </p>
                </div>
                {getBlockExplorerUrl() && (
                  <a
                    href={getBlockExplorerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-500/20">
          <Button
            onClick={onLogJourney}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900 maritime-button font-serif font-semibold"
          >
            <Package className="w-4 h-4 mr-2" />
            Log Journey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VesselCard;
