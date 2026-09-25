import React from 'react';
import { Award, Target } from 'lucide-react';

export default function RoiRanking({ rankings, selectedZoneId, onSelectZone }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="glass-card p-5 h-64 flex items-center justify-center text-slate-400">
        Calculating Priority Candidates...
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 h-[340px] sm:h-[450px] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Top Candidate Hotspots
            </h3>
            <p className="text-[11px] text-slate-400">
              Zones where greening & cool roofs give maximum cooling ROI
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
            Top Priority
          </span>
        </div>

        {/* Responsive Table / Card Container */}
        <div className="overflow-y-auto max-h-[250px] sm:max-h-[340px] pr-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-2">Zone</th>
                <th className="py-2 px-2">LST</th>
                <th className="py-2 px-2">Drop</th>
                <th className="py-2 px-2 hidden xs:table-cell">Efficiency</th>
                <th className="py-2 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankings.map((c, index) => {
                const isSelected = c.zone_id === selectedZoneId;
                return (
                  <tr
                    key={c.zone_id}
                    className={`transition ${isSelected ? 'bg-emerald-950/40 font-bold' : 'hover:bg-slate-800/30'}`}
                  >
                    <td className="py-2.5 px-2 text-white">
                      #{index + 1} {c.zone_id}
                    </td>
                    <td className="py-2.5 px-2 text-rose-400 font-semibold">{c.current_lst.toFixed(1)}°C</td>
                    <td className="py-2.5 px-2 text-emerald-400 font-semibold">↓ {c.temp_drop.toFixed(1)}°C</td>
                    <td className="py-2.5 px-2 hidden xs:table-cell font-bold text-amber-400">{c.efficiency_score}</td>
                    <td className="py-2.5 px-2 text-right">
                      <button
                        onClick={() => onSelectZone(c.zone_id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-emerald-600 text-slate-200'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
