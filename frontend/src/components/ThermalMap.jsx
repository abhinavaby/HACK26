import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Globe, Map as MapIcon, Layers, Trees, Home, Shield, Flame } from 'lucide-react';

export default function ThermalMap({
  city = 'Delhi',
  zones = [],
  center,
  selectedZoneId,
  onSelectZone,
  deltaNdvi = 0.15,
  deltaAlbedo = 0.20,
  deltaNdbi = -0.10,
  userBudgetInr = 2000000,
  userWaterLpd = 6000,
  hideHeader = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Separate Layer Groups for toggle controls
  const hotspotsLayerRef = useRef(null);
  const treeLayerRef = useRef(null);
  const coolRoofsLayerRef = useRef(null);
  const corridorsLayerRef = useRef(null);

  // Layer Visibility Toggle Controls State
  const [showHotspots, setShowHotspots] = useState(true);
  const [showTreeLayer, setShowTreeLayer] = useState(true);
  const [showCoolRoofsLayer, setShowCoolRoofsLayer] = useState(true);
  const [showCorridorsLayer, setShowCorridorsLayer] = useState(true);

  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'street'
  const [locationLayersData, setLocationLayersData] = useState(null);

  // Map Tile Providers
  const getTileUrl = (style) => {
    switch (style) {
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'satellite':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Helper function to format INR currency
  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  // Fetch Candidate Intervention Locations from API
  useEffect(() => {
    const url = `http://localhost:8000/api/intervention-locations?city=${city}&delta_ndvi=${deltaNdvi}&delta_albedo=${deltaAlbedo}&delta_ndbi=${deltaNdbi}&user_budget_inr=${userBudgetInr}&user_water_lpd=${userWaterLpd}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setLocationLayersData(data))
      .catch((err) => console.error('Failed to fetch intervention locations:', err));
  }, [city, deltaNdvi, deltaAlbedo, deltaNdbi, userBudgetInr, userWaterLpd]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lon],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: 'topright' }).addTo(map);

    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19,
      attribution: '&copy; Esri Satellite & OpenStreetMap'
    }).addTo(map);

    // Create separate layer groups
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    treeLayerRef.current = L.layerGroup().addTo(map);
    coolRoofsLayerRef.current = L.layerGroup().addTo(map);
    corridorsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 200),
      setTimeout(() => map.invalidateSize(), 500)
    ];

    let ro = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(mapContainerRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (ro) ro.disconnect();
      try { map.remove(); } catch (e) {}
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lon]);

  // Handle tile style change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapInstanceRef.current);
  }, [mapStyle]);

  // Color mapping based on Land Surface Temperature (°C)
  const getZoneColor = (lst) => {
    if (lst > 38.0) return '#ef4444'; // Red
    if (lst > 35.0) return '#f97316'; // Orange
    if (lst > 32.0) return '#f59e0b'; // Amber
    if (lst > 29.0) return '#eab308'; // Yellow
    return '#10b981';                // Emerald Green
  };

  // 1. Render Heat Hotspots Layer with RICH MODELLED IMPACT TILE HOVER OVERLAY
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!showHotspots || !zones || zones.length === 0) return;

    const step = 0.0017;
    zones.forEach((zone) => {
      const isSelected = zone.zone_id === selectedZoneId;
      const color = getZoneColor(zone.lst);
      const bounds = [
        [zone.lat - step, zone.lon - step],
        [zone.lat + step, zone.lon + step]
      ];

      const rect = L.rectangle(bounds, {
        color: isSelected ? '#b5f639' : color,
        weight: isSelected ? 3.5 : 0.8,
        fillColor: color,
        fillOpacity: isSelected ? 0.85 : 0.45,
      });

      const riskText = zone.risk_level || (zone.lst > 37 ? 'Critical' : zone.lst > 34 ? 'Severe' : 'Moderate');
      const bldgDensity = zone.bldg_density ?? 0.70;
      const openSpaceM2 = Math.round((1.0 - bldgDensity) * 10000);

      // Modelled impact drop calculation for this tile
      const baselineLst = zone.lst;
      const coolingDrop = (0.6 + (deltaNdvi * 3.8) + (deltaAlbedo * 3.2) + (Math.abs(deltaNdbi) * 2.2)).toFixed(1);
      const simulatedLst = (baselineLst - parseFloat(coolingDrop)).toFixed(1);

      // Constraints check
      const requiredWater = Math.round((deltaNdvi * 100) * 120);
      const requiredBudget = Math.round((deltaNdvi * 100 * 25000) + (deltaAlbedo * 100 * 18000));
      const isWaterOk = userWaterLpd >= requiredWater;
      const isBudgetOk = userBudgetInr >= requiredBudget;

      const tooltipContent = `
        <div class="p-3.5 font-sans bg-[#07080b]/60 backdrop-blur-md text-white rounded-2xl border border-[#b5f639]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] w-[450px] space-y-2.5">
          <!-- Top Row: Zone Header + Risk Badge + Impact Pill -->
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base font-black text-white">${zone.zone_id}</span>
              <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                zone.lst > 37 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/40'
              }">${riskText}</span>
            </div>
            <div class="px-3 py-1 bg-[#b5f639]/15 border border-[#b5f639]/40 rounded-xl text-xs font-black text-[#b5f639] flex items-center gap-1">
              <span>ESTIMATED IMPACT:</span>
              <span class="text-sm">↓ ${coolingDrop}°C</span>
            </div>
          </div>

          <!-- 2-Column Wide Grid Layout -->
          <div class="grid grid-cols-2 gap-2.5 text-[10px]">
            <!-- Left Column: Temperature Baseline vs Post-Cooling & Feasibility Statuses -->
            <div class="space-y-2 flex flex-col justify-between">
              <div class="grid grid-cols-2 gap-2 text-center bg-[#0e1117]/50 backdrop-blur-sm p-2 rounded-xl border border-white/10">
                <div class="border-r border-white/10 pr-1">
                  <div class="text-[8.5px] font-bold text-slate-400">1. BASELINE LST</div>
                  <div class="text-base font-black text-rose-400">${baselineLst.toFixed(1)}°C</div>
                </div>
                <div class="pl-1">
                  <div class="text-[8.5px] font-bold text-slate-400">3. MODELLED</div>
                  <div class="text-base font-black text-[#b5f639]">${simulatedLst}°C</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-1.5 text-[9px]">
                <div class="bg-white/5 p-1.5 rounded-xl border border-white/5 text-center">
                  <span class="text-slate-400 block font-bold text-[8px]">WATER STATUS</span>
                  <span class="${isWaterOk ? 'text-emerald-400' : 'text-rose-400'} font-extrabold text-[9.5px]">
                    ${isWaterOk ? '✓ Within Limit' : '⚠️ Exceeds'}
                  </span>
                </div>
                <div class="bg-white/5 p-1.5 rounded-xl border border-white/5 text-center">
                  <span class="text-slate-400 block font-bold text-[8px]">BUDGET STATUS</span>
                  <span class="${isBudgetOk ? 'text-emerald-400' : 'text-rose-400'} font-extrabold text-[9.5px]">
                    ${isBudgetOk ? '✓ Feasible' : '⚠️ Exceeds'}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Column: Active Intervention Plan Breakdown -->
            <div class="bg-[#0e1117]/50 backdrop-blur-sm p-2.5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div class="font-extrabold text-slate-300 border-b border-white/5 pb-1 mb-1 text-[9px] uppercase tracking-wider">
                2. PROPOSED INTERVENTIONS
              </div>
              <div class="space-y-1 text-[9.5px]">
                <div class="flex justify-between items-center">
                  <span class="text-slate-300">🌳 Tree Canopy:</span>
                  <strong class="text-[#b5f639]">+${(deltaNdvi * 100).toFixed(0)}% (${(openSpaceM2 * 0.4).toFixed(0)}m²)</strong>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-300">🏠 Cool Roofs:</span>
                  <strong class="text-amber-400">+${(deltaAlbedo * 100).toFixed(0)}% Albedo</strong>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-300">🌿 De-paving:</span>
                  <strong class="text-cyan-400">${(deltaNdbi * 100).toFixed(0)}% Impervious</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- ERA5 & Central Pollution Control Board (CPCB) Environmental Telemetry -->
          <div class="grid grid-cols-3 gap-1.5 bg-black/50 p-2 rounded-xl border border-white/10 text-[9px] text-center">
            <div>
              <span class="text-slate-400 font-bold block text-[8px] uppercase">Air Temp (ERA5)</span>
              <strong class="text-amber-300 font-black text-xs">${(zone.air_temp_c || (baselineLst - 3.8)).toFixed(1)}°C</strong>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[8px] uppercase">Humidity (CPCB)</span>
              <strong class="text-cyan-300 font-black text-xs">${(zone.humidity_pct || 42.5).toFixed(1)}%</strong>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[8px] uppercase">Wind Speed (ERA5)</span>
              <strong class="text-emerald-300 font-black text-xs">${(zone.wind_speed_ms || zone.wind_speed || 2.8).toFixed(1)} m/s</strong>
            </div>
          </div>
        </div>
      `;

      rect.bindTooltip(tooltipContent, { direction: 'top', sticky: true, opacity: 0.95 });

      rect.on('click', () => onSelectZone(zone.zone_id));
      rect.addTo(hotspotsLayerRef.current);
    });
  }, [zones, selectedZoneId, showHotspots, deltaNdvi, deltaAlbedo, deltaNdbi, userBudgetInr, userWaterLpd, onSelectZone]);

  // Helper to create custom HTML DivIcon for intervention markers
  const createInterventionIcon = (emoji, bgColor, borderColor) => {
    return L.divIcon({
      html: `<div style="background-color: ${bgColor}; border: 2px solid ${borderColor}; box-shadow: 0 0 10px ${borderColor};" class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition transform hover:scale-125 cursor-pointer">
              ${emoji}
            </div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Global handler to copy section code & auto-trigger Ask AI Copilot
  useEffect(() => {
    window.copyInterventionContext = (intervention, location, area, cost, water, impact, status, encodedReason) => {
      try {
        const reason = decodeURIComponent(encodedReason || '');
        const contextCode = `\`\`\`json
{
  "intervention": "${intervention}",
  "location": "${location}",
  "estimated_area_m2": ${area},
  "estimated_cost_inr": ${cost},
  "estimated_water_lpd": ${water},
  "modelled_cooling_impact_degC": ${impact},
  "suitability_status": "${status}",
  "reasoning": "${reason}"
}
\`\`\``;

        navigator.clipboard.writeText(contextCode).then(() => {
          window.dispatchEvent(new CustomEvent('ask-ai-context', { detail: contextCode }));
        }).catch(() => {
          window.dispatchEvent(new CustomEvent('ask-ai-context', { detail: contextCode }));
        });
      } catch (e) {
        console.error('Error copying intervention context:', e);
      }
    };

    return () => {
      delete window.copyInterventionContext;
    };
  }, []);

  // Helper to create exact prompt formatted popup content
  const renderPopupContent = (loc) => {
    const encodedReason = encodeURIComponent(loc.reason || '');
    return `
      <div class="p-3.5 font-sans bg-[#07080b]/65 backdrop-blur-md text-white rounded-2xl border border-white/15 shadow-2xl min-w-[240px]">
        <div class="text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-0.5">INTERVENTION</div>
        <div class="text-sm font-extrabold text-white mb-2 flex items-center gap-1.5">
          ${loc.intervention === 'Tree Planting' ? '🌳 Tree Planting' : loc.intervention === 'Cool Roofs' ? '🏠 Cool Roofs' : '🌿 Shade / Green Corridor'}
        </div>

        <div class="text-[9px] font-black text-slate-400 uppercase tracking-wider">LOCATION</div>
        <div class="text-xs font-bold text-slate-100 mb-2">${loc.location_type}</div>

        <div class="text-[9px] font-black text-slate-400 uppercase tracking-wider">REASON</div>
        <div class="text-[10px] font-semibold text-slate-300 italic bg-white/5 p-1.5 rounded-lg border border-white/5 mb-2.5">
          ${loc.reason}
        </div>

        <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-[#0e1117]/50 backdrop-blur-sm p-2 rounded-xl border border-white/10 mb-2.5">
          <div>
            <span class="text-slate-400 block font-bold">ESTIMATED AREA</span>
            <strong class="text-white text-xs font-black">${loc.estimated_area_m2.toLocaleString()} m²</strong>
          </div>
          <div>
            <span class="text-slate-400 block font-bold">ESTIMATED COST</span>
            <strong class="text-white text-xs font-black">${formatINR(loc.estimated_cost_inr)}</strong>
          </div>
          <div>
            <span class="text-slate-400 block font-bold">ESTIMATED WATER</span>
            <strong class="text-teal-400 text-xs font-black">${loc.estimated_water_lpd.toLocaleString()} L/day</strong>
          </div>
          <div>
            <span class="text-slate-400 block font-bold">MODELLED IMPACT</span>
            <strong class="text-[#b5f639] text-xs font-black">↓ ${loc.modelled_impact_degC}°C</strong>
          </div>
        </div>

        <div class="text-[9.5px] text-slate-400 text-center font-bold mb-2.5">
          Status: <span class="${loc.suitability_status === 'Suitable' ? 'text-emerald-400' : 'text-amber-400'}">${loc.suitability_status}</span>
        </div>

        <button
          onclick="window.copyInterventionContext('${loc.intervention}', '${loc.location_type}', ${loc.estimated_area_m2}, ${loc.estimated_cost_inr}, ${loc.estimated_water_lpd}, ${loc.modelled_impact_degC}, '${loc.suitability_status}', '${encodedReason}')"
          class="w-full py-1.5 px-3 bg-[#b5f639] hover:bg-[#c6ff4d] text-[#07080b] font-black text-[10.5px] rounded-xl shadow-[0_0_12px_rgba(181,246,57,0.3)] transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          📋 Copy Code for Ask AI
        </button>
      </div>
    `;
  };

  // 2. Render Intervention Marker Layers (Tree Planting, Cool Roofs, Green Corridors)
  useEffect(() => {
    if (!mapInstanceRef.current || !locationLayersData || !locationLayersData.layers) return;

    // Clear existing intervention markers
    if (treeLayerRef.current) treeLayerRef.current.clearLayers();
    if (coolRoofsLayerRef.current) coolRoofsLayerRef.current.clearLayers();
    if (corridorsLayerRef.current) corridorsLayerRef.current.clearLayers();

    const { tree_planting, cool_roofs, green_corridors } = locationLayersData.layers;

    // A. Render Tree Planting Layer
    if (showTreeLayer && tree_planting && treeLayerRef.current) {
      const treeIcon = createInterventionIcon('🌳', 'rgba(16, 185, 129, 0.9)', '#10b981');
      tree_planting.forEach((loc) => {
        const marker = L.marker([loc.coordinates.lat, loc.coordinates.lon], { icon: treeIcon });
        marker.bindPopup(renderPopupContent(loc));
        marker.on('click', () => onSelectZone(loc.zone_id));
        marker.addTo(treeLayerRef.current);
      });
    }

    // B. Render Cool Roofs Layer
    if (showCoolRoofsLayer && cool_roofs && coolRoofsLayerRef.current) {
      const roofIcon = createInterventionIcon('🏠', 'rgba(245, 158, 11, 0.9)', '#f59e0b');
      cool_roofs.forEach((loc) => {
        const marker = L.marker([loc.coordinates.lat, loc.coordinates.lon], { icon: roofIcon });
        marker.bindPopup(renderPopupContent(loc));
        marker.on('click', () => onSelectZone(loc.zone_id));
        marker.addTo(coolRoofsLayerRef.current);
      });
    }

    // C. Render Green Corridors Layer
    if (showCorridorsLayer && green_corridors && corridorsLayerRef.current) {
      const corridorIcon = createInterventionIcon('🌿', 'rgba(6, 182, 212, 0.9)', '#06b6d4');
      green_corridors.forEach((loc) => {
        const marker = L.marker([loc.coordinates.lat, loc.coordinates.lon], { icon: corridorIcon });
        marker.bindPopup(renderPopupContent(loc));
        marker.on('click', () => onSelectZone(loc.zone_id));
        marker.addTo(corridorsLayerRef.current);
      });
    }

  }, [locationLayersData, showTreeLayer, showCoolRoofsLayer, showCorridorsLayer, onSelectZone]);

  const mapCanvas = (
    <div className="w-full flex-1 flex flex-col justify-between relative min-h-[380px]">
      {/* Map Sub-Controls & Interactive Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 z-10">
        {/* Layer Checkbox Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#07080b]/90 backdrop-blur px-2 py-1 rounded-xl border border-white/10 text-xs shadow-md">
          <label className="flex items-center gap-1.5 text-slate-200 font-bold cursor-pointer hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="accent-[#b5f639] rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" /> Hotspots
            </span>
          </label>

          <label className="flex items-center gap-1.5 text-emerald-400 font-bold cursor-pointer hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={showTreeLayer}
              onChange={(e) => setShowTreeLayer(e.target.checked)}
              className="accent-emerald-400 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Trees className="w-3 h-3 text-emerald-400" /> Tree Planting
            </span>
          </label>

          <label className="flex items-center gap-1.5 text-amber-400 font-bold cursor-pointer hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={showCoolRoofsLayer}
              onChange={(e) => setShowCoolRoofsLayer(e.target.checked)}
              className="accent-amber-400 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Home className="w-3 h-3 text-amber-400" /> Cool Roofs
            </span>
          </label>

          <label className="flex items-center gap-1.5 text-cyan-400 font-bold cursor-pointer hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-white/5 transition">
            <input
              type="checkbox"
              checked={showCorridorsLayer}
              onChange={(e) => setShowCorridorsLayer(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" /> Green Corridors
            </span>
          </label>
        </div>

        {/* Map Tile Switcher */}
        <div className="flex items-center bg-[#07080b] p-0.5 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setMapStyle('satellite')}
            className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${mapStyle === 'satellite' ? 'bg-[#b5f639] text-[#07080b]' : 'text-slate-400 hover:text-white'
              }`}
          >
            <Globe className="w-3 h-3" />
            <span>Satellite HD</span>
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${mapStyle === 'street' ? 'bg-[#b5f639] text-[#07080b]' : 'text-slate-400 hover:text-white'
              }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Street Map</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[500px] sm:h-[580px] rounded-2xl overflow-hidden border border-white/10 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full relative z-0"></div>

        {/* Heat Intensity Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[400] bg-[#0e1117]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-[10px] shadow-lg">
          <span className="font-extrabold text-white text-[9px] uppercase tracking-wider">LST Temperature</span>
          <div className="flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" title="Cool <29°C" />
            <span className="text-slate-300">&lt;29°</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] ml-1" title="Warm 29-32°C" />
            <span className="text-slate-300">32°</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] ml-1" title="Moderate 32-35°C" />
            <span className="text-slate-300">35°</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] ml-1" title="Critical Hotspot >38°C" />
            <span className="text-slate-300">&gt;38°C</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (hideHeader) return mapCanvas;

  return (
    <div className="bento-card p-4 relative h-[360px] sm:h-[460px] flex flex-col overflow-hidden">
      {mapCanvas}
    </div>
  );
}
