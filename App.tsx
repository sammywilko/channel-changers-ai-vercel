import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BrandList } from './pages/Brands/BrandList';
import { BrandDetail } from './pages/Brands/BrandDetail';
import { ScriptList } from './pages/Scripts/ScriptList';
import { ScriptDetail } from './pages/Scripts/ScriptDetail';
import { ProductionList } from './pages/Productions/ProductionList';
import { Jobs } from './pages/Jobs';
import { ReportList } from './pages/Reports/ReportList';
import { VideoAnalysis } from './pages/Analysis/VideoAnalysis';
import { VideoGenerator } from './pages/Productions/VideoGenerator';
import { ImageGenerator } from './pages/Productions/ImageGenerator';
import { AudioGenerator } from './pages/Productions/AudioGenerator';
import { ImageAnalysis } from './pages/Analysis/ImageAnalysis';
import { TrendDashboard } from './pages/Trends/TrendDashboard';
import { Repurposer } from './pages/Repurposing/Repurposer';
import { LiveAssistant } from './pages/Live/LiveAssistant';
import { LocationScout } from './pages/Locations/LocationScout';
import { PodcastStudio } from './pages/Productions/PodcastStudio';
import { ShotDirector } from './pages/Productions/ShotDirector';
import { AssetManager } from './pages/Assets/AssetManager';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="brands" element={<BrandList />} />
          <Route path="brands/:id" element={<BrandDetail />} />

          <Route path="scripts" element={<ScriptList />} />
          <Route path="scripts/:id" element={<ScriptDetail />} />

          <Route path="productions" element={<ProductionList />} />
          <Route path="productions/generate" element={<VideoGenerator />} />
          <Route path="productions/images" element={<ImageGenerator />} />
          <Route path="productions/audio" element={<PodcastStudio />} />
          <Route path="productions/shots" element={<ShotDirector />} />
          <Route path="assets" element={<AssetManager />} />

          <Route path="analysis" element={<VideoAnalysis />} />
          <Route path="analysis/image" element={<ImageAnalysis />} />

          <Route path="trends" element={<TrendDashboard />} />
          <Route path="locations" element={<LocationScout />} />
          <Route path="repurpose" element={<Repurposer />} />
          <Route path="live" element={<LiveAssistant />} />

          <Route path="reports" element={<ReportList />} />
          <Route path="jobs" element={<Jobs />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;