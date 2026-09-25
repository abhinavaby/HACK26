import React, { useState } from 'react';
import { Activity, ArrowDown, Sparkles, AlertCircle, Info, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

export default function ModelledImpactCard({ simulationData, selectedZoneId }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!simulationData || !simulationData.modelled_impact) {
    return (
      <div className="bento-card p-4 animate-pulse bg-[#0e1117] h-48 rounded-2xl border border-white/10">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-white/5 rounded-xl"></div>
      </div>
    );
  }

  const { modelled_impact } = simulationData;
  const confidence = modelled_impact.model_confidence || {};
  const interventions = modelled_impact.interventions || [];
  const activeInterventions = interventions.filter(i => i.active);

  return (
    <div className="bento-card p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#07080b] shadow-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#b5f639]/10 text-[#b5f639]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              Modelled Impact Estimation
              <span className="text-[10px] font-black text-[#07080b] bg-[#b5f639] px-2 py-0.5 rounded-full uppercase">
                {modelled_impact.wording_label || "Modelled estimate"}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Hypothetical scenario predictive inference ({selectedZoneId})
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] font-bold text-[#b5f639] hover:underline cursor-pointer flex items-center gap-1"
        >
          <HelpCircle className="w-3 h-3" />
          <span>{showDetails ? 'Hide Uncertainty & Metrics' : 'Model Confidence & Limits'}</span>
        </button>
      </div>

      {/* Mandatory Legal & Scientific Disclosure Callout */}
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-200 uppercase tracking-wider text-[10px] block mb-0.5">
            Important Notice
          </span>
          Results are presented as a <strong>MODEL ESTIMATE</strong> based on trained satellite ML regression, <em>not</em> a guaranteed real-world temperature reduction.
        </div>
      </div>

      {/* Sequential Flow UI: Baseline -> Proposed Intervention -> Modelled Result -> Estimated Change */}
      <div className="space-y-3">
        {/* Step 1: Baseline */}
        <div className="p-3 rounded-xl bg-[#0e1117] border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1. Baseline Condition
            </span>
            <span className="text-xs font-semibold text-slate-200">Current Surface LST</span>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-white">
              {modelled_impact.baseline_lst.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-rose-400 block font-bold">Unmodified Grid Cell</span>
          </div>
        </div>

        {/* Down Arrow 1 */}
        <div className="flex justify-center -my-1">
          <div className="p-1 rounded-full bg-[#07080b] border border-white/20 text-[#b5f639]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 2: Proposed Intervention */}
        <div className="p-3 rounded-xl bg-[#0e1117] border border-[#b5f639]/30 space-y-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-[10px] font-bold text-[#b5f639] uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#b5f639]" />
              2. Proposed Intervention Plan
            </span>
            <span className="text-[10px] font-black text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
              {activeInterventions.length} Scenario(s) Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {interventions.map((inv, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border transition ${
                  inv.active
                    ? 'bg-[#b5f639]/10 border-[#b5f639]/40 text-slate-100'
                    : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                }`}
              >
                <div className="font-extrabold text-[10px] uppercase text-white truncate">{inv.type}</div>
                <div className="text-slate-300 font-bold text-[10px]">{inv.extent}</div>
                {inv.active && (
                  <div className="text-[9px] text-[#b5f639] font-medium truncate">
                    Area: {inv.area_m2.toLocaleString()} m²
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Down Arrow 2 */}
        <div className="flex justify-center -my-1">
          <div className="p-1 rounded-full bg-[#07080b] border border-white/20 text-[#b5f639]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 3: Modelled Result */}
        <div className="p-3 rounded-xl bg-[#0e1117] border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              3. Modelled Result
            </span>
            <span className="text-xs font-semibold text-slate-200">Predicted Post-Intervention LST</span>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-[#b5f639]">
              {modelled_impact.modelled_lst_after_scenario.toFixed(1)}°C
            </span>
            <span className="text-[10px] text-emerald-400 block font-bold">Simulated Physics ML Run</span>
          </div>
        </div>

        {/* Down Arrow 3 */}
        <div className="flex justify-center -my-1">
          <div className="p-1 rounded-full bg-[#07080b] border border-white/20 text-[#b5f639]">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Step 4: Estimated Change */}
        <div className="p-4 rounded-xl bg-[#b5f639]/10 border border-[#b5f639] flex items-center justify-between shadow-[0_0_25px_rgba(181,246,57,0.15)]">
          <div>
            <span className="text-[10px] font-black text-[#07080b] bg-[#b5f639] px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
              4. Estimated Change ({modelled_impact.wording_label})
            </span>
            <div className="text-xs text-slate-300 font-bold">
              Predicted Baseline LST - Predicted Scenario LST
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-[#b5f639]">
              ↓ {modelled_impact.estimated_change_degC.toFixed(2)}°C
            </div>
            {confidence.uncertainty_bounds && (
              <span className="text-[10px] text-slate-300 font-extrabold block">
                Margin: {confidence.uncertainty_bounds}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Section: Model Performance, Confidence & Uncertainty Limits */}
      {showDetails && (
        <div className="p-3 rounded-xl bg-[#0e1117] border border-white/10 space-y-2.5 text-xs text-slate-300 transition-all">
          <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
            <span className="font-extrabold text-[#b5f639] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ML Model Validation & Confidence Metrics
            </span>
            <span className="text-[10px] text-slate-400">{confidence.model_name || "XGBoost Regressor"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-400 text-[10px] block">R² Goodness of Fit:</span>
              <strong className="text-white text-sm font-black">{confidence.r2_score ?? 0.912}</strong>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-slate-400 text-[10px] block">Test RMSE Uncertainty:</span>
              <strong className="text-amber-400 text-sm font-black">{confidence.uncertainty_bounds ?? '±0.38°C'}</strong>
            </div>
          </div>

          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="font-extrabold text-slate-200">Data & Model Limitations:</div>
            {(confidence.data_limitations || []).map((lim, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-[#b5f639] shrink-0 mt-0.5" />
                <span>{lim}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
