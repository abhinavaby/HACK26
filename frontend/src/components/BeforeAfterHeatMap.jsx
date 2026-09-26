import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Globe, Map as MapIcon, Columns, Layers, Flame, Snowflake, Info, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BeforeAfterHeatMap({
  city,
  center,
  selectedZoneId,
  onSelectZone,
  deltaNdvi = 0.15,
  deltaAlbedo = 0.20,
  deltaNdbi = -0.10
}) {
  const [comparisonData, setComparisonData] = useState(null);
  const [viewMode, setViewMode] = useState('side_by_side'); // 'side_by_side' | 'difference'
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'street'

  // Map container refs
  const mapLeftRef = useRef(null);
  const mapRightRef = useRef(null);
  const mapDiffRef = useRef(null);

  // Map instance refs
  const instanceLeftRef = useRef(null);
  const instanceRightRef = useRef(null);
  const instanceDiffRef = useRef(null);

  const tileLeftRef = useRef(null);
  const tileRightRef = useRef(null);
  const tileDiffRef = useRef(null);

  const layerGroupLeftRef = useRef(null);
  const layerGroupRightRef = useRef(null);
  const layerGroupDiffRef = useRef(null);

  const isSyncingRef = useRef(false);

  const getTileUrl = (style) => {
    switch (style) {
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'satellite':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  // Color mapping functions
  const getLSTColor = (lst) => {
    if (lst > 38.0) return '#ef4444'; // Red
    if (lst > 35.0) return '#f97316'; // Orange
    if (lst > 32.0) return '#f59e0b'; // Amber
    if (lst > 29.0) return '#eab308'; // Yellow
    return '#10b981';                // Green
  };

  const getCoolingColor = (drop) => {
    if (drop > 3.0) return '#06b6d4'; // Cyan - High Cooling
    if (drop > 1.5) return '#14b8a6'; // Teal - Moderate Cooling
    if (drop > 0.5) return '#64748b'; // Slate - Low Cooling
    return '#334155';                // Dark Muted - Minimal
  };

  // Fetch Spatial Grid Comparison Data
  useEffect(() => {
    fetch('http://localhost:8000/api/spatial-comparison', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        delta_ndvi: deltaNdvi,
        delta_albedo: deltaAlbedo,
        delta_ndbi: deltaNdbi
      })
    })
      .then((res) => res.json())
      .then((data) => setComparisonData(data))
      .catch((err) => console.error('Error fetching spatial comparison:', err));
  }, [city, deltaNdvi, deltaAlbedo, deltaNdbi]);

  // Synchronize Leaflet map movements between Left & Right maps
  const syncMaps = (sourceMap, targetMap) => {
    if (!sourceMap || !targetMap || isSyncingRef.current) return;
    sourceMap.on('move', () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      targetMap.setView(sourceMap.getCenter(), sourceMap.getZoom(), { animate: false });
      isSyncingRef.current = false;
    });
  };

  // Initialize Side-by-Side Maps
  useEffect(() => {
    if (viewMode !== 'side_by_side') return;
    if (!mapLeftRef.current || !mapRightRef.current) return;

    // Safely cleanup old map instances if present
    if (instanceLeftRef.current) {
      try { instanceLeftRef.current.remove(); } catch (e) {}
      instanceLeftRef.current = null;
    }
    if (instanceRightRef.current) {
      try { instanceRightRef.current.remove(); } catch (e) {}
      instanceRightRef.current = null;
    }

    // Initialize Left Map (Before)
    const mapL = L.map(mapLeftRef.current, {
      center: [center.lat, center.lon],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: 'topright' }).addTo(mapL);
    tileLeftRef.current = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapL);
    layerGroupLeftRef.current = L.layerGroup().addTo(mapL);
    instanceLeftRef.current = mapL;

    // Initialize Right Map (After)
    const mapR = L.map(mapRightRef.current, {
      center: [center.lat, center.lon],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: 'topright' }).addTo(mapR);
    tileRightRef.current = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapR);
    layerGroupRightRef.current = L.layerGroup().addTo(mapR);
    instanceRightRef.current = mapR;

    // Direct synchronization handlers
    let isSyncing = false;
    const syncLtoR = () => {
      if (isSyncing) return;
      isSyncing = true;
      mapR.setView(mapL.getCenter(), mapL.getZoom(), { animate: false });
      isSyncing = false;
    };
    const syncRtoL = () => {
      if (isSyncing) return;
      isSyncing = true;
      mapL.setView(mapR.getCenter(), mapR.getZoom(), { animate: false });
      isSyncing = false;
    };

    mapL.on('move', syncLtoR);
    mapR.on('move', syncRtoL);

    // Timed size invalidation checks for smooth layout calculation
    const timers = [
      setTimeout(() => { mapL.invalidateSize(); mapR.invalidateSize(); }, 50),
      setTimeout(() => { mapL.invalidateSize(); mapR.invalidateSize(); }, 200),
      setTimeout(() => { mapL.invalidateSize(); mapR.invalidateSize(); }, 500)
    ];

    // ResizeObserver for responsive layout recalculation
    let ro = null;
    if (window.ResizeObserver && mapLeftRef.current) {
      ro = new ResizeObserver(() => {
        mapL.invalidateSize();
        mapR.invalidateSize();
      });
      ro.observe(mapLeftRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (ro) ro.disconnect();
      mapL.off('move', syncLtoR);
      mapR.off('move', syncRtoL);
      try { mapL.remove(); } catch (e) {}
      try { mapR.remove(); } catch (e) {}
      instanceLeftRef.current = null;
      instanceRightRef.current = null;
    };
  }, [center.lat, center.lon, viewMode]);

  // Initialize Difference Map
  useEffect(() => {
    if (viewMode !== 'difference') return;
    if (!mapDiffRef.current) return;

    if (instanceDiffRef.current) {
      try { instanceDiffRef.current.remove(); } catch (e) {}
      instanceDiffRef.current = null;
    }

    const mapD = L.map(mapDiffRef.current, {
      center: [center.lat, center.lon],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });
    L.control.zoom({ position: 'topright' }).addTo(mapD);
    tileDiffRef.current = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(mapD);
    layerGroupDiffRef.current = L.layerGroup().addTo(mapD);
    instanceDiffRef.current = mapD;

    const timers = [
      setTimeout(() => mapD.invalidateSize(), 50),
      setTimeout(() => mapD.invalidateSize(), 200),
      setTimeout(() => mapD.invalidateSize(), 500)
    ];

    let ro = null;
    if (window.ResizeObserver && mapDiffRef.current) {
      ro = new ResizeObserver(() => mapD.invalidateSize());
      ro.observe(mapDiffRef.current);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (ro) ro.disconnect();
      try { mapD.remove(); } catch (e) {}
      instanceDiffRef.current = null;
    };
  }, [center.lat, center.lon, viewMode]);

  // Handle Tile Style changes across maps
  useEffect(() => {
    const updateTile = (map, tileRef) => {
      if (!map || !tileRef.current) return;
      map.removeLayer(tileRef.current);
      tileRef.current = L.tileLayer(getTileUrl(mapStyle), { maxZoom: 19 }).addTo(map);
    };

    updateTile(instanceLeftRef.current, tileLeftRef);
    updateTile(instanceRightRef.current, tileRightRef);
    updateTile(instanceDiffRef.current, tileDiffRef);
  }, [mapStyle]);

  // Render Rectangles on Maps
  useEffect(() => {
    if (!comparisonData || !comparisonData.zones) return;
    const step = 0.0017;

    // 1. Render Left Map (BEFORE)
    if (viewMode === 'side_by_side' && layerGroupLeftRef.current) {
      layerGroupLeftRef.current.clearLayers();
      comparisonData.zones.forEach((z) => {
        const isSelected = z.zone_id === selectedZoneId;
        const color = getLSTColor(z.baseline_lst);
        const bounds = [[z.lat - step, z.lon - step], [z.lat + step, z.lon + step]];

        const rect = L.rectangle(bounds, {
          color: isSelected ? '#b5f639' : color,
          weight: isSelected ? 3.5 : 0.8,
          fillColor: color,
          fillOpacity: isSelected ? 0.85 : 0.55
        });

        rect.bindTooltip(
          `<div class="p-2 font-sans bg-[#0e1117] text-white rounded-xl border border-white/10 shadow-2xl">
            <div class="font-extrabold text-xs text-rose-400">BEFORE: ${z.zone_id}</div>
            <div class="text-sm font-black text-white">${z.baseline_lst}°C</div>
            <div class="text-[10px] text-slate-400">Baseline Surface LST</div>
          </div>`,
          { direction: 'top', sticky: true }
        );
        rect.on('click', () => onSelectZone(z.zone_id));
        rect.addTo(layerGroupLeftRef.current);
      });
    }

    // 2. Render Right Map (AFTER)
    if (viewMode === 'side_by_side' && layerGroupRightRef.current) {
      layerGroupRightRef.current.clearLayers();
      comparisonData.zones.forEach((z) => {
        const isSelected = z.zone_id === selectedZoneId;
        const color = getLSTColor(z.simulated_lst);
        const bounds = [[z.lat - step, z.lon - step], [z.lat + step, z.lon + step]];

        const rect = L.rectangle(bounds, {
          color: isSelected ? '#b5f639' : color,
          weight: isSelected ? 3.5 : 0.8,
          fillColor: color,
          fillOpacity: isSelected ? 0.85 : 0.55
        });

        rect.bindTooltip(
          `<div class="p-2 font-sans bg-[#0e1117] text-white rounded-xl border border-white/10 shadow-2xl">
            <div class="font-extrabold text-xs text-[#b5f639]">AFTER: ${z.zone_id}</div>
            <div class="text-sm font-black text-[#b5f639]">${z.simulated_lst}°C</div>
            <div class="text-[10px] text-emerald-400 font-bold">Modelled Reduction: ↓${z.cooling_impact}°C</div>
          </div>`,
          { direction: 'top', sticky: true }
        );
        rect.on('click', () => onSelectZone(z.zone_id));
        rect.addTo(layerGroupRightRef.current);
      });
    }

    // 3. Render Difference Map (COOLING IMPACT)
    if (viewMode === 'difference' && layerGroupDiffRef.current) {
      layerGroupDiffRef.current.clearLayers();
      comparisonData.zones.forEach((z) => {
        const isSelected = z.zone_id === selectedZoneId;
        const color = getCoolingColor(z.cooling_impact);
        const bounds = [[z.lat - step, z.lon - step], [z.lat + step, z.lon + step]];

        const rect = L.rectangle(bounds, {
          color: isSelected ? '#b5f639' : color,
          weight: isSelected ? 3.5 : 0.8,
          fillColor: color,
          fillOpacity: isSelected ? 0.85 : 0.65
        });

        rect.bindTooltip(
          `<div class="p-2 font-sans bg-[#0e1117] text-white rounded-xl border border-white/10 shadow-2xl">
            <div class="font-extrabold text-xs text-cyan-400">COOLING IMPACT: ${z.zone_id}</div>
            <div class="text-sm font-black text-cyan-300">↓ ${z.cooling_impact}°C Drop</div>
            <div class="text-[10px] text-slate-300">Baseline ${z.baseline_lst}°C → Scenario ${z.simulated_lst}°C</div>
          </div>`,
          { direction: 'top', sticky: true }
        );
        rect.on('click', () => onSelectZone(z.zone_id));
        rect.addTo(layerGroupDiffRef.current);
      });
    }

  }, [comparisonData, viewMode, selectedZoneId, onSelectZone]);

  const summary = comparisonData?.summary;

  return (
    <div className="w-full flex-1 flex flex-col justify-between space-y-3">
      {/* Top Header Controls & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#07080b] p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                viewMode === 'side_by_side' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side View</span>
            </button>
            <button
              onClick={() => setViewMode('difference')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                viewMode === 'difference' ? 'bg-cyan-400 text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Cooling Impact Difference Map</span>
            </button>
          </div>
        </div>

        {/* Satellite vs Street Map Switcher */}
        <div className="flex items-center bg-[#07080b] p-0.5 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setMapStyle('satellite')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
              mapStyle === 'satellite' ? 'bg-white text-[#07080b]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Satellite HD</span>
          </button>
          <button
            onClick={() => setMapStyle('street')}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
              mapStyle === 'street' ? 'bg-white text-[#07080b]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Street</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0e1117] border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Baseline LST Range</span>
            <div className="text-white font-extrabold text-xs mt-0.5">
              {summary.baseline.min_lst}°C – {summary.baseline.max_lst}°C
            </div>
            <span className="text-[9px] text-slate-400">Mean: {summary.baseline.mean_lst}°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0e1117] border border-[#b5f639]/30">
            <span className="text-[10px] text-[#b5f639] font-bold uppercase block">Modelled LST Range</span>
            <div className="text-white font-extrabold text-xs mt-0.5">
              {summary.simulated.min_lst}°C – {summary.simulated.max_lst}°C
            </div>
            <span className="text-[9px] text-slate-400">Mean: {summary.simulated.mean_lst}°C</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#b5f639]/10 border border-[#b5f639] text-[#07080b]">
            <span className="text-[10px] font-black uppercase text-[#07080b] block">Estimated Average Change</span>
            <div className="text-lg font-black text-[#b5f639]">
              ↓ {summary.estimated_avg_change_degC.toFixed(2)}°C
            </div>
            <span className="text-[9px] font-bold text-slate-300">City-wide Mean Drop</span>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <span className="text-[10px] text-cyan-300 font-bold uppercase block">Max Cooling Hotspot</span>
            <div className="text-lg font-black text-cyan-400">
              ↓ {summary.max_cooling_spot_degC.toFixed(2)}°C
            </div>
            <span className="text-[9px] text-slate-400">Peak Modelled Reduction</span>
          </div>
        </div>
      )}

      {/* Map Views Container */}
      {viewMode === 'side_by_side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[480px]">
          {/* Left Map: BEFORE */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1117] h-[480px]">
            <div className="absolute top-2.5 left-2.5 z-[400] bg-[#07080b]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-rose-500/40 text-xs font-black text-rose-400 flex items-center gap-1.5 shadow-lg pointer-events-none">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>BEFORE: Current Baseline Heat</span>
            </div>
            <div ref={mapLeftRef} className="w-full h-full relative z-0"></div>
          </div>

          {/* Right Map: AFTER */}
          <div className="relative rounded-2xl overflow-hidden border border-[#b5f639]/30 bg-[#0e1117] h-[480px]">
            <div className="absolute top-2.5 left-2.5 z-[400] bg-[#07080b]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-[#b5f639]/40 text-xs font-black text-[#b5f639] flex items-center gap-1.5 shadow-lg pointer-events-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b5f639]" />
              <span>AFTER: Modelled Post-Intervention Heat</span>
            </div>
            <div ref={mapRightRef} className="w-full h-full relative z-0"></div>
          </div>
        </div>
      ) : (
        /* Difference Map View */
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0e1117] h-[480px] min-h-[480px]">
          <div className="absolute top-2.5 left-2.5 z-[400] bg-[#07080b]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-cyan-500/40 text-xs font-black text-cyan-300 flex items-center gap-1.5 shadow-lg pointer-events-none">
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
            <span>COOLING IMPACT: Baseline LST - Modelled LST (Spatial Drop Δ°C)</span>
          </div>
          <div ref={mapDiffRef} className="w-full h-full relative z-0"></div>
        </div>
      )}

      {/* Common Uniform Color Legend */}
      <div className="bg-[#0e1117] p-2.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white text-[9px] uppercase tracking-wider">
            {viewMode === 'side_by_side' ? 'LST Temperature Scale:' : 'Cooling Drop Intensity Scale:'}
          </span>
          {viewMode === 'side_by_side' ? (
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> &lt;29°C (Cool)
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> 29–32°C
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> 32–35°C
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> 35–38°C
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> &gt;38°C (Hotspot)
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" /> &gt;3.0°C Drop (High)
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" /> 1.5–3.0°C Drop
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> 0.5–1.5°C Drop
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" /> &lt;0.5°C (Minimal)
              </span>
            </div>
          )}
        </div>

        <span className="text-[9px] text-slate-400 italic">
          Synchronized Map Projections (~30m spatial resolution)
        </span>
      </div>
    </div>
  );
}
