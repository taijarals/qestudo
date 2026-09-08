import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Materials } from './pages/Materials';
import { StudyConfig } from './pages/StudyConfig';
import { StudySession } from './pages/StudySession';
import { Performance } from './pages/Performance';
import { ErrorNotebook } from './pages/ErrorNotebook';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materiais" element={<Materials />} />
          <Route path="/estudar" element={<StudyConfig />} />
          <Route path="/sessao" element={<StudySession />} />
          <Route path="/desempenho" element={<Performance />} />
          <Route path="/erros" element={<ErrorNotebook />} />
          <Route path="/configuracoes" element={<div className="p-8">Configurações (Em breve)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

