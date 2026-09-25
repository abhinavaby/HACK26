import React, { useState, useEffect } from 'react';
import { Award, Sliders, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Info, Filter, Zap } from 'lucide-react';

export default function PriorityHotspotsPanel({
  city,
  selectedZoneId,
  onSelectZone,
  hideHeader = false
}) {
  // Configurable Weight Planning Assumptions (Percentages)
  const [weightHeat, setWeightHeat] = useState(40);
  const [weightVeg, setWeightVeg] = useState(25);
  const [weightBuilt, setWeightBuilt] = useState(20);
  const [weightOpp, setWeightOpp] = useState(15);

  const [showWeightsControl, setShowWeightsControl] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'High Priority' | 'Medium Priority' | 'Lower Priority'
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Priority Hotspots Data from API
  useEffect(() => {
    setIsLoading(true);
    const url = `http://localhost:8000/api/priority-hotspots?city=${city}&weight_heat=${weightHeat / 100}&weight_veg=${weightVeg / 100}&weight_built=${weightBuilt / 100}&weight_opp=${weightOpp / 100}`;
    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Priority hotspots fetch error:', err);
        setIsLoading(false);
      });
  }, [city, weightHeat, weightVeg, weightBuilt, weightOpp]);

  // Handle Preset Weight Profiles
  const applyPreset = (h, v, b, o) => {
    setWeightHeat(h);
    setWeightVeg(v);
    setWeightBuilt(b);
    setWeightOpp(o);
  };

  const hotspots = data?.hotspots || [];
  const filteredHotspots = categoryFilter === 'All'
    ? hotspots
    : hotspots.filter((h) => h.priority_category === categoryFilter);

  const summary = data?.summary || {};

  const mainPanel = (
    <div className="w-full flex-1 flex flex-col justify-between space-y-3">
      {/* Header & Configurable Weights Controls Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#b5f639]/10 text-[#b5f639]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              Priority Hotspot Identification
              <span className="text-[10px] font-black text-[#07080b] bg-[#b5f639] px-2 py-0.5 rounded-full">
                Multi-Factor Score
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Transparent decision matrix based on planning assumption weights
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightsControl(!showWeightsControl)}
          className="px-2.5 py-1 bg-[#07080b] hover:bg-[#b5f639] text-[#b5f639] hover:text-[#07080b] border border-[#b5f639]/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showWeightsControl ? 'Hide Weighting Sliders' : 'Configure Factor Weights'}</span>
        </button>
      </div>

      {/* Expandable Configurable Factor Weights Control Panel */}
      {showWeightsControl && (
        <div className="p-3.5 rounded-2xl bg-[#0e1117] border border-[#b5f639]/30 space-y-3 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <span className="text-xs font-extrabold text-[#b5f639] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Configurable Planning Weights:
            </span>

            {/* Presets Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => applyPreset(40, 25, 20, 15)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 hover:bg-[#b5f639] text-white hover:text-[#07080b] transition"
              >
                ⚖ Balanced (40/25/20/15)
              </button>
              <button
                onClick={() => applyPreset(60, 20, 10, 10)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 hover:bg-rose-400 text-white hover:text-[#07080b] transition"
              >
                🔥 Heat Severe (60/20/10/10)
              </button>
              <button
                onClick={() => applyPreset(25, 45, 15, 15)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-400 text-white hover:text-[#07080b] transition"
              >
                🌲 Greening (25/45/15/15)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Weight 1: Heat Severity */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>🔥 Heat Severity Weight:</span>
                <strong className="text-rose-400 font-extrabold">{weightHeat}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={weightHeat}
                onChange={(e) => setWeightHeat(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-1.5"
              />
            </div>

            {/* Weight 2: Vegetation Deficiency */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>🌲 Vegetation Deficiency Weight:</span>
                <strong className="text-emerald-400 font-extrabold">{weightVeg}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={weightVeg}
                onChange={(e) => setWeightVeg(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-1.5"
              />
            </div>

            {/* Weight 3: Built-up Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>🏢 Built-Up Intensity Weight:</span>
                <strong className="text-amber-400 font-extrabold">{weightBuilt}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={weightBuilt}
                onChange={(e) => setWeightBuilt(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-1.5"
              />
            </div>

            {/* Weight 4: Intervention Opportunity */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300 font-semibold">
                <span>✨ Intervention Opportunity Weight:</span>
                <strong className="text-cyan-400 font-extrabold">{weightOpp}%</strong>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={weightOpp}
                onChange={(e) => setWeightOpp(parseFloat(e.target.value))}
                className="w-full cursor-pointer h-1.5"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-white/5">
            {data?.disclaimer || "Planning assumption weights — priority score is a multi-criteria decision tool, not an objective universal truth."}
          </div>
        </div>
      )}

      {/* Category Filter Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center bg-[#07080b] p-1 rounded-full border border-white/10 text-xs">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'All' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({summary.total_hotspots_evaluated || 0})
          </button>
          <button
            onClick={() => setCategoryFilter('High Priority')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'High Priority' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 High ({summary.high_priority_count || 0})
          </button>
          <button
            onClick={() => setCategoryFilter('Medium Priority')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'Medium Priority' ? 'bg-amber-500 text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ Medium ({summary.medium_priority_count || 0})
          </button>
          <button
            onClick={() => setCategoryFilter('Lower Priority')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
              categoryFilter === 'Lower Priority' ? 'bg-slate-700 text-slate-200 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lower ({summary.lower_priority_count || 0})
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-semibold">
          Showing top {filteredHotspots.slice(0, 15).length} of {filteredHotspots.length} matching
        </span>
      </div>

      {/* Hotspots Card List */}
      <div className="overflow-y-auto max-h-[380px] space-y-2.5 pr-1">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">
            Calculating Multi-Factor Priority Scores...
          </div>
        ) : filteredHotspots.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hotspots found matching selected category filter.
          </div>
        ) : (
          filteredHotspots.slice(0, 15).map((h) => {
            const isSelected = h.zone_id === selectedZoneId;
            const f = h.factors;

            return (
              <div
                key={h.zone_id}
                onClick={() => onSelectZone(h.zone_id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#b5f639]/10 border-[#b5f639] shadow-[0_0_20px_rgba(181,246,57,0.15)]'
                    : 'bg-[#0e1117] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Hotspot Header Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white px-2 py-0.5 rounded-lg bg-white/10">
                      #{h.rank}
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {h.hotspot_name}
                    </span>
                    <span className="text-xs text-rose-400 font-extrabold">
                      {h.current_lst_degC}°C LST
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Score: <strong className="text-white text-xs">{h.priority_score.toFixed(2)}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow ${
                        h.priority_category === 'High Priority'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : h.priority_category === 'Medium Priority'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {h.priority_category}
                    </span>
                  </div>
                </div>

                {/* Factors Matrix Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {/* Factor 1: Heat */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Heat Severity</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-extrabold">{f.heat_severity.label}</strong>
                      <span className="text-[10px] text-rose-400 font-bold">{f.heat_severity.raw_value}</span>
                    </div>
                  </div>

                  {/* Factor 2: Vegetation */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Veg. Deficiency</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-extrabold">{f.vegetation_deficiency.label}</strong>
                      <span className="text-[10px] text-emerald-400 font-bold">{f.vegetation_deficiency.raw_value}</span>
                    </div>
                  </div>

                  {/* Factor 3: Built-up */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Built-Up Intensity</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-extrabold">{f.built_up_intensity.label}</strong>
                      <span className="text-[10px] text-amber-400 font-bold">{f.built_up_intensity.raw_value}</span>
                    </div>
                  </div>

                  {/* Factor 4: Opportunity */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Intervention Opp.</span>
                    <div className="flex items-center justify-between">
                      <strong className="text-white font-extrabold">{f.intervention_opportunity.label}</strong>
                      <span className="text-[10px] text-cyan-400 font-bold truncate">{f.intervention_opportunity.raw_value}</span>
                    </div>
                  </div>
                </div>

                {/* Target Action Button */}
                <div className="mt-2.5 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectZone(h.zone_id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#b5f639] text-[#07080b] shadow-[0_0_10px_rgba(181,246,57,0.3)]'
                        : 'bg-[#141822] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10'
                    }`}
                  >
                    <span>{isSelected ? 'Active Target (Map Highlighted)' : 'Select & Highlight Map'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (hideHeader) return mainPanel;

  return (
    <div className="bento-card p-4 sm:p-5 h-[360px] sm:h-[460px] flex flex-col justify-between overflow-hidden">
      {mainPanel}
    </div>
  );
}
