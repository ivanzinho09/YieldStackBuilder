import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { LandingPage } from './pages/LandingPage';
import { BuilderStep1 } from './pages/BuilderStep1';
import { BuilderStep2 } from './pages/BuilderStep2';
import { BuilderStep3 } from './pages/BuilderStep3';
import { BuilderStep4 } from './pages/BuilderStep4';
import { BuilderStep5 } from './pages/BuilderStep5';
import { BuilderSummary } from './pages/BuilderSummary';
import { CanvasEditor } from './pages/CanvasEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder/step-1" element={<BuilderStep1 />} />
        <Route path="/builder/step-2" element={<BuilderStep2 />} />
        <Route path="/builder/step-3" element={<BuilderStep3 />} />
        <Route path="/builder/step-4" element={<BuilderStep4 />} />
        <Route path="/builder/step-5" element={<BuilderStep5 />} />
        <Route path="/builder/summary" element={<BuilderSummary />} />
        <Route path="/builder/canvas" element={<CanvasEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
