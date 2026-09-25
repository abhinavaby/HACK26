import React from 'react';
import { Award } from 'lucide-react';

export default function RoiRanking({ rankings, selectedZoneId, onSelectZone, hideHeader = false }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="p-6 h-64 flex items-center justify-center text-slate-400">
        Calculating Priority Candidates...
      </div>
    );
  }

  const tableContent = (
    <div className="w-full flex-1 flex flex-col justify-between">
      <div className="overflow-y-auto max-h-[350px] pr-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold">
              <th className="py-2.5 px-2">Zone</th>
              <th className="py-2.5 px-2">LST</th>
              <th className="py-2.5 px-2">Drop</th>
              <th className="py-2.5 px-2 hidden xs:table-cell">Efficiency</th>
              <th className="py-2.5 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rankings.map((c, index) => {
              const isSelected = c.zone_id === selectedZoneId;
              return (
                <tr
                  key={c.zone_id}
                  className={`transition-colors ${isSelected ? 'bg-[#b5f639]/10 font-bold' : 'hover:bg-white/5'}`}
                >
                  <td className="py-2.5 px-2 text-white font-semibold">
                    #{index + 1} {c.zone_id}
                  </td>
                  <td className="py-2.5 px-2 text-rose-400 font-bold">{c.current_lst.toFixed(1)}°C</td>
                  <td className="py-2.5 px-2 text-[#b5f639] font-bold">↓ {c.temp_drop.toFixed(1)}°C</td>
                  <td className="py-2.5 px-2 hidden xs:table-cell font-black text-amber-400">{c.efficiency_score}</td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => onSelectZone(c.zone_id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#b5f639] text-[#07080b] shadow'
                          : 'bg-[#141822] hover:bg-[#b5f639] text-slate-200 hover:text-[#07080b] border border-white/10'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Target'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (hideHeader) return tableContent;

  return (
    <div className="bento-card p-4 sm:p-5 h-[360px] sm:h-[460px] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <div className="p-1 rounded bg-[#b5f639]/10 text-[#b5f639]">
                <Award className="w-4 h-4" />
              </div>
              Top Candidate Hotspots
            </h3>
            <p className="text-[11px] text-slate-400">
              Zones where greening & cool roofs yield maximum ROI
            </p>
          </div>
          <span className="text-xs font-black px-2.5 py-0.5 bg-[#b5f639] text-[#07080b] rounded-full shadow">
            Top Priority
          </span>
        </div>
        {tableContent}
      </div>
    </div>
  );
}
