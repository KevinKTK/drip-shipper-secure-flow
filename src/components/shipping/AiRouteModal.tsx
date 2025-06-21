import React, { useState, useEffect, useCallback, useRef } from 'react';
// We no longer need DirectionsService or DirectionsRenderer, but we add PolylineF
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map, List, AlertCircle, Wand2 } from 'lucide-react';

// --- Data Structure for each point on the route ---
interface RouteLocation {
  name: string;
  lat: number;
  lng: number;
}

// --- Component Props Interfaces ---
interface MapDisplayProps {
  mapsApiKey: string;
  route: RouteLocation[];
}

interface AiRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
}

// ===================================================================================
//  1. FINAL MAP DISPLAY COMPONENT (Using Polyline)
// ===================================================================================
const MapDisplay: React.FC<MapDisplayProps> = ({ mapsApiKey, route }) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const bounds = new window.google.maps.LatLngBounds();
    route.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds);
    
    // Add a little extra padding so markers aren't on the edge
    const listener = window.google.maps.event.addListener(map, 'idle', () => {
      if (map.getZoom() && map.getZoom()! > 15) map.setZoom(15);
      window.google.maps.event.removeListener(listener);
    });
  }, [route]);
  
  const getMarkerIcon = (index: number) => {
    const isFirst = index === 0;
    const isLast = index === route.length - 1;

    let fillColor = "#D4AF37"; // Gold for intermediate points
    if (isFirst) fillColor = "#64FFDA"; // Green for origin
    else if (isLast) fillColor = "#4285F4"; // Blue for destination
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: fillColor,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#0A192F'
    };
  };
  const polylineOptions = {
    strokeColor: '#FF0000', // Changed to red
    strokeOpacity: 0.9,
    strokeWeight: 2.5, // Made it slightly thicker to stand out
    icons: [{
        icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, strokeColor: '#FF0000' }, // Changed arrow color
        offset: '100%',
        repeat: '100px'
    }]
  };

  if (loadError) { /* ...unchanged... */ }

  return isMapLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '0.5rem' }}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, styles: [/* ...map styles... */] }}
    >
      {/* Loop to render the custom-colored markers */}
      {route.map((location, index) => (
        <MarkerF
          key={location.name}
          position={{ lat: location.lat, lng: location.lng }}
          title={location.name}
          icon={getMarkerIcon(index)}
          label={{
            text: (index + 1).toString(),
            color: '#0A192F',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        />
      ))}

      {/* --- THIS IS THE FIX --- */}
      {/* Draw a Polyline connecting all the points in the 'route' array */}
      <PolylineF
        path={route.map(loc => ({ lat: loc.lat, lng: loc.lng }))}
        options={polylineOptions}
      />
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-[#1E3A5F] rounded-lg">
      <p className="font-serif text-[#CCD6F6]">Loading Secure Map...</p>
    </div>
  );
};


// ===================================================================================
//  2. PARENT MODAL COMPONENT (No changes needed here)
// ===================================================================================
const AiRouteModal: React.FC<AiRouteModalProps> = ({ isOpen, onClose, order }) => {
  // This entire component's code remains unchanged from the last version.
  const [route, setRoute] = useState<RouteLocation[] | null>(null);
  const [mapsApiKey, setMapsApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      const fetchAiData = async () => {
        setIsLoading(true);
        setError(null);
        setRoute(null);
        setMapsApiKey(null);
        try {
          const { data, error: funcError } = await supabase.functions.invoke('gemini-maps-handler', { body: { origin: order.origin_port, destination: order.destination_port } });
          if (funcError) throw funcError;
          if (data.error) throw new Error(data.error);
          if (!data.route || !data.mapsApiKey) throw new Error("Incomplete data from AI service.");
          setRoute(data.route);
          setMapsApiKey(data.mapsApiKey);
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAiData();
    }
  }, [isOpen, order]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0A192F] border-[#D4AF37]/30 text-[#CCD6F6]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#FFFFFF] font-serif text-2xl"><Wand2 className="w-6 h-6 text-[#D4AF37]" />AI Suggested Route</DialogTitle>
          <DialogDescription className="font-serif text-[#CCD6F6]/80">From <span className="text-[#D4AF37]">{order?.origin_port}</span> to <span className="text-[#D4AF37]">{order?.destination_port}</span></DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {isLoading && ( <div className="flex flex-col items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div><p className="mt-4 font-serif text-[#D4AF37]">Contacting AI Planning Service...</p></div> )}
          {error && ( <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> )}
          {route && mapsApiKey && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <h3 className="flex items-center gap-2 font-serif text-lg text-[#FFFFFF]"><List className="w-5 h-5 text-[#D4AF37]"/> Milestones</h3>
                <ul className="space-y-3 font-serif text-sm">
                  {route.map((location, index) => (
                    <li key={location.name} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-[#1E3A5F] border border-[#D4AF37]/50 rounded-full flex items-center justify-center text-[#D4AF37]">{index + 1}</div>
                      <span>{location.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="flex items-center gap-2 font-serif text-lg text-[#FFFFFF] mb-2"><Map className="w-5 h-5 text-[#D4AF37]"/> Visualization</h3>
                <MapDisplay mapsApiKey={mapsApiKey} route={route} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiRouteModal;