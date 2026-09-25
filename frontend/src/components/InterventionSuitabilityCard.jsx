import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck, Trees, Sun, Compass, Layers, Database } from 'lucide-react';

export default function InterventionSuitabilityCard({ city, selectedZoneId }) {
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedZoneId) return;

    setLoading(true);
    fetch(`http://localhost:8000/api/suitability?city=${encodeURIComponent(city)}&zone_id=${encodeURIComponent(selectedZoneId)}`)
      .then((res) => res.json())
      .then((data) => {
        setSuitabilityData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Suitability fetch error:', err);
        setLoading(false);
      });
  }, [city, selectedZoneId]);

  if (loading || !suitabilityData) {
    return (
      <div className="p-4 rounded-2xl bg-[#07080b] border border-white/10 text-xs text-slate-400 animate-pulse">
        Evaluating intervention feasibility for {selectedZoneId}...
      </div>
    );
  }

  const { evaluations } = suitabilityData;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Suitable':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#b5f639]/20 text-[#b5f639] border border-[#b5f639]/30 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>✓ Suitable</span>
          </span>
        );
      case 'Partially Suitable':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm">
            <AlertTriangle className="w-3 h-3" />
            <span>⚠ Partially Suitable</span>
          </span>
        );
      case 'Not Suitable':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm">
            <XCircle className="w-3 h-3" />
            <span>✗ Not Suitable</span>
          </span>
        );
      case 'Insufficient Data':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shadow-sm">
            <Info className="w-3 h-3" />
            <span>ℹ Insufficient Data</span>
          </span>
        );
    }
  };

  const getInterventionIcon = (name) => {
    if (name.includes('Tree')) return <Trees className="w-4 h-4 text-[#b5f639]" />;
    if (name.includes('Cool Roof')) return <Sun className="w-4 h-4 text-amber-400" />;
    return <Compass className="w-4 h-4 text-teal-400" />;
  };

  return (
    <div className="w-full space-y-3 p-3.5 rounded-2xl bg-[#07080b] border border-white/10 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#b5f639]" />
          <h4 className="text-xs font-extrabold text-white tracking-tight uppercase">
            Intervention Feasibility & Suitability
          </h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-[#0e1117] px-2 py-0.5 rounded-full border border-white/10">
          {selectedZoneId}
        </span>
      </div>

      {/* Intervention Evaluations List */}
      <div className="space-y-2.5">
        {evaluations.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-[#0e1117] border border-white/10 space-y-2">
            
            {/* Title & Status Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#07080b] border border-white/10">
                  {getInterventionIcon(item.intervention)}
                </div>
                <span className="font-extrabold text-white text-xs">{item.intervention}</span>
              </div>
              {getStatusBadge(item.status)}
            </div>

            {/* Natural Language Reason */}
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              "{item.reason}"
            </p>

            {/* Key Conditions Evaluated */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px] text-slate-400">
              {Object.entries(item.key_conditions).map(([k, v], i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-[#07080b] border border-white/5 text-slate-300 font-semibold">
                  <strong className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</strong>{' '}
                  <span className="text-white">{typeof v === 'number' ? v.toLocaleString() : v}</span>
                </span>
              ))}
            </div>

            {/* Data Source Used */}
            <div className="flex items-center gap-1 text-[9px] text-slate-500 pt-0.5">
              <Database className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Data source: {item.data_used}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
