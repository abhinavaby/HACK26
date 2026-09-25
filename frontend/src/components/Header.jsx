import React from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

export default function Header({
  cities = [],
  selectedCity = 'Delhi',
  onCityChange,
  onOpenReport,
  pageView = 'home',
  onNavigatePage
}) {
  return (
    <header className="sticky top-0 z-50 w-full max-w-6xl mx-auto px-4 pt-2">
      {/* Circular Inverted Floating Dark Top Bar / Notch Header */}
      <div className="bg-[#000000] text-white px-6 py-3 rounded-b-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-between gap-4 transition-all duration-300">
        
        {/* Brand Logo: ThermaGrid AI */}
        <button
          onClick={() => onNavigatePage && onNavigatePage('home')}
          className="flex items-center gap-2.5 cursor-pointer focus:outline-none group"
        >
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center transition transform group-hover:scale-110">
            <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
            ThermaGrid
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] font-black border border-[#a3e635]/30">
              AI
            </span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigatePage && onNavigatePage('home')}
            className={`transition cursor-pointer ${
              pageView === 'home' ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigatePage && onNavigatePage('dashboard')}
            className={`transition cursor-pointer flex items-center gap-1.5 ${
              pageView === 'dashboard' ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            <span>System Matrix</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
          </button>

          <button
            onClick={onOpenReport}
            className="hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <span>Policy Brief</span>
            <ArrowUpRight className="w-3 h-3 text-[#a3e635]" />
          </button>
        </div>

        {/* Right Section: City Selector Pill */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center bg-white/10 px-3 py-1.5 rounded-full text-slate-200 hover:text-white transition">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange && onCityChange(e.target.value)}
              className="appearance-none bg-transparent font-bold text-xs pr-4 focus:outline-none cursor-pointer border-0"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {cities.map((c) => (
                <option key={c.key} value={c.key} className="bg-[#0d1117] text-white font-medium">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>
    </header>
  );
}
