import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Cpu } from 'lucide-react';

export default function ShapAttribution({ shapAttribution, selectedZoneId, baselineLst }) {
  if (!shapAttribution || shapAttribution.length === 0) {
    return (
      <div className="glass-card p-5 h-64 flex items-center justify-center text-slate-400">
        Loading XAI Driver Attribution...
      </div>
    );
  }

  const chartData = shapAttribution.map((item) => ({
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
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
          <p className="font-bold text-slate-200">{data.fullName}</p>
          <p className="text-slate-400 mt-1">Current Metric: <span className="text-white font-medium">{data.value}</span></p>
          <p className={`font-semibold mt-1 ${data.impact > 0 ? 'text-rose-400' : 'text-sky-400'}`}>
            Thermal Impact: {data.impact > 0 ? `+${data.impact}` : data.impact} °C
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-4 sm:p-5 flex flex-col justify-between h-[340px] sm:h-[450px]">
      <div>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-400" />
              Heat Drivers (SHAP XAI)
            </h3>
            <p className="text-[11px] text-slate-400">
              Why {selectedZoneId} is experiencing excess heat
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-sky-500/10 text-sky-300 rounded">
            LST: {baselineLst?.toFixed(1)}°C
          </span>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-[200px] sm:h-[280px]">
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
                    fill={entry.impact > 0 ? '#ef4444' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-around bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
          Increases Heat (+°C)
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span>
          Cools Surface (-°C)
        </span>
      </div>
    </div>
  );
}
