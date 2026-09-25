import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, MapPin, AlertTriangle, ShieldCheck, Activity, Info } from 'lucide-react';

export default function HeatHistory({ city, selectedZoneId, hideHeader = false }) {
  const [timeRange, setTimeRange] = useState(10); // 5 | 10 | 15
  const [targetType, setTargetType] = useState('hotspot'); // 'hotspot' | 'city'
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverPoint, setHoverPoint] = useState(null);

  // Fetch Heat History Data
  useEffect(() => {
    setLoading(true);
    const targetZone = targetType === 'hotspot' ? selectedZoneId : '';
    const url = `http://localhost:8000/api/heat-history?city=${encodeURIComponent(city)}&zone_id=${encodeURIComponent(targetZone)}&time_range=${timeRange}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setHistoryData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Heat history fetch error:', err);
        setLoading(false);
      });
  }, [city, selectedZoneId, timeRange, targetType]);

  if (loading || !historyData) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-slate-400 space-y-3 min-h-[360px]">
        <Activity className="w-8 h-8 text-[#b5f639] animate-spin" />
        <p className="text-xs font-semibold">Aggregating multi-satellite LST observations...</p>
      </div>
    );
  }

  const { yearly_series, summary, target_name, disclaimer, data_quality_warnings } = historyData;

  // Chart SVG Math
  const minTemp = Math.min(...yearly_series.map((d) => d.min_lst)) - 0.5;
  const maxTemp = Math.max(...yearly_series.map((d) => d.max_lst)) + 0.5;
  const chartHeight = 220;
  const chartWidth = 520;
  const padding = 35;

  const getX = (index) => padding + (index / (yearly_series.length - 1)) * (chartWidth - 2 * padding);
  const getY = (val) => chartHeight - padding - ((val - minTemp) / (maxTemp - minTemp)) * (chartHeight - 2 * padding);

  // Line Points string for SVG
  const meanPointsStr = yearly_series.map((d, i) => `${getX(i)},${getY(d.mean_lst)}`).join(' ');

  // Trendline regression end points
  const firstX = getX(0);
  const lastX = getX(yearly_series.length - 1);
  const trendStartY = getY(summary.starting_lst);
  const trendEndY = getY(summary.latest_lst);

  return (
    <div className="w-full flex-1 flex flex-col justify-between space-y-4 text-slate-100">
      
      {/* Top Filter Controls: Time Range & Target Area */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#07080b] border border-white/10">
        
        {/* Selected Area Target Switcher */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#b5f639]" />
          <div className="flex items-center bg-[#0e1117] p-0.5 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => setTargetType('hotspot')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                targetType === 'hotspot' ? 'bg-[#b5f639] text-[#07080b]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hotspot ({selectedZoneId})
            </button>
            <button
              onClick={() => setTargetType('city')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                targetType === 'city' ? 'bg-[#b5f639] text-[#07080b]' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entire {city} Area
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex items-center bg-[#0e1117] p-0.5 rounded-full border border-white/10 text-xs">
            {[5, 10, 15].map((yrs) => (
              <button
                key={yrs}
                onClick={() => setTimeRange(yrs)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  timeRange === yrs ? 'bg-[#b5f639] text-[#07080b]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {yrs} Years
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Starting LST ({historyData.start_year})</span>
          <span className="text-xl font-black text-white mt-1">{summary.starting_lst.toFixed(1)}°C</span>
          <span className="text-[10px] text-slate-500">Historical Base</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Latest LST ({historyData.end_year})</span>
          <span className="text-xl font-black text-white mt-1">{summary.latest_lst.toFixed(1)}°C</span>
          <span className={`text-[10px] font-bold ${summary.total_change_degC > 0 ? 'text-rose-400' : 'text-[#b5f639]'}`}>
            {summary.total_change_degC > 0 ? `+${summary.total_change_degC}` : summary.total_change_degC}°C Net Change
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Modelled Trend</span>
          <div className="flex items-center gap-1 mt-1">
            {summary.trend_status === 'Increasing' ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : summary.trend_status === 'Decreasing' ? (
              <TrendingDown className="w-4 h-4 text-[#b5f639]" />
            ) : (
              <Minus className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-base font-black text-white">{summary.trend_status}</span>
          </div>
          <span className="text-[10px] font-bold text-[#b5f639]">
            {summary.rate_degC_per_year > 0 ? `+${summary.rate_degC_per_year}` : summary.rate_degC_per_year} °C / year
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Satellite Coverage</span>
          <span className="text-xl font-black text-white mt-1">{summary.total_data_points} Passes</span>
          <span className="text-[10px] text-slate-400 font-semibold">Avg Cloud: {summary.avg_cloud_cover_pct}%</span>
        </div>
      </div>

      {/* SVG Historical Heat Trend Line Chart */}
      <div className="p-4 rounded-2xl bg-[#07080b] border border-white/10 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#b5f639]" />
            <h4 className="text-xs font-extrabold text-white tracking-tight">
              LST Trajectory: <span className="text-[#b5f639]">{target_name}</span>
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#b5f639]"></span> Mean LST
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span> Linear Trend
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-xs select-none">
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const yVal = minTemp + ratio * (maxTemp - minTemp);
              const yPos = getY(yVal);
              return (
                <g key={i}>
                  <line x1={padding} y1={yPos} x2={chartWidth - padding} y2={yPos} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x={padding - 5} y={yPos + 4} fill="#64748b" textAnchor="end" className="text-[9px]">
                    {yVal.toFixed(1)}°C
                  </text>
                </g>
              );
            })}

            {/* Regression Trend Line */}
            <line x1={firstX} y1={trendStartY} x2={lastX} y2={trendEndY} stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />

            {/* Mean LST Line */}
            <polyline fill="none" stroke="#b5f639" strokeWidth="2.5" points={meanPointsStr} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {yearly_series.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d.mean_lst);
              const isHovered = hoverPoint?.year === d.year;

              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setHoverPoint(d)} onMouseLeave={() => setHoverPoint(null)}>
                  <circle cx={cx} cy={cy} r={isHovered ? 6 : 4} fill="#07080b" stroke="#b5f639" strokeWidth={isHovered ? 3 : 2} />
                  <text x={cx} y={chartHeight - 10} fill="#94a3b8" textAnchor="middle" className="text-[9px] font-bold">
                    {d.year}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card on Hover */}
          {hoverPoint && (
            <div className="absolute top-2 right-4 bg-[#0e1117] border border-[#b5f639]/40 p-2.5 rounded-xl shadow-2xl text-[11px] space-y-1 z-20">
              <div className="font-bold text-[#b5f639] border-b border-white/10 pb-1 flex justify-between gap-3">
                <span>{hoverPoint.year} Satellite Pass</span>
                <span>{hoverPoint.mean_lst}°C Mean</span>
              </div>
              <div className="text-[10px] text-slate-300 flex justify-between gap-4">
                <span>Min/Max Temp:</span>
                <strong className="text-white">{hoverPoint.min_lst}°C – {hoverPoint.max_lst}°C</strong>
              </div>
              <div className="text-[10px] text-slate-300 flex justify-between gap-4">
                <span>Hotspot Area (&gt;35°C):</span>
                <strong class="text-amber-400">{hoverPoint.hotspot_area_ha} ha</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Quality & Limitations Box */}
      <div className="p-3 rounded-2xl bg-[#0e1117] border border-white/10 text-xs space-y-2">
        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Data Quality & Pipeline Integrity</span>
        </div>
        <div className="space-y-1 text-[11px] text-slate-400">
          {data_quality_warnings.map((warn, idx) => (
            <div key={idx} className="flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10px] text-slate-400 italic">
          <Info className="w-3 h-3 text-[#b5f639] shrink-0" />
          <span>{disclaimer}</span>
        </div>
      </div>

    </div>
  );
}
