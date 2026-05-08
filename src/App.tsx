import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import DewPoint from './pages/calculators/DewPoint';
import FSPL from './pages/calculators/FSPL';
import Dilution from './pages/calculators/Dilution';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculators/dew-point" element={<DewPoint />} />
        <Route path="/calculators/fspl" element={<FSPL />} />
        <Route path="/calculators/dilution" element={<Dilution />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
