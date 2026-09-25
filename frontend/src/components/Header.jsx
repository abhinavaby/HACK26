import React from 'react';
import { ArrowUpRight, MapPin, ChevronDown } from 'lucide-react';

export default function Header({
  cities,
  selectedCity,
  onCityChange,
  onOpenReport
}) {
  return (
    <header className="sticky top-3 z-40 mb-6 max-w-7xl mx-auto px-2">
      <div className="floating-header px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
            <div className="w-2 h-2 rounded-full bg-[#07080b]"></div>
          </div>
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
            ThermaGrid
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#b5f639]/10 text-[#b5f639] font-bold border border-[#b5f639]/20">
              AI
            </span>
          </span>
        </div>

        {/* Minimal Controls: City Selector + Policy Brief Action */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Custom Styled City Selector (NO native OS bevels!) */}
          <div className="relative flex items-center bg-[#141822] border border-white/10 rounded-full px-3 py-1.5 hover:border-[#b5f639]/40 transition">
            <MapPin className="w-3.5 h-3.5 text-[#b5f639] shrink-0 mr-1.5" />
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="appearance-none bg-transparent font-bold text-slate-100 text-xs pr-6 focus:outline-none cursor-pointer border-0"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {cities.map((c) => (
                <option key={c.key} value={c.key} className="bg-[#0e1117] text-white font-semibold">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Minimal Pill CTA */}
          <button
            onClick={onOpenReport}
            className="group flex items-center gap-1.5 sm:gap-2 pl-3 sm:pl-3.5 pr-1.5 py-1.5 bg-white hover:bg-slate-100 text-[#07080b] font-black text-xs rounded-full shadow transition-all duration-200 cursor-pointer min-h-[36px]"
          >
            <span className="hidden xs:inline">Policy Brief</span>
            <span className="xs:hidden">Brief</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#b5f639] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#07080b]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
