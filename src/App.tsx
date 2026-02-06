import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { LandingPage } from './pages/LandingPage';
import { BuilderIntro } from './pages/BuilderIntro';
import { BuilderStep1 } from './pages/BuilderStep1';
import { BuilderStep2 } from './pages/BuilderStep2';
import { BuilderStep3 } from './pages/BuilderStep3';
import { BuilderStep4 } from './pages/BuilderStep4';
import { BuilderStep5 } from './pages/BuilderStep5';
import { BuilderSummary } from './pages/BuilderSummary';
import { DeployPage } from './pages/DeployPage';
import { CanvasEditor } from './pages/CanvasEditor/CanvasEditor';
import { ApyDataProvider } from './components/providers/ApyDataProvider';

function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'var(--font-mono)' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '8px' }}>404</h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Page not found</p>
      <a href="/" style={{ fontSize: '12px', color: '#1a1a1a', textDecoration: 'underline' }}>Back to Home</a>
    </div>
  );
}

function App() {
  return (
    <ApyDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/builder/intro" element={<BuilderIntro />} />
          <Route path="/builder/step-1" element={<BuilderStep1 />} />
          <Route path="/builder/step-2" element={<BuilderStep2 />} />
          <Route path="/builder/step-3" element={<BuilderStep3 />} />
          <Route path="/builder/step-4" element={<BuilderStep4 />} />
          <Route path="/builder/step-5" element={<BuilderStep5 />} />
          <Route path="/builder/summary" element={<BuilderSummary />} />
          <Route path="/builder/canvas" element={<CanvasEditor />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ApyDataProvider>
  );
}

export default App;
