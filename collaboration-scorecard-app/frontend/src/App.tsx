import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntakePage from './pages/intake';
import SummaryPage from './pages/summary';
import AdminPage from './pages/admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntakePage />} />
        <Route path="/intake" element={<IntakePage />} />
        <Route path="/intake/:assessmentId" element={<IntakePage />} />
        <Route path="/summary/:assessmentId" element={<SummaryPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
