import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Materials } from './pages/Materials';
import { MaterialDetails } from './pages/MaterialDetails';
import { StudyConfig } from './pages/StudyConfig';
import { StudySession } from './pages/StudySession';
import { Performance } from './pages/Performance';
import { ErrorNotebook } from './pages/ErrorNotebook';
import { SessionResult } from './pages/SessionResult';
import { StudySessionProvider } from './context/StudySessionContext';

export default function App() {
  return (
    <StudySessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/materiais" element={<Materials />} />
            <Route path="/materiais/:materialId" element={<MaterialDetails />} />
            <Route path="/estudar" element={<StudyConfig />} />
            <Route path="/sessao" element={<StudySession />} />
            <Route path="/resultado-sessao" element={<SessionResult />} />
            <Route path="/desempenho" element={<Performance />} />
            <Route path="/erros" element={<ErrorNotebook />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StudySessionProvider>
  );
}

