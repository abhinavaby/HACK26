import React from 'react';
import { Flame, FileText } from 'lucide-react';

export default function Header({
  cities,
  selectedCity,
  onCityChange,
  onOpenReport
}) {
  return (
    <header className="glass-panel p-3 sm:p-4 mb-4 border-b border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400">
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
              Urban Heat AI Optimizer
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Thermal mapping & explainable policy decision engine
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* City Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium hidden xs:inline">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-transparent font-semibold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c.key} value={c.key} className="bg-slate-900 text-slate-200">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Report Export */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Policy Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
}
