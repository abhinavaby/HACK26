import React from 'react';
import { Thermometer, ArrowDownRight, ShieldAlert, IndianRupee } from 'lucide-react';

export default function MetricCards({ simulationData, selectedZoneId }) {
  if (!simulationData) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bento-card p-4 h-24 animate-pulse bg-[#0e1117]"></div>
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

  const totalCost = cost_breakdown?.total_inr || cost_breakdown?.total_usd || 0;

  const formatINR = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}k`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Metric 1: Current Temp */}
      <div className="bento-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span>Baseline LST</span>
          <span className="text-rose-400 text-[11px] font-bold">{selectedZoneId}</span>
        </div>
        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-black text-white">
            {baseline_lst.toFixed(1)}°C
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Current Surface Temp</span>
      </div>

      {/* Metric 2: Target Temp */}
      <div className="bento-card-olive p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs font-bold text-[#b5f639]">
          <span>Target LST</span>
          <span className="px-2 py-0.5 rounded-full bg-[#b5f639] text-[#07080b] text-[10px] font-black">
            ↓ {temp_reduction_degC.toFixed(2)}°C
          </span>
        </div>
        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-black text-white">
            {simulated_lst.toFixed(1)}°C
          </span>
        </div>
        <span className="text-[11px] text-[#b5f639] font-bold">Simulated Post-Cooling</span>
      </div>

      {/* Metric 3: Heat Risk */}
      <div className="bento-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span>Heat Risk</span>
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="my-1">
          <span className="text-xl sm:text-2xl font-black text-white">
            {heat_driver_severity}
          </span>
        </div>
        <span className="text-[11px] text-amber-400 font-medium">Thermal Driver Severity</span>
      </div>

      {/* Metric 4: Investment & ROI */}
      <div className="bento-card p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
          <span>Budget & ROI</span>
          <span className="text-[#b5f639] text-[11px] font-bold">INR (₹)</span>
        </div>
        <div className="my-1">
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatINR(totalCost)}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 font-bold flex justify-between">
          <span>ROI Score:</span>
          <span className="text-[#b5f639]">{roi_efficiency.toFixed(2)} °C / ₹1L</span>
        </div>
      </div>
    </div>
  );
}
