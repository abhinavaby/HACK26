import React, { useState } from 'react';
import { Sun } from 'lucide-react';

export default function HomePage({
  cities = [],
  selectedCity = 'Delhi',
  onSelectCity,
  onLaunchDashboard
}) {
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setIsClicking(true);
    setTimeout(() => {
      if (onLaunchDashboard) onLaunchDashboard();
    }, 250);
  };

  return (
    <div className={`relative w-full text-[#0d1117] overflow-hidden selection:bg-[#a3e635] selection:text-[#0d1117] pt-1 pb-4 transition-all duration-500 ease-out ${
      isClicking ? 'opacity-40 scale-[0.98] blur-sm' : 'opacity-100 scale-100'
    }`}>
      
      {/* CIRCULAR SIGNATURE LIGHT CANVAS CONTAINER FRAME */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Fixed Rounded Canvas Container Inspired by Circular */}
        <div className="relative w-full rounded-[2.5rem] sm:rounded-[3.5rem] bg-gradient-to-b from-[#f5fbf1] via-[#edf5e7] to-[#e1eed8] border border-white/70 shadow-[0_25px_80px_rgba(0,0,0,0.65)] p-6 sm:p-12 overflow-hidden flex flex-col justify-between min-h-[580px] max-h-[82vh] text-center space-y-8 transition-all duration-500">
          
          {/* Subtle Microclimate Grid Pattern Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#84cc16_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

          {/* HERO CONTENT */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-5 pt-4 sm:pt-6 animate-fade-in">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/90 text-[#1a2e05] border border-[#a3e635]/40 text-xs font-semibold shadow-sm backdrop-blur transition-transform duration-300 hover:scale-105">
              <span>ThermaGrid AI Model</span>
              <span className="text-[#84cc16] text-xs">✦</span>
            </div>

            {/* Circular Signature Massive Headline with Serif Italic Accent */}
            <h1 className="text-4xl sm:text-7xl font-bold text-[#0d1117] tracking-tight leading-[1.08] font-sans">
              Quantify Heat <br />
              Ship with <span className="font-serif italic font-normal text-[#84cc16] transition-colors duration-300 hover:text-[#65a30d]">Cooling Precision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-normal text-slate-600 max-w-xl leading-relaxed">
              The modern platform for urban planners to quantify land surface temperatures and simulate microclimate interventions without guessing.
            </p>

            {/* CIRCULAR SIGNATURE SPLIT BUTTON WITH SMOOTH CLICK TRANSITION */}
            <div className="pt-2">
              <button
                onClick={handleClick}
                className="inline-flex items-center group cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:shadow-[0_22px_45px_rgba(132,204,22,0.4)] active:scale-95 transition-all duration-300 ease-out"
              >
                <span className="px-6 py-3 bg-[#0d1117] group-hover:bg-[#1a222e] text-white font-bold text-sm rounded-l-2xl transition-colors duration-300 flex items-center gap-2">
                  <span>Get Started with System Matrix</span>
                </span>
                <span className="w-11 h-11 bg-[#a3e635] group-hover:bg-[#b5f639] group-active:bg-[#84cc16] flex items-center justify-center rounded-r-2xl text-[#0d1117] font-bold text-lg transition-all duration-300 group-hover:rotate-45">
                  ↘
                </span>
              </button>
            </div>
          </div>

          {/* CIRCULAR METRICS CARDS */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full pt-2">
            
            {/* Stat Card 1 */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-[#84cc16]/20 shadow-sm flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-[#84cc16]/40">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Baseline LST</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#0d1117] my-1">39.7°C</span>
              <span className="text-[10px] text-rose-600 font-medium">{selectedCity} Surface Temp</span>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#0d1117] text-white p-4 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-[#a3e635]/40">
              <span className="text-[10px] font-bold text-[#a3e635] uppercase tracking-wider">Target LST</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#a3e635] my-1">
                ↓ 2.68°C
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Simulated Cooling</span>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-[#84cc16]/20 shadow-sm flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-[#84cc16]/40">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Feasibility</span>
              <span className="text-2xl sm:text-3xl font-bold text-[#65a30d] my-1">100%</span>
              <span className="text-[10px] text-slate-500 font-medium">Water & Budget Validated</span>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-[#84cc16]/20 shadow-sm flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/40">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ROI Score</span>
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 my-1">0.12°C</span>
              <span className="text-[10px] text-slate-500 font-medium">Per ₹1 Lakh Allocated</span>
            </div>

          </div>

          {/* Bottom Right Floating Theme Toggle Button */}
          <div className="absolute bottom-4 right-5 z-20">
            <button
              onClick={handleClick}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-amber-300 border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer hover:scale-110 active:scale-90"
              title="Launch Matrix"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
