import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudySession, Answer, UnderstandingFeedback } from '../domain';

interface StudySessionContextType {
  activeSession: StudySession | null;
  answers: Answer[];
  startSession: (session: StudySession) => void;
  endSession: () => void;
  updateSession: (session: Partial<StudySession>) => void;
  addAnswer: (answer: Answer) => void;
  updateAnswerFeedback: (questionId: string, feedback: UnderstandingFeedback) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const startSession = (session: StudySession) => {
    setActiveSession(session);
    setAnswers([]); // Reset answers on new session
  };

  const endSession = () => {
    setActiveSession(null);
    setAnswers([]);
  };

  const updateSession = (updates: Partial<StudySession>) => {
    setActiveSession((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const addAnswer = (answer: Answer) => {
    setAnswers((prev) => [...prev, answer]);
  };

  const updateAnswerFeedback = (questionId: string, feedback: UnderstandingFeedback) => {
    setAnswers((prev) => 
      prev.map((ans) => 
        ans.questionId === questionId 
          ? { ...ans, understandingFeedback: feedback }
          : ans
      )
    );
  };

  return (
    <StudySessionContext.Provider value={{ 
      activeSession, answers, startSession, endSession, updateSession, addAnswer, updateAnswerFeedback 
    }}>
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
