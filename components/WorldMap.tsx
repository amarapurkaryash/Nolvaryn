import React, { useEffect, useRef } from 'react';

// We need to declare 'L' from Leaflet since we're loading it from a script tag.
declare const L: any;

interface MapLocation {
  ip?: string; // Each IP needs a unique identifier for color generation and tooltip
  latitude: number | null;
  longitude: number | null;
  type: 'origin' | 'hop';
  geolocation: string;
}

interface WorldMapProps {
  locations: MapLocation[];
}

/**
 * Generates a consistent, bright color from a string.
 * Uses a simple hash and then scales the color values to be in the brighter range (128-255)
 * to ensure visibility on a dark map background.
 * @param str The input string (e.g., an IP address).
 * @returns A hex color string (e.g., '#AABBCC').
 */
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = hash & hash; // Ensure it's a 32bit integer

  let color = '#';
  for (let i = 0; i < 3; i++) {
    // Shift and mask to get 8 bits, then scale to a brighter range
    const value = (hash >> (i * 8)) & 0xFF;
    const brightValue = Math.floor(value * 0.5 + 128); // Maps 0-255 to 128-255 range
    color += ('00' + brightValue.toString(16)).substr(-2);
  }
  return color;
};

const WorldMap: React.FC<WorldMapProps> = ({ locations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerGroup = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        maxBounds: [[-90, -180], [90, 180]], // Prevents user from panning outside map
        worldCopyJump: true,
        zoomControl: true,
      });

      mapInstance.current.zoomControl.setPosition('topright');


      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        minZoom: 2,
        maxZoom: 10,
        noWrap: true,
      }).addTo(mapInstance.current);

      layerGroup.current = L.layerGroup().addTo(mapInstance.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !layerGroup.current) return;
    
    // Clear previous markers and lines
    layerGroup.current.clearLayers();

    if (locations.length === 0) return;

    const validLocations = locations.filter(
        l => l.latitude != null && l.longitude != null && !(l.latitude === 0 && l.longitude === 0)
    );

    if (validLocations.length === 0) return;

    // --- Jittering logic for overlapping points ---
    const JITTER_RADIUS = 0.2; // in degrees
    const coordsMap = new Map<string, MapLocation[]>();

    // Group locations by same coordinates
    validLocations.forEach(loc => {
        const key = `${loc.latitude},${loc.longitude}`;
        if (!coordsMap.has(key)) {
            coordsMap.set(key, []);
        }
        coordsMap.get(key)!.push(loc);
    });

    const processedLocations: MapLocation[] = [];
    coordsMap.forEach(group => {
        if (group.length > 1) {
            const count = group.length;
            const [originalLat, originalLng] = [group[0].latitude!, group[0].longitude!];
            
            group.forEach((loc, i) => {
                const angle = (2 * Math.PI / count) * i;
                // Offset latitude
                const newLat = originalLat + JITTER_RADIUS * Math.cos(angle);
                // Offset longitude, adjusting for projection distortion at different latitudes
                const newLng = originalLng + (JITTER_RADIUS * Math.sin(angle)) / Math.cos(originalLat * Math.PI / 180);
                
                processedLocations.push({ ...loc, latitude: newLat, longitude: newLng });
            });
        } else {
            // No overlap, add as is
            processedLocations.push(group[0]);
        }
    });
    // --- End of jittering logic ---

    processedLocations.forEach(location => {
      const { latitude, longitude, type, geolocation, ip } = location;
      
      // Generate a unique, bright color for each IP
      const color = stringToColor(ip || geolocation); 
      
      const iconHtml = `
        <div class="relative flex items-center justify-center">
            <div style="background-color: ${color};" class="w-3 h-3 rounded-full border border-primary-bg shadow-md"></div>
            ${type === 'origin' ? `
                <div style="background-color: ${color};" class="absolute w-3 h-3 rounded-full animate-ping opacity-75"></div>
            ` : ''}
        </div>
      `;
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-0', // important to clear default leaflet styles
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      
      const tooltipContent = ip ? `${geolocation}<br><code>${ip}</code>` : geolocation;

      L.marker([latitude as number, longitude as number], { icon: customIcon })
        .addTo(layerGroup.current)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: L.point(0, -6),
          className: 'custom-tooltip',
        });
    });

    // Fit map to bounds of all processed locations
    if (processedLocations.length > 0) {
        const bounds = L.latLngBounds(processedLocations.map(l => [l.latitude as number, l.longitude as number]));
        if (bounds.isValid()) {
          mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 6, animate: true });
        }
    }

  }, [locations]);

  return (
    <div ref={mapRef} className="w-full h-full relative">
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-text-muted-2 text-center bg-primary-bg/50 px-2 py-1 rounded w-max max-w-[90%]">
          *Geolocation data for email servers is approximate.
        </p>
    </div>
  );
};

export { WorldMap };