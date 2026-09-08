import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';
import { Answer, ResponseType, UnderstandingFeedback } from '../domain';

export function useStudyEngine(questionId: string) {
  const { activeSession, addAnswer, updateAnswerFeedback, updateSession } = useStudySession();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'answering' | 'correction'>('answering');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [responseType, setResponseType] = useState<ResponseType>('answered');

  useEffect(() => {
    setStatus('answering');
    setSelectedOption(null);
    setStartTime(Date.now());
    setResponseType('answered');
  }, [questionId]);

  const confirmAnswer = useCallback((isCorrect: boolean, isDontKnow: boolean = false) => {
    if (!activeSession) return;

    const timeTaken = Date.now() - startTime;
    const rType: ResponseType = isDontKnow ? 'dont_know' : 'answered';

    const answer: Answer = {
      id: `ans_${Date.now()}`,
      sessionId: activeSession.id,
      questionId,
      selectedOptionId: isDontKnow ? undefined : (selectedOption || undefined),
      responseType: rType,
      isCorrect,
      responseTimeMs: timeTaken,
      answeredAt: new Date(),
    };

    addAnswer(answer);
    setResponseType(rType);
    setStatus('correction');
  }, [activeSession, startTime, questionId, selectedOption, addAnswer]);

  const handleFeedback = useCallback((feedback: UnderstandingFeedback) => {
    updateAnswerFeedback(questionId, feedback);
  }, [questionId, updateAnswerFeedback]);

  const nextQuestion = useCallback(() => {
    if (!activeSession) return;

    if (activeSession.currentQuestionIndex < activeSession.questionIds.length - 1) {
      updateSession({ currentQuestionIndex: activeSession.currentQuestionIndex + 1 });
    } else {
      updateSession({ status: 'finished', finishedAt: new Date() });
      navigate('/resultado-sessao');
    }
  }, [activeSession, updateSession, navigate]);

  return {
    status,
    selectedOption,
    setSelectedOption,
    confirmAnswer,
    handleFeedback,
    nextQuestion,
    responseType
  };
}
