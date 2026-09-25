import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin } from 'lucide-react';

export default function ThermalMap({
  zones,
  center,
  selectedZoneId,
  onSelectZone
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('osm'); // Default to OpenStreetMap (Zero watermarks!)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      const tileUrl = mapStyle === 'dark'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      tileLayerRef.current = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([center.lat, center.lon], 13);
    }
  }, [center]);

  // Handle tile style change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const tileUrl = mapStyle === 'dark'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Color mapping based on Land Surface Temperature (°C)
  const getZoneColor = (lst) => {
    if (lst > 38.0) return '#ef4444'; // Extreme Heat - Red
    if (lst > 35.0) return '#f97316'; // High Heat - Orange
    if (lst > 32.0) return '#f59e0b'; // Moderate Heat - Amber
    if (lst > 29.0) return '#eab308'; // Warm - Yellow
    return '#10b981'; // Cool - Emerald Green
  };

  // Render Grid Cells
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !zones || zones.length === 0) return;

    layerGroupRef.current.clearLayers();

    const displayZones = zones;
    const step = 0.0017;

    displayZones.forEach((zone) => {
      const isSelected = zone.zone_id === selectedZoneId;
      const color = getZoneColor(zone.lst);

      const bounds = [
        [zone.lat - step, zone.lon - step],
        [zone.lat + step, zone.lon + step]
      ];

      const rect = L.rectangle(bounds, {
        color: isSelected ? '#ffffff' : color,
        weight: isSelected ? 3 : 0.8,
        fillColor: color,
        fillOpacity: isSelected ? 0.9 : 0.6,
      });

      rect.bindTooltip(
        `<div class="p-1 font-sans">
          <div class="font-bold text-xs text-white">${zone.zone_id}</div>
          <div class="text-xs text-emerald-400 font-semibold mt-0.5">LST: ${zone.lst}°C</div>
        </div>`,
        { direction: 'top', sticky: true }
      );

      rect.on('click', () => {
        onSelectZone(zone.zone_id);
      });

      rect.addTo(layerGroupRef.current);
    });

  }, [zones, selectedZoneId, onSelectZone]);

  return (
    <div className="glass-card p-3 sm:p-4 relative h-[340px] sm:h-[450px] flex flex-col rounded-xl overflow-hidden">
      {/* Mobile-Friendly Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Urban Heat Map
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
            Tap cell to select
          </span>
        </div>

        {/* Controls & Legend */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                mapStyle === 'osm' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              OpenStreet
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                mapStyle === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full rounded-lg overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full z-0"></div>
      </div>
    </div>
  );
}
