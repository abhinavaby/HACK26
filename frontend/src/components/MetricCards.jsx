import React from 'react';
import { Thermometer, ArrowDownRight, ShieldAlert, DollarSign } from 'lucide-react';

export default function MetricCards({ simulationData, selectedZoneId }) {
  if (!simulationData) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-3 h-20 animate-pulse bg-slate-900/50"></div>
        ))}
      </div>
    );
  }

  const {
    baseline_lst,
    simulated_lst,
    temp_reduction_degC,
    cost_breakdown,
    roi_efficiency,
    heat_driver_severity
  } = simulationData;

  const totalCost = cost_breakdown?.total_usd || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4">
      {/* Metric 1: Current LST */}
      <div className="glass-card p-3 sm:p-4 border-l-4 border-l-rose-500 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Current Temp
          </span>
          <div className="p-1 bg-rose-500/10 text-rose-400 rounded">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-xl sm:text-2xl font-black text-white">
            {baseline_lst.toFixed(1)}°C
          </span>
        </div>
        <span className="text-[10px] text-slate-400 truncate">
          Zone: <strong className="text-slate-200">{selectedZoneId}</strong>
        </span>
      </div>

      {/* Metric 2: Simulated LST */}
      <div className="glass-card p-3 sm:p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Temp
          </span>
          <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded">
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-xl sm:text-2xl font-black text-emerald-400">
            {simulated_lst.toFixed(1)}°C
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400">
          ↓ {temp_reduction_degC.toFixed(2)}°C Drop
        </span>
      </div>

      {/* Metric 3: Risk Level */}
      <div className="glass-card p-3 sm:p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Heat Risk
          </span>
          <div className="p-1 bg-amber-500/10 text-amber-400 rounded">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-lg sm:text-2xl font-black text-white">
            {heat_driver_severity}
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          Thermal Driver Severity
        </span>
      </div>

      {/* Metric 4: Investment & ROI */}
      <div className="glass-card p-3 sm:p-4 border-l-4 border-l-sky-500 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Intervention Cost
          </span>
          <div className="p-1 bg-sky-500/10 text-sky-400 rounded">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-1">
          <span className="text-xl sm:text-2xl font-black text-white">
            ${(totalCost / 1000).toFixed(0)}k
          </span>
        </div>
        <span className="text-[10px] font-semibold text-sky-400">
          ROI: {roi_efficiency.toFixed(2)} °C / $10k
        </span>
      </div>
    </div>
  );
}
