import React, { useState } from 'react';
import { Sliders, Trees, Home, Shield, IndianRupee, ChevronDown, Droplets, AlertTriangle, CheckCircle2, HelpCircle, Sparkles, Target, Activity } from 'lucide-react';
import InterventionSuitabilityCard from './InterventionSuitabilityCard';
import ModelledImpactCard from './ModelledImpactCard';

export default function MitigationSandbox({
  city,
  zones,
  selectedZoneId,
  onSelectZone,
  deltaNdvi,
  onChangeNdvi,
  deltaAlbedo,
  onChangeAlbedo,
  deltaNdbi,
  onChangeNdbi,
  userBudgetInr = 1500000,
  onChangeBudget,
  userWaterLpd = 5000,
  onChangeWater,
  simulationData,
  costBreakdown,
  onApplyScenario
}) {
  const [activeTab, setActiveTab] = useState('impact'); // 'impact' | 'budget_water' | 'suitability'
  const [showAssumptions, setShowAssumptions] = useState(false);

  const hotspotZones = zones ? [...zones].sort((a, b) => b.lst - a.lst).slice(0, 20) : [];
  const budgetAnalysis = simulationData?.budget_analysis;
  const waterAnalysis = simulationData?.water_analysis;
  const totalCost = costBreakdown?.total_inr || budgetAnalysis?.total_estimated_cost_inr || 0;
  const requiredWater = waterAnalysis?.required_water_lpd || (deltaNdvi * 10000 * 12.5);

  const isBudgetExceeded = totalCost > userBudgetInr;
  const isWaterExceeded = requiredWater > userWaterLpd;

  // Auto-optimize feasible plan button handler
  const handleAutoOptimize = () => {
    const maxWaterNdvi = Math.min(0.40, (userWaterLpd / 12.5) / 10000.0);
    const treeCost = maxWaterNdvi * 10000 * 450;
    const remainingBudgetForRoofs = Math.max(0, userBudgetInr - treeCost);
    const maxRoofAlbedo = Math.min(0.35, (remainingBudgetForRoofs / 350) / 10000.0);

    onChangeNdvi(parseFloat(maxWaterNdvi.toFixed(2)));
    onChangeAlbedo(parseFloat(maxRoofAlbedo.toFixed(2)));
    onChangeNdbi(-0.05);
  };

  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className="bento-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div>
        {/* Sandbox Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#b5f639]/10 text-[#b5f639]">
              <Sliders className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight">Mitigation Sandbox</h3>
          </div>
          <span className="text-[10px] text-[#07080b] bg-[#b5f639] font-black px-2.5 py-0.5 rounded-full shadow">
            Physics & Constraint Engine
          </span>
        </div>

        {/* Target Zone Selection Dropdown */}
        <div className="my-3">
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            Target Hotspot Zone:
          </label>
          <div className="relative">
            <select
              value={selectedZoneId}
              onChange={(e) => onSelectZone(e.target.value)}
              className="w-full appearance-none bg-[#07080b] border border-white/10 text-slate-100 font-bold text-xs rounded-xl py-2.5 pl-3 pr-10 focus:border-[#b5f639] focus:outline-none cursor-pointer shadow-inner"
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
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.25, delta_albedo: 0.10, delta_ndbi: -0.10 })}
              className="px-2 py-1.5 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🌲 Max Trees
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.05, delta_albedo: 0.35, delta_ndbi: -0.05 })}
              className="px-2 py-1.5 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🏠 Cool Roofs
            </button>
            <button
              onClick={() => onApplyScenario({ delta_ndvi: 0.15, delta_albedo: 0.15, delta_ndbi: -0.25 })}
              className="px-2 py-1.5 bg-[#07080b] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate shadow"
            >
              🧱 De-Paving
            </button>
          </div>
        </div>

        {/* Physics Input Sliders */}
        <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/10 space-y-3 mb-4">
          {/* Slider 1: Tree Canopy */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-[#b5f639]" />
                Tree Canopy & Greening
              </label>
              <span className="text-[11px] font-black text-[#b5f639] bg-[#b5f639]/10 px-2 py-0.5 rounded-full border border-[#b5f639]/20">
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
              className="w-full cursor-pointer h-1.5"
            />
          </div>

          {/* Slider 2: Reflective Roofs */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-amber-400" />
                Reflective Cool Roofs
              </label>
              <span className="text-[11px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
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
              className="w-full cursor-pointer h-1.5"
            />
          </div>

          {/* Slider 3: Ground De-paving */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Permeable De-paving
              </label>
              <span className="text-[11px] font-black text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">
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
              className="w-full cursor-pointer h-1.5"
            />
          </div>
        </div>

        {/* Auto-Optimize Plan Banner if budget/water exceeded */}
        {(isBudgetExceeded || isWaterExceeded) && (
          <div className="mb-4">
            <button
              onClick={handleAutoOptimize}
              className="w-full py-2 px-3 bg-[#b5f639] hover:bg-[#c6ff4d] text-[#07080b] font-black text-xs rounded-xl shadow-[0_0_20px_rgba(181,246,57,0.3)] transition cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
            >
              <Sparkles className="w-4 h-4 text-[#07080b]" />
              <span>⚡ Auto-Optimize Feasible Plan</span>
            </button>
          </div>
        )}

        {/* Tabbed Navigation Bar for Sub-Panels */}
        <div className="flex items-center bg-[#07080b] p-1 rounded-full border border-white/10 text-xs mb-3">
          <button
            onClick={() => setActiveTab('impact')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'impact' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Impact</span>
          </button>

          <button
            onClick={() => setActiveTab('budget_water')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'budget_water' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Budget & Water</span>
          </button>

          <button
            onClick={() => setActiveTab('suitability')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'suitability' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Suitability</span>
          </button>
        </div>

        {/* Sub-Panel 1: Modelled Impact Estimation */}
        {activeTab === 'impact' && (
          <ModelledImpactCard
            simulationData={simulationData}
            selectedZoneId={selectedZoneId}
          />
        )}

        {/* Sub-Panel 2: Budget & Water Constraints */}
        {activeTab === 'budget_water' && (
          <div className="space-y-3">
            {/* Budget Input & Analysis */}
            <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <IndianRupee className="w-3.5 h-3.5 text-[#b5f639]" />
                  Available Budget (INR ₹)
                </label>
                <button
                  onClick={() => setShowAssumptions(!showAssumptions)}
                  className="text-[10px] font-bold text-[#b5f639] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{showAssumptions ? 'Hide Unit Rates' : 'Cost Rates'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userBudgetInr}
                  step="50000"
                  min="100000"
                  onChange={(e) => onChangeBudget(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-[#0e1117] border border-white/10 text-white font-black text-xs rounded-xl px-3 py-2 focus:border-[#b5f639] focus:outline-none"
                />
                <div className="flex gap-1 shrink-0">
                  {[1000000, 1500000, 2500000].map((b) => (
                    <button
                      key={b}
                      onClick={() => onChangeBudget(b)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        userBudgetInr === b
                          ? 'bg-[#b5f639] text-[#07080b] border-[#b5f639]'
                          : 'bg-[#0e1117] text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      ₹{b / 100000}L
                    </button>
                  ))}
                </div>
              </div>

              {showAssumptions && (
                <div className="p-2 rounded-xl bg-[#0e1117] border border-white/10 text-[10px] text-slate-300 space-y-0.5">
                  <div className="font-extrabold text-[#b5f639]">Planning Unit Cost Estimates:</div>
                  <div className="flex justify-between"><span>• Tree Greening:</span><strong>₹450 / m² (~₹4,500/tree)</strong></div>
                  <div className="flex justify-between"><span>• Cool Roofs:</span><strong>₹350 / m² coating</strong></div>
                  <div className="flex justify-between"><span>• De-Paving:</span><strong>₹850 / m² permeable pavers</strong></div>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-[#0e1117] border border-white/10 space-y-1 text-[11px]">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-400">Total Cost:</span>
                  <span className="text-white font-extrabold">{formatINR(totalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Budget Status:</span>
                  {isBudgetExceeded ? (
                    <span className="text-rose-400 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ⚠ Exceeded (+{formatINR(totalCost - userBudgetInr)})
                    </span>
                  ) : (
                    <span className="text-[#b5f639] font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ✓ Remaining: {formatINR(userBudgetInr - totalCost)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Water Input & Analysis */}
            <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  Available Water Limit (L/day)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userWaterLpd}
                  step="500"
                  min="500"
                  onChange={(e) => onChangeWater(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-[#0e1117] border border-white/10 text-white font-black text-xs rounded-xl px-3 py-2 focus:border-teal-400 focus:outline-none"
                />
                <div className="flex gap-1 shrink-0">
                  {[3000, 5000, 8000].map((w) => (
                    <button
                      key={w}
                      onClick={() => onChangeWater(w)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        userWaterLpd === w
                          ? 'bg-teal-400 text-[#07080b] border-teal-400'
                          : 'bg-[#0e1117] text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {(w / 1000).toFixed(0)}k L/d
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0e1117] border border-white/10 space-y-1 text-[11px]">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-400">Tree Canopy Water Required:</span>
                  <span className="text-white font-extrabold">{requiredWater.toLocaleString()} L/day</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Water Limit Status:</span>
                  {isWaterExceeded ? (
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ⚠ Exceeds Limit (+{(requiredWater - userWaterLpd).toFixed(0)} L/d)
                    </span>
                  ) : (
                    <span className="text-teal-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ✓ Within Water Limit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Panel 3: Intervention Suitability Check */}
        {activeTab === 'suitability' && (
          <InterventionSuitabilityCard city={city} selectedZoneId={selectedZoneId} />
        )}
      </div>
    </div>
  );
}
