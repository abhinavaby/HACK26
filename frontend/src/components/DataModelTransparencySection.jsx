import React, { useState, useEffect } from 'react';
import { Database, Cpu, ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp, Layers, CheckCircle2, FileText } from 'lucide-react';

export default function DataModelTransparencySection({ city = 'Delhi' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('data'); // 'data' | 'processing' | 'model' | 'shap' | 'limitations'
  const [transparencyData, setTransparencyData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/transparency?city=${city}`)
      .then((res) => res.json())
      .then((data) => setTransparencyData(data))
      .catch((err) => console.error('Transparency fetch error:', err));
  }, [city]);

  if (!transparencyData) return null;

  const { data_sources, processing_pipeline, ai_model, explainability, limitations } = transparencyData;

  return (
    <div className="w-full mt-6 bento-card p-4 sm:p-5 border border-white/10 rounded-2xl bg-[#07080b] shadow-xl transition-all">
      {/* Expandable Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#b5f639]/10 text-[#b5f639] group-hover:bg-[#b5f639] group-hover:text-[#07080b] transition">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              Data & Model Information
              <span className="text-[10px] font-black text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                System Audit & Governance
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Transparent satellite data sources, trained XGBoost parameters, SHAP XAI, and limitations
            </p>
          </div>
        </div>

        <button className="p-2 rounded-xl bg-[#0e1117] border border-white/10 text-slate-300 group-hover:text-white transition">
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#b5f639]" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Body View */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center bg-[#0e1117] p-1 rounded-xl border border-white/10 text-xs gap-1">
            <button
              onClick={() => setActiveSubTab('data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'data' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>1. Data Sources</span>
            </button>

            <button
              onClick={() => setActiveSubTab('processing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'processing' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Processing & QA</span>
            </button>

            <button
              onClick={() => setActiveSubTab('model')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'model' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>3. AI Model</span>
            </button>

            <button
              onClick={() => setActiveSubTab('shap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'shap' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>4. Explainability (SHAP)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('limitations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'limitations' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>5. Limitations</span>
            </button>
          </div>

          {/* Sub-Tab 1: Data Sources */}
          {activeSubTab === 'data' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {data_sources.map((ds, index) => (
                <div key={index} className="p-3.5 rounded-xl bg-[#0e1117] border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center border-b border-white/10 pb-1 font-extrabold text-[#b5f639]">
                    <span>DATASET #{index + 1}</span>
                    <span className="text-[10px] text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                      {ds.dataset}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">SOURCE:</span> <strong className="text-slate-200">{ds.source}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">SATELLITE/SENSOR:</span> <strong className="text-white">{ds.satellite_sensor}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">DATE/RANGE:</span> <strong className="text-slate-300">{ds.date_range}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">SPATIAL RESOLUTION:</span> <strong className="text-[#b5f639]">{ds.spatial_resolution}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-Tab 2: Processing & Quality Pipeline */}
          {activeSubTab === 'processing' && (
            <div className="p-4 rounded-xl bg-[#0e1117] border border-white/10 space-y-3 text-xs text-slate-300">
              <div className="font-extrabold text-white text-sm border-b border-white/10 pb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#b5f639]" />
                Geospatial Data Processing & Quality Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-[#b5f639] block">Radiometric & Thermal Calibration</strong>
                  <p>{processing_pipeline.radiometric_calibration}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-[#b5f639] block">Cloud Cover Quality Masking</strong>
                  <p>{processing_pipeline.quality_masking}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-[#b5f639] block">Spatial Grid Alignment</strong>
                  <p>{processing_pipeline.spatial_grid_alignment}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <strong className="text-[#b5f639] block">Outlier Filtering</strong>
                  <p>{processing_pipeline.outlier_handling}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: AI Model Information */}
          {activeSubTab === 'model' && (
            <div className="p-4 rounded-xl bg-[#0e1117] border border-white/10 space-y-3 text-xs text-slate-300">
              <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="font-extrabold text-white text-sm">Model Architecture & Training</span>
                <span className="text-[10px] font-black text-[#07080b] bg-[#b5f639] px-2.5 py-0.5 rounded-full">
                  {ai_model.model_name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-400 font-semibold">MODEL NAME:</span> <strong className="text-white">{ai_model.model_name}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-semibold">MODEL TYPE:</span> <strong className="text-slate-200">{ai_model.model_type}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-semibold">TARGET VARIABLE:</span> <strong className="text-rose-400">{ai_model.target_variable}</strong></div>
                  <div className="flex justify-between"><span className="text-slate-400 font-semibold">TRAINING INFO:</span> <strong className="text-slate-300">{ai_model.training_information}</strong></div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px]">EVALUATION METRICS & CONFIDENCE:</span>
                  <div className="flex justify-between"><span>R² Goodness of Fit:</span> <strong className="text-[#b5f639]">{ai_model.evaluation_metrics.r2_score}</strong></div>
                  <div className="flex justify-between"><span>Test RMSE Error:</span> <strong className="text-amber-400">{ai_model.evaluation_metrics.rmse_degC}°C</strong></div>
                  <div className="flex justify-between"><span>Uncertainty Bounds:</span> <strong className="text-white">{ai_model.evaluation_metrics.uncertainty_bounds}</strong></div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block text-[10px]">INPUT FEATURES:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ai_model.input_features.map((feat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-mono text-[10px]">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Explainability (SHAP) */}
          {activeSubTab === 'shap' && (
            <div className="p-4 rounded-xl bg-[#0e1117] border border-[#b5f639]/30 space-y-3 text-xs text-slate-300">
              <div className="font-extrabold text-[#b5f639] text-sm border-b border-white/10 pb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#b5f639]" />
                Explainable AI (SHAP Methodology)
              </div>

              {/* Mandatory Simple Language Wording Callout */}
              <div className="p-3 rounded-xl bg-[#b5f639]/10 border border-[#b5f639] text-slate-100 font-semibold">
                "{explainability.shap_explanation}"
              </div>

              <p className="text-[11px] text-slate-300">
                {explainability.interpretation}
              </p>
            </div>
          )}

          {/* Sub-Tab 5: System Limitations */}
          {activeSubTab === 'limitations' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-xs text-amber-200">
              <div className="font-extrabold text-amber-300 text-sm border-b border-amber-500/20 pb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                System Data & Model Limitations
              </div>

              <div className="space-y-2 text-[11px]">
                {limitations.map((lim, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-black text-amber-400 shrink-0">•</span>
                    <span>{lim}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
