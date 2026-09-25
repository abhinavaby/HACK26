import React from 'react';
import { Sliders, Trees, Home, Shield, IndianRupee, ChevronDown } from 'lucide-react';

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
    <div className="bento-card p-5 flex flex-col justify-between space-y-4">
      <div>
        {/* Sandbox Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#b5f639]/10 text-[#b5f639]">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight">Mitigation Sandbox</h3>
          </div>
          <span className="text-[10px] text-[#07080b] bg-[#b5f639] font-black px-2.5 py-0.5 rounded-full shadow">
            Live Physics Engine
          </span>
        </div>

        {/* Custom Modern Select Dropdown for Target Zone */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Target Zone:
          </label>
          <div className="relative">
            <select
              value={selectedZoneId}
              onChange={(e) => onSelectZone(e.target.value)}
              className="w-full appearance-none bg-[#07080b] border border-white/10 text-slate-100 font-bold text-xs rounded-xl py-3 pl-3 pr-10 focus:border-[#b5f639] focus:outline-none cursor-pointer shadow-inner"
            >
              {hotspotZones.map((z) => (
                <option key={z.zone_id} value={z.zone_id} className="bg-[#0e1117] text-white">
                  {z.zone_id} ({z.lst}°C Baseline LST)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Action Presets */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Quick Preset Interventions:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.25, delta_albedo: 0.10, delta_ndbi: -0.10 })}
              className="px-2.5 py-2 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🌲 Max Trees
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.05, delta_albedo: 0.35, delta_ndbi: -0.05 })}
              className="px-2.5 py-2 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🏠 Cool Roofs
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.15, delta_albedo: 0.15, delta_ndbi: -0.25 })}
              className="px-2.5 py-2 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🧱 De-Paving
            </button>
          </div>
        </div>

        {/* User-Friendly Slider 1: Tree Canopy */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-[#b5f639]" />
              Tree Canopy & Greening
            </label>
            <span className="text-xs font-black text-[#b5f639] bg-[#b5f639]/10 px-2.5 py-0.5 rounded-full border border-[#b5f639]/20">
              +{(deltaNdvi * 100).toFixed(0)}% Cover
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.40"
            step="0.05"
            value={deltaNdvi}
            onChange={(e) => onChangeNdvi(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-2"
          />
        </div>

        {/* User-Friendly Slider 2: Reflective Roofs */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-amber-400" />
              Reflective Solar Cool Roofs
            </label>
            <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              +{(deltaAlbedo * 100).toFixed(0)}% Reflectance
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.40"
            step="0.05"
            value={deltaAlbedo}
            onChange={(e) => onChangeAlbedo(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-2"
          />
        </div>

        {/* User-Friendly Slider 3: Ground De-paving */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-400" />
              Permeable Ground / De-paving
            </label>
            <span className="text-xs font-black text-rose-400 bg-rose-400/10 px-2.5 py-0.5 rounded-full border border-rose-400/20">
              {(deltaNdbi * 100).toFixed(0)}% Asphalt
            </span>
          </div>
          <input
            type="range"
            min="-0.30"
            max="0.0"
            step="0.05"
            value={deltaNdbi}
            onChange={(e) => onChangeNdbi(parseFloat(e.target.value))}
            className="w-full cursor-pointer h-2"
          />
        </div>
      </div>

      {/* Clean Capital Budget Summary Box */}
      <div className="bg-[#07080b]/90 p-3.5 rounded-2xl border border-white/10 text-xs shadow-inner">
        <div className="flex justify-between items-center text-slate-300 font-bold">
          <span className="flex items-center gap-1.5 text-slate-300">
            <IndianRupee className="w-4 h-4 text-[#b5f639]" /> Capital Expenditure Budget:
          </span>
          <span className="text-[#b5f639] font-black text-base">
            ₹{(costBreakdown?.total_inr || costBreakdown?.total_usd || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
