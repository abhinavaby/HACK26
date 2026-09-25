import React from 'react';
import { Flame, Trees, Building2, Sun, Wind, HelpCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function WhyIsAreaHotCard({ simulationData, selectedZoneId }) {
  if (!simulationData) {
    return (
      <div className="bento-card p-4 h-48 flex items-center justify-center text-slate-400 text-xs animate-pulse">
        Calculating microclimate factors for {selectedZoneId}...
      </div>
    );
  }

  const { baseline_lst, original_indices, shapAttribution, shap_attribution } = simulationData;
  const shapList = shapAttribution || shap_attribution || [];

  const ndvi = original_indices?.ndvi ?? 0.15;
  const ndbi = original_indices?.ndbi ?? 0.45;
  const albedo = original_indices?.albedo ?? 0.15;
  const bldgDensity = original_indices?.bldg_density ?? 0.70;
  const windSpeed = original_indices?.wind_speed ?? 2.1;

  // Level Indicator Classification
  const getVegetationLevel = (v) => (v < 0.20 ? 'LOW' : v < 0.40 ? 'MEDIUM' : 'HIGH');
  const getBuiltUpLevel = (v) => (v > 0.65 ? 'HIGH' : v > 0.35 ? 'MEDIUM' : 'LOW');
  const getAlbedoLevel = (v) => (v < 0.18 ? 'LOW' : v < 0.30 ? 'MEDIUM' : 'HIGH');
  const getWindLevel = (v) => (v < 2.0 ? 'LOW' : v < 4.0 ? 'MEDIUM' : 'HIGH');

  const vegLevel = getVegetationLevel(ndvi);
  const builtLevel = getBuiltUpLevel(bldgDensity);
  const albLevel = getAlbedoLevel(albedo);
  const windLvl = getWindLevel(windSpeed);

  // Top positive heat drivers based on SHAP impact
  const topHeatDrivers = shapList
    .filter((d) => d.impact_degC > 0)
    .sort((a, b) => b.impact_degC - a.impact_degC);

  // Formulate Plain-English Explanation
  const generateExplanation = () => {
    const factors = [];
    if (vegLevel === 'LOW') factors.push('relatively sparse vegetation canopy');
    if (builtLevel === 'HIGH') factors.push('a high concentration of heat-retaining built-up structures');
    if (albLevel === 'LOW') factors.push('dark rooftop surfaces with low solar reflectance');
    if (windLvl === 'LOW') factors.push('stagnant wind ventilation');

    if (factors.length === 0) {
      return `This area exhibits balanced environmental characteristics. Surface temperatures remain within optimal thermal thresholds in the current model.`;
    }

    const factorStr = factors.join(', ').replace(/, ([^,]*)$/, ', and $1');
    return `This area is characterized by ${factorStr}. In the current model, these environmental conditions are strongly associated with elevated surface temperatures (+${(
      topHeatDrivers[0]?.impact_degC || 1.8
    ).toFixed(1)}°C thermal impact).`;
  };

  return (
    <div className="w-full space-y-4 text-slate-100">
      
      {/* Card Header: Hotspot Title & Temperature Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight uppercase">
              WHY IS THIS AREA HOT?
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">
              XAI Microclimate Diagnostic for <strong className="text-white">{selectedZoneId || 'Zone'}</strong>
            </p>
          </div>
        </div>

        {/* Temperature Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span className="text-xs font-black">
            LST: {baseline_lst ? baseline_lst.toFixed(1) : '--'}°C
          </span>
        </div>
      </div>

      {/* Main Environmental Factors Indicator Grid (LOW / MEDIUM / HIGH) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        {/* Factor 1: Vegetation */}
        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Vegetation</span>
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-300">{(ndvi * 100).toFixed(0)}% Canopy</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                vegLevel === 'LOW'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : vegLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/30'
              }`}
            >
              {vegLevel}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium">NDVI Index</span>
        </div>

        {/* Factor 2: Built-up Density */}
        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Built-up</span>
            <Building2 className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-300">{(bldgDensity * 100).toFixed(0)}% Density</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                builtLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : builtLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/30'
              }`}
            >
              {builtLevel}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium">Building Footprint</span>
        </div>

        {/* Factor 3: Reflectance / Albedo */}
        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Reflectance</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-300">{albedo.toFixed(2)} Albedo</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                albLevel === 'LOW'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : albLevel === 'MEDIUM'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/30'
              }`}
            >
              {albLevel}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium">Solar Reflectance</span>
        </div>

        {/* Factor 4: Wind Speed */}
        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Airflow</span>
            <Wind className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-300">{windSpeed.toFixed(1)} m/s</span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                windLvl === 'LOW'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/30'
              }`}
            >
              {windLvl}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-medium">Wind Ventilation</span>
        </div>
      </div>

      {/* Plain-English Explanation Box */}
      <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/10 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#b5f639] font-extrabold text-[11px]">
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span>Model Diagnostic Explanation</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-normal text-[11px]">
          {generateExplanation()}
        </p>
      </div>

      {/* Non-Causal Methodology Compliance Disclaimer */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 italic px-1">
        <HelpCircle className="w-3 h-3 text-[#b5f639] shrink-0" />
        <span>
          Note: Identifies statistical features associated with LST predictions in the XGBoost model. Does not imply absolute physical causation.
        </span>
      </div>

    </div>
  );
}
