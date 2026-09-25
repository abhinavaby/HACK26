import React, { useState } from 'react';

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

        </div>
      </div>
    </div>
  );
}
