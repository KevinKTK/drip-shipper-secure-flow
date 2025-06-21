import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map, List, AlertCircle, Wand2 } from 'lucide-react';

// Define the data structures for our props and state
interface RouteLocation {
  name: string;
  lat: number;
  lng: number;
}

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
//  1. CHILD COMPONENT: Renders only the map and markers
//  This version includes a definitive safety check to prevent timing errors.
// ===================================================================================
const MapDisplay: React.FC<MapDisplayProps> = ({ mapsApiKey, route }) => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapsApiKey,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    // This safety check ensures window.google exists before we use it
    if (window.google && window.google.maps && route.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      route.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds);

      // Add a little extra padding so markers aren't on the edge
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [route]);
  
  // --- THIS IS THE CRITICAL FIX ---
  // We will not attempt to render the map or any of its logic
  // until the script is loaded AND the window.google object is confirmed to exist.
  if (!isMapLoaded || !window.google?.maps) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E3A5F] rounded-lg">
        <p className="font-serif text-[#CCD6F6]">Loading Map...</p>
      </div>
    );
  }
  
  // If we reach here, window.google.maps is guaranteed to be available.
  const getMarkerIcon = (index: number) => {
    const isFirst = index === 0;
    const isLast = index === route.length - 1;
    let fillColor = isFirst ? "#64FFDA" : isLast ? "#4285F4" : "#D4AF37";
    
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
    strokeColor: '#FF0000',
    strokeOpacity: 0.9,
    strokeWeight: 2.5,
    icons: [{
        icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, strokeColor: '#FF0000' },
        offset: '100%',
        repeat: '100px'
    }]
  };

  if (loadError) {
    return <Alert variant="destructive"><AlertTitle>Map Script Error</AlertTitle><AlertDescription>The Google Maps script failed to load. Please check your API key and network connection.</AlertDescription></Alert>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '0.5rem' }}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false, styles: [ { "stylers": [ { "hue": "#ff1a00" }, { "invert_lightness": true }, { "saturation": -100 }, { "lightness": 33 }, { "gamma": 0.5 } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#2D333C" } ] } ]}}
    >
      {route.map((location, index) => (
        <MarkerF
          key={location.name}
          position={location}
          icon={getMarkerIcon(index)}
          label={{
            text: (index + 1).toString(),
            color: '#0A192F',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        />
      ))}
      <PolylineF
        path={route}
        options={polylineOptions}
      />
    </GoogleMap>
  );
};


// ===================================================================================
//  2. PARENT COMPONENT: The main modal dialog
// ===================================================================================
const AiRouteModal: React.FC<AiRouteModalProps> = ({ isOpen, onClose, order }) => {
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
          const { data, error: funcError } = await supabase.functions.invoke('gemini-maps-handler', {
            body: {
              origin: order.origin_port,
              destination: order.destination_port,
            },
          });
          if (funcError) throw new Error(funcError.message);
          if (data.error) throw new Error(data.error);
          if (!data.route || !data.mapsApiKey) throw new Error("Incomplete data received from server.");
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
          <DialogTitle className="flex items-center gap-2 text-2xl font-serif text-[#FFFFFF]">
            <Wand2 className="w-6 h-6 text-[#D4AF37]" />
            AI Suggested Route
          </DialogTitle>
          <DialogDescription className="font-serif text-[#CCD6F6]/80">
            From <span className="text-[#D4AF37]">{order?.origin_port}</span> to <span className="text-[#D4AF37]">{order?.destination_port}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
              <p className="mt-4 font-serif text-[#D4AF37]">Contacting AI Planning Service...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {route && mapsApiKey && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <h3 className="flex items-center gap-2 font-serif text-lg text-[#FFFFFF]">
                  <List className="w-5 h-5 text-[#D4AF37]"/> Milestones
                </h3>
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
                <h3 className="flex items-center gap-2 font-serif text-lg text-[#FFFFFF] mb-2">
                  <Map className="w-5 h-5 text-[#D4AF37]"/> Visualization
                </h3>
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