import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import ThermalMap from './components/ThermalMap';
import MitigationSandbox from './components/MitigationSandbox';
import ShapAttribution from './components/ShapAttribution';
import RoiRanking from './components/RoiRanking';
import PolicyReportModal from './components/PolicyReportModal';
import AiCopilotDrawer from './components/AiCopilotDrawer';
import { Map, Cpu, Award } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [cities] = useState([
    { key: 'Delhi', name: 'Delhi NCR, India', lat: 28.6139, lon: 77.2090 },
    { key: 'Ahmedabad', name: 'Ahmedabad, India', lat: 23.0225, lon: 72.5714 },
    { key: 'Phoenix', name: 'Phoenix, AZ, USA', lat: 33.4484, lon: -112.0740 },
    { key: 'Tokyo', name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 }
  ]);
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [cityCenter, setCityCenter] = useState({ lat: 28.6139, lon: 77.2090 });
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState('Zone_0313');

  // Mitigation Sandbox Sliders
  const [deltaNdvi, setDeltaNdvi] = useState(0.15);
  const [deltaAlbedo, setDeltaAlbedo] = useState(0.20);
  const [deltaNdbi, setDeltaNdbi] = useState(-0.10);

  // API Data
  const [simulationData, setSimulationData] = useState(null);
  const [roiRankings, setRoiRankings] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'explain' | 'roi'
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch City Spatial Grid
  useEffect(() => {
    fetch(`${API_BASE_URL}/grid?city=${selectedCity}`)
      .then((res) => res.json())
      .then((data) => {
        setZones(data.zones || []);
        if (data.center) setCityCenter(data.center);
        if (data.zones && data.zones.length > 0) {
          const sorted = [...data.zones].sort((a, b) => b.lst - a.lst);
          setSelectedZoneId(sorted[0].zone_id);
        }
      })
      .catch((err) => console.error('Failed to fetch grid:', err));
  }, [selectedCity]);

  // Run Real-time Simulation Inference
  useEffect(() => {
    if (!selectedZoneId) return;

    fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: selectedCity,
        zone_id: selectedZoneId,
        delta_ndvi: deltaNdvi,
        delta_albedo: deltaAlbedo,
        delta_ndbi: deltaNdbi
      })
    })
      .then((res) => res.json())
      .then((data) => setSimulationData(data))
      .catch((err) => console.error('Simulation calculation error:', err));
  }, [selectedCity, selectedZoneId, deltaNdvi, deltaAlbedo, deltaNdbi]);

  // Fetch ROI Rankings
  useEffect(() => {
    fetch(`${API_BASE_URL}/roi-ranking?city=${selectedCity}&limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (data.candidates) setRoiRankings(data.candidates);
      })
      .catch((err) => console.error('ROI ranking fetch error:', err));
  }, [selectedCity]);

  // Apply Preset Scenario
  const handleApplyScenario = (sc) => {
    setDeltaNdvi(sc.delta_ndvi);
    setDeltaAlbedo(sc.delta_albedo);
    setDeltaNdbi(sc.delta_ndbi);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-3 sm:p-5 max-w-[1500px] mx-auto">
      {/* Mobile-Friendly Header */}
      <Header
        cities={cities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Responsive Metric Cards */}
      <MetricCards
        simulationData={simulationData}
        selectedZoneId={selectedZoneId}
      />

      {/* Main Grid: Left Sandbox Controls | Right Workspace Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Sandbox Column (lg: 5 cols) */}
        <div className="lg:col-span-5 h-full">
          <MitigationSandbox
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            deltaNdvi={deltaNdvi}
            onChangeNdvi={setDeltaNdvi}
            deltaAlbedo={deltaAlbedo}
            onChangeAlbedo={setDeltaAlbedo}
            deltaNdbi={deltaNdbi}
            onChangeNdbi={setDeltaNdbi}
            costBreakdown={simulationData?.cost_breakdown}
            onApplyScenario={handleApplyScenario}
          />
        </div>

        {/* Right Workspace Tab Column (lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>🗺️ Heat Map</span>
            </button>

            <button
              onClick={() => setActiveTab('explain')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'explain'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>🔬 Driver XAI</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'roi'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>📊 Candidates</span>
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'map' && (
              <ThermalMap
                zones={zones}
                center={cityCenter}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
              />
            )}

            {activeTab === 'explain' && (
              <ShapAttribution
                shapAttribution={simulationData?.shap_attribution}
                selectedZoneId={selectedZoneId}
                baselineLst={simulationData?.baseline_lst}
              />
            )}

            {activeTab === 'roi' && (
              <RoiRanking
                rankings={roiRankings}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Policy Report Modal */}
      <PolicyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        simulationData={simulationData}
        city={selectedCity}
        selectedZoneId={selectedZoneId}
      />

      {/* OpenAI Copilot Interactive Assistant Drawer */}
      <AiCopilotDrawer
        city={selectedCity}
        selectedZoneId={selectedZoneId}
        simulationData={simulationData}
      />
    </div>
  );
}
