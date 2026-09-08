import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudySession } from '../domain';

interface StudySessionContextType {
  activeSession: StudySession | null;
  startSession: (session: StudySession) => void;
  endSession: () => void;
  updateSession: (session: Partial<StudySession>) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);

  const startSession = (session: StudySession) => {
    setActiveSession(session);
  };

  const endSession = () => {
    setActiveSession(null);
  };

  const updateSession = (updates: Partial<StudySession>) => {
    setActiveSession((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <StudySessionContext.Provider value={{ activeSession, startSession, endSession, updateSession }}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error('useStudySession must be used within a StudySessionProvider');
  }
  return context;
}
