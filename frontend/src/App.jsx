import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ThermalMap from './components/ThermalMap';
import BeforeAfterHeatMap from './components/BeforeAfterHeatMap';
import ShapAttribution from './components/ShapAttribution';
import PriorityHotspotsPanel from './components/PriorityHotspotsPanel';
import RoiRanking from './components/RoiRanking';
import HeatHistory from './components/HeatHistory';
import PolicyReportModal from './components/PolicyReportModal';
import AiCopilotDrawer from './components/AiCopilotDrawer';
import LoadingScreen from './components/LoadingScreen';
import { Map, Columns, Cpu, Award, TrendingUp } from 'lucide-react';

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

  // Page View Navigation State ('home' | 'dashboard')
  const [pageView, setPageView] = useState('home');

  // App Splash / Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Mitigation Sandbox Sliders & Planning Constraints
  const [deltaNdvi, setDeltaNdvi] = useState(0.15);
  const [deltaAlbedo, setDeltaAlbedo] = useState(0.20);
  const [deltaNdbi, setDeltaNdbi] = useState(-0.10);
  const [userBudgetInr, setUserBudgetInr] = useState(1500000); // Default ₹15 Lakhs
  const [userWaterLpd, setUserWaterLpd] = useState(5000);       // Default 5,000 L/day

  // API Data
  const [simulationData, setSimulationData] = useState(null);
  const [roiRankings, setRoiRankings] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'explain' | 'roi' | 'history'
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Handle City Change
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    setIsLoading(true);
  };

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
        delta_ndbi: deltaNdbi,
        user_budget_inr: userBudgetInr,
        user_water_lpd: userWaterLpd
      })
    })
      .then((res) => res.json())
      .then((data) => setSimulationData(data))
      .catch((err) => console.error('Simulation calculation error:', err));
  }, [selectedCity, selectedZoneId, deltaNdvi, deltaAlbedo, deltaNdbi, userBudgetInr, userWaterLpd]);

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
    <div className="min-h-screen bg-[#07080b] text-slate-100 p-2.5 sm:p-5 max-w-7xl mx-auto selection:bg-[#b5f639]/30 selection:text-[#b5f639] relative overflow-x-hidden">
      {/* High-Tech Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen
          cityName={cities.find((c) => c.key === selectedCity)?.name || selectedCity}
          onFinish={() => setIsLoading(false)}
        />
      )}

      {/* Mobile-Friendly Floating Header with Page Switcher */}
      {!isLoading && (
        <Header
          cities={cities}
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          onOpenReport={() => setIsReportOpen(true)}
          pageView={pageView}
          onNavigatePage={setPageView}
        />
      )}

      {/* Page View 1: Home Page with Smooth Transition */}
      {pageView === 'home' ? (
        <div key="home" className="animate-page-transition">
          <HomePage
            cities={cities}
            selectedCity={selectedCity}
            onSelectCity={(city) => {
              setSelectedCity(city);
              setIsLoading(true);
            }}
            onLaunchDashboard={() => setPageView('dashboard')}
          />
        </div>
      ) : (
        /* Page View 2: Live Analytics Matrix Dashboard */
        <div key="dashboard" className="space-y-6 animate-page-transition">
          {/* Main Full-Width Workspace Container */}
      <div className="w-full mb-8">
        <div className="bento-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
          {/* Integrated Header Bar with Workspace Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#b5f639]/10 text-[#b5f639]">
                {activeTab === 'map' && <Map className="w-4 h-4" />}
                {activeTab === 'compare' && <Columns className="w-4 h-4" />}
                {activeTab === 'explain' && <Cpu className="w-4 h-4" />}
                {activeTab === 'roi' && <Award className="w-4 h-4" />}
                {activeTab === 'history' && <TrendingUp className="w-4 h-4" />}
              </div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {activeTab === 'map' && 'Urban Spatial Heat Map'}
                {activeTab === 'compare' && 'Before vs After Heat Map Scenario Comparison'}
                {activeTab === 'explain' && 'Why Is This Area Hot? (XAI Diagnostics)'}
                {activeTab === 'roi' && 'Priority Candidate Hotspots'}
                {activeTab === 'history' && 'Heat History & Trend Analysis'}
              </h3>
            </div>

            {/* Workspace Pill Switcher */}
            <div className="flex flex-wrap items-center bg-[#07080b] p-1 rounded-full border border-white/10 text-xs gap-0.5">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'map' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Heat Map</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'compare' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Before vs After</span>
              </button>

              <button
                onClick={() => setActiveTab('explain')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'explain' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Why Is Area Hot?</span>
              </button>

              <button
                onClick={() => setActiveTab('roi')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'roi' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Candidates</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeTab === 'history' ? 'bg-[#b5f639] text-[#07080b] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Heat History</span>
              </button>
            </div>
          </div>

          {/* Active Content View with Smooth Fade Transition */}
          <div key={activeTab} className="flex-1 w-full flex flex-col justify-between animate-fade-in">
            {activeTab === 'map' && (
              <ThermalMap
                city={selectedCity}
                zones={zones}
                center={cityCenter}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
                deltaNdvi={deltaNdvi}
                onChangeNdvi={setDeltaNdvi}
                deltaAlbedo={deltaAlbedo}
                onChangeAlbedo={setDeltaAlbedo}
                deltaNdbi={deltaNdbi}
                onChangeNdbi={setDeltaNdbi}
                userBudgetInr={userBudgetInr}
                onChangeBudget={setUserBudgetInr}
                userWaterLpd={userWaterLpd}
                onChangeWater={setUserWaterLpd}
                onApplyScenario={handleApplyScenario}
                simulationData={simulationData}
                hideHeader={true}
              />
            )}

            {activeTab === 'compare' && (
              <BeforeAfterHeatMap
                city={selectedCity}
                center={cityCenter}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
                deltaNdvi={deltaNdvi}
                deltaAlbedo={deltaAlbedo}
                deltaNdbi={deltaNdbi}
              />
            )}

            {activeTab === 'explain' && (
              <ShapAttribution
                simulationData={simulationData}
                shapAttribution={simulationData?.shap_attribution}
                selectedZoneId={selectedZoneId}
                baselineLst={simulationData?.baseline_lst}
                hideHeader={true}
              />
            )}

            {activeTab === 'roi' && (
              <PriorityHotspotsPanel
                city={selectedCity}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
                hideHeader={true}
              />
            )}

            {activeTab === 'history' && (
              <HeatHistory
                city={selectedCity}
                selectedZoneId={selectedZoneId}
                hideHeader={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )}

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
