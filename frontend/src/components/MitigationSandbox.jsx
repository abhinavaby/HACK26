import React from 'react';
import { Sliders, Trees, Home, Shield, DollarSign, Sparkles } from 'lucide-react';

export default function MitigationSandbox({
  zones,
  selectedZoneId,
  onSelectZone,
  deltaNdvi,
  onChangeNdvi,
  deltaAlbedo,
  onChangeAlbedo,
  deltaNdbi,
  onChangeNdbi,
  costBreakdown,
  onApplyScenario
}) {
  const hotspotZones = zones ? [...zones].sort((a, b) => b.lst - a.lst).slice(0, 20) : [];

  return (
    <div className="glass-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div>
        {/* Sandbox Title */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">Mitigation Sandbox</h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
            Live AI Physics
          </span>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            ⚡ Quick Policy Actions:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.25, delta_albedo: 0.10, delta_ndbi: -0.10 })}
              className="px-2 py-1 bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-300 border border-slate-800 rounded text-[11px] font-medium transition cursor-pointer text-center truncate"
            >
              🌲 Max Trees
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.05, delta_albedo: 0.35, delta_ndbi: -0.05 })}
              className="px-2 py-1 bg-slate-900 hover:bg-sky-900/40 text-slate-300 hover:text-sky-300 border border-slate-800 rounded text-[11px] font-medium transition cursor-pointer text-center truncate"
            >
              🏠 Cool Roofs
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.15, delta_albedo: 0.15, delta_ndbi: -0.25 })}
              className="px-2 py-1 bg-slate-900 hover:bg-amber-900/40 text-slate-300 hover:text-amber-300 border border-slate-800 rounded text-[11px] font-medium transition cursor-pointer text-center truncate col-span-2 sm:col-span-1"
            >
              🧱 De-Paving
            </button>
          </div>
        </div>

        {/* Target Zone Picker */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            🎯 Target Hotspot Zone:
          </label>
          <select
            value={selectedZoneId}
            onChange={(e) => onSelectZone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:border-emerald-500 focus:outline-none cursor-pointer"
          >
            {hotspotZones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.zone_id} ({z.lst}°C Surface Temp)
              </option>
            ))}
          </select>
        </div>

        {/* Slider 1: Urban Greening */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              Urban Canopy (Δ NDVI)
            </label>
            <span className="text-xs font-bold text-emerald-400">
              +{deltaNdvi.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.40"
            step="0.05"
            value={deltaNdvi}
            onChange={(e) => onChangeNdvi(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-emerald-500 h-2"
          />
        </div>

        {/* Slider 2: Cool Roofs */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-sky-400" />
              Cool Roof Coating (Δ Albedo)
            </label>
            <span className="text-xs font-bold text-sky-400">
              +{deltaAlbedo.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.40"
            step="0.05"
            value={deltaAlbedo}
            onChange={(e) => onChangeAlbedo(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-sky-500 h-2"
          />
        </div>

        {/* Slider 3: De-paving */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Permeable Surfaces (Δ NDBI)
            </label>
            <span className="text-xs font-bold text-amber-400">
              {deltaNdbi.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="-0.30"
            max="0.0"
            step="0.05"
            value={deltaNdbi}
            onChange={(e) => onChangeNdbi(parseFloat(e.target.value))}
            className="w-full cursor-pointer accent-amber-500 h-2"
          />
        </div>
      </div>

      {/* Simplified Budget Summary Box */}
      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-xs">
        <div className="flex justify-between items-center text-slate-300 font-semibold mb-1">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Estimated Budget:
          </span>
          <span className="text-emerald-400 font-bold">
            ${(costBreakdown?.total_usd || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
