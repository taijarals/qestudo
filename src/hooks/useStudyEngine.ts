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
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus('answering');
    setSelectedOption(null);
    setStartTime(Date.now());
    setResponseType('answered');
    setAnswerId(null);
    setFeedbackStatus(null);
  }, [questionId]);

  const confirmAnswer = useCallback(async (isCorrect: boolean, isDontKnow: boolean = false) => {
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

    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          questionId,
          selectedOptionId: isDontKnow ? undefined : selectedOption,
          responseType: rType,
          timeSpent: timeTaken
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnswerId(data.answerId);
      }
    } catch(e) {
      console.error('Failed to submit answer to backend', e);
    }
    
  }, [activeSession, startTime, questionId, selectedOption, addAnswer]);

  const handleFeedback = useCallback(async (feedback: UnderstandingFeedback) => {
    updateAnswerFeedback(questionId, feedback);
    if (answerId) {
       try {
         await fetch(`/api/answers/${answerId}/comprehension`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ feedback })
         });
         setFeedbackStatus(feedback);
       } catch (e) {
         console.error('Failed to submit feedback', e);
       }
    }
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
    feedbackStatus,
    selectedOption,
    setSelectedOption,
    confirmAnswer,
    handleFeedback,
    nextQuestion,
    responseType
  };
}
