import React, { useState } from 'react';
import { ChevronDown, ArrowUpRight, Menu, X, Home, Map, FileText } from 'lucide-react';

export default function Header({
  cities = [],
  selectedCity = 'Delhi',
  onCityChange,
  onOpenReport,
  pageView = 'home',
  onNavigatePage
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full max-w-6xl mx-auto px-2 sm:px-4 pt-1 sm:pt-2 animate-header-in">
      {/* Circular Inverted Dark Top Bar / Notch Header */}
      <div className="bg-[#000000] text-white px-3.5 sm:px-6 py-2 sm:py-3 rounded-b-2xl sm:rounded-b-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
        
        {/* Brand Logo: ThermaGrid AI */}
        <button
          onClick={() => {
            if (onNavigatePage) onNavigatePage('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer focus:outline-none group shrink-0"
        >
          <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center transition transform group-hover:scale-110">
            <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
          </div>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
            ThermaGrid
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#a3e635]/20 text-[#a3e635] font-black border border-[#a3e635]/30">
              AI
            </span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onNavigatePage && onNavigatePage('home')}
            className={`transition cursor-pointer ${
              pageView === 'home' ? 'text-[#a3e635] font-bold' : 'hover:text-white text-slate-300'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigatePage && onNavigatePage('dashboard')}
            className={`transition cursor-pointer flex items-center gap-1.5 ${
              pageView === 'dashboard' ? 'text-[#a3e635] font-bold' : 'hover:text-white text-slate-300'
            }`}
          >
            <span>System Matrix</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
          </button>

          <button
            onClick={onOpenReport}
            className="hover:text-white transition cursor-pointer flex items-center gap-1 text-slate-300"
          >
            <span>Policy Brief</span>
            <ArrowUpRight className="w-3 h-3 text-[#a3e635]" />
          </button>
        </div>

        {/* Right Section: City Selector + Split CTA Button + Mobile Hamburger Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Custom Styled City Selector */}
          <div className="relative flex items-center bg-white/10 px-2 sm:px-3 py-1 rounded-full text-slate-200 hover:text-white transition">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange && onCityChange(e.target.value)}
              className="appearance-none bg-transparent font-bold text-[11px] sm:text-xs pr-3.5 sm:pr-4 focus:outline-none cursor-pointer border-0 text-slate-200 max-w-[100px] sm:max-w-none truncate"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              {cities.map((c) => (
                <option key={c.key} value={c.key} className="bg-[#0d1117] text-white font-medium">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Circular Split Action Button */}
          <button
            onClick={() => onNavigatePage && onNavigatePage('dashboard')}
            className="group hidden xs:flex items-center cursor-pointer transition transform hover:scale-[1.02] active:scale-95"
          >
            <span className="px-3 sm:px-4 py-1.5 bg-white text-[#000000] font-bold text-[11px] sm:text-xs rounded-l-full transition group-hover:bg-slate-100">
              Try Matrix
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-[#a3e635] group-hover:bg-[#b5f639] text-[#000000] font-bold text-xs flex items-center justify-center rounded-r-2xl transition group-hover:rotate-45">
              ↘
            </span>
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#a3e635]" /> : <Menu className="w-4 h-4 text-white" />}
          </button>
        </div>

      </div>

      {/* Interactive Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-3.5 rounded-2xl bg-[#000000]/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col space-y-2 animate-fade-in text-xs font-semibold">
          <button
            onClick={() => {
              if (onNavigatePage) onNavigatePage('home');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-2 p-2.5 rounded-xl transition ${
              pageView === 'home' ? 'bg-[#a3e635]/20 text-[#a3e635] font-bold' : 'text-slate-200 hover:bg-white/5'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => {
              if (onNavigatePage) onNavigatePage('dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
              pageView === 'dashboard' ? 'bg-[#a3e635]/20 text-[#a3e635] font-bold' : 'text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span>System Matrix Dashboard</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
          </button>

          <button
            onClick={() => {
              if (onOpenReport) onOpenReport();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl text-slate-200 hover:bg-white/5 transition"
          >
            <FileText className="w-4 h-4 text-[#a3e635]" />
            <span>Executive Policy Brief</span>
          </button>
        </div>
      )}
    </header>
  );
}
