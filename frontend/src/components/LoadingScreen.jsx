import React, { useState, useEffect } from 'react';
import { Satellite, Cpu, Sparkles, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoadingScreen({ cityName = 'Delhi NCR', onFinish }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const steps = [
    { title: 'Satellite LST Spectral Stream', desc: `Fetching Landsat & Sentinel rasters for ${cityName}`, icon: Satellite },
    { title: 'Spatial Microclimate Grid', desc: 'Constructing high-resolution thermal resolution zones', icon: Activity },
    { title: 'XGBoost Physics Engine', desc: 'Synthesizing non-linear canopy & albedo weights', icon: Cpu },
    { title: 'SHAP & Financial ROI Matrix', desc: 'Computing feature impact & Indian Rupee (₹) allocations', icon: Sparkles }
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // Smooth 2.8s load cycle (+1s extended)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(rawPct);

      if (rawPct >= 75) setCurrentStep(3);
      else if (rawPct >= 50) setCurrentStep(2);
      else if (rawPct >= 25) setCurrentStep(1);
      else setCurrentStep(0);

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            if (onFinish) onFinish();
          }, 400); // 400ms smooth fade out transition
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  // SVG Progress Ring Math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080b] text-white p-4 select-none transition-opacity duration-400 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Soft Ambient Light Glows (Electric Lime & Deep Olive Theme) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#b5f639]/10 rounded-full blur-[160px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-[#131c10] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main Glass Bento Card */}
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0e1117] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center overflow-hidden">
        
        {/* Top Header Badge & Skip Button */}
        <div className="w-full flex justify-between items-center mb-6">
          <span className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-[#b5f639]/10 text-[#b5f639] border border-[#b5f639]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b5f639] animate-ping"></span>
            System Diagnostics
          </span>
          <button
            onClick={onFinish}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white bg-[#141822] hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition cursor-pointer"
          >
            <span>Skip to App</span>
            <ArrowRight className="w-3 h-3 text-[#b5f639]" />
          </button>
        </div>

        {/* Central Circular Progress Ring with Electric Lime Styling */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background Circle Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              className="text-[#182030]"
              fill="transparent"
            />
            {/* Animated Electric Lime Stroke Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#b5f639"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-150 ease-out"
            />
          </svg>

          {/* Center Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="w-3 h-3 rounded-full bg-[#b5f639] mb-1 animate-pulse shadow-[0_0_10px_#b5f639]"></div>
            <span className="text-2xl font-black text-white tracking-tight">
              {progress}%
            </span>
          </div>
        </div>

        {/* Brand Name & Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-2">
          ThermaGrid
          <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#b5f639] text-[#07080b]">AI</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mb-6">
          Initializing Urban Microclimate Model Engine
        </p>

        {/* Step Progress Checklist */}
        <div className="w-full space-y-2 text-left mb-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStep || progress === 100;
            const isCurrent = idx === currentStep && progress < 100;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-[#131c10] border-[#b5f639]/40 text-white shadow'
                    : isDone
                    ? 'bg-[#07080b] border-white/5 text-slate-400'
                    : 'opacity-30 border-transparent text-slate-600'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-[#07080b] border border-white/10">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-[#b5f639]" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#b5f639] animate-spin' : 'text-slate-500'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-bold ${isCurrent ? 'text-[#b5f639]' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-black text-[#07080b] bg-[#b5f639] px-2 py-0.5 rounded-full">
                        Loading
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Target Info */}
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-semibold border-t border-white/10 pt-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#b5f639]"></span>
            Target City: <strong className="text-white">{cityName}</strong>
          </span>
          <span className="text-slate-500">ThermaGrid v2.4</span>
        </div>
      </div>
    </div>
  );
}
