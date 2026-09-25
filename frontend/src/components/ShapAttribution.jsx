import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Cpu, Flame } from 'lucide-react';
import WhyIsAreaHotCard from './WhyIsAreaHotCard';

export default function ShapAttribution({ shapAttribution, selectedZoneId, baselineLst, simulationData, hideHeader = false }) {
  const currentShap = shapAttribution || simulationData?.shap_attribution || [];

  if (!currentShap || currentShap.length === 0) {
    return (
      <div className="bento-card p-5 h-64 flex items-center justify-center text-slate-400 text-xs">
        Loading XAI Driver Attribution...
      </div>
    );
  }

  const chartData = currentShap.map((item) => ({
    name: item.feature_name.split(' ')[0], // Compact name for small screens
    fullName: item.feature_name,
    impact: item.impact_degC,
    effect: item.effect,
    value: item.value
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0e1117] border border-white/10 p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-extrabold text-white">{data.fullName}</p>
          <p className="text-slate-400 mt-1">Current Metric: <span className="text-white font-medium">{data.value}</span></p>
          <p className={`font-black mt-1 ${data.impact > 0 ? 'text-rose-400' : 'text-[#b5f639]'}`}>
            Thermal Impact: {data.impact > 0 ? `+${data.impact}` : data.impact} °C
          </p>
        </div>
      );
    }
    return null;
  };

  const simDataToPass = simulationData || {
    baseline_lst: baselineLst,
    shap_attribution: currentShap
  };

  const fullContent = (
    <div className="w-full flex-1 flex flex-col space-y-4">
      {/* 1. Plain-English "Why Is This Area Hot?" Card */}
      <WhyIsAreaHotCard simulationData={simDataToPass} selectedZoneId={selectedZoneId} />

      {/* 2. SHAP Feature Impact Bar Chart */}
      <div className="p-3.5 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#b5f639]" />
            <span>SHAP Machine Learning Feature Contributions</span>
          </h4>
          <span className="text-[10px] text-slate-400">XGBoost Feature Vector</span>
        </div>

        <div className="w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                unit="°C"
                stroke="#334155"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#e2e8f0', fontSize: 11 }}
                width={85}
                stroke="#334155"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact > 0 ? '#ef4444' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-around bg-[#0e1117] p-2 rounded-xl border border-white/10 text-[10px] font-semibold mt-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
            Increases Heat Prediction (+°C)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
            Cools Surface Prediction (-°C)
          </span>
        </div>
      </div>
    </div>
  );

  if (hideHeader) return fullContent;

  return (
    <div className="bento-card p-4 sm:p-5 flex flex-col justify-between">
      {fullContent}
    </div>
  );
}

