import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ExamQuestion,
  QuestionUserResponse,
  OptionKey,
  QuestionStatus,
  ExamReport,
} from '../types/exam';
import { assessmentApi } from '../../../services/api';

interface UseExamSessionProps {
  initialSessionId?: string | null;
}

export function useExamSession({ initialSessionId }: UseExamSessionProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [testTitle, setTestTitle] = useState<string>('Diagnostic Assessment');
  const [candidateAlias, setCandidateAlias] = useState<string>('Student Candidate');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, QuestionUserResponse>>({});
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<Set<string>>(new Set());
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number>(900);
  const [examStatus, setExamStatus] = useState<'LOADING' | 'READY' | 'SUBMITTING' | 'COMPLETED' | 'ERROR'>('LOADING');
  const [report, setReport] = useState<ExamReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Autosave debounce timer
  const autosaveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // 1. Initialize or Load Session
  const initSession = useCallback(async (sid?: string | null) => {
    setExamStatus('LOADING');
    setErrorMessage(null);
    try {
      let data: any;
      if (sid) {
        // Try to resume existing session; if not found, create a new one gracefully
        try {
          data = await assessmentApi.getSession(sid);
        } catch {
          data = await assessmentApi.startSession({
            test_title: 'Diagnostic Assessment — Full Skill Calibration',
          });
        }
      } else {
        // Start new session
        data = await assessmentApi.startSession({
          test_title: 'Diagnostic Assessment — Full Skill Calibration',
        });
      }

      setSessionId(data.session_id);
      setTestTitle(data.test_title || 'Diagnostic Assessment');
      setCandidateAlias(data.student_id ? `Candidate #${data.student_id.slice(-6)}` : 'Candidate #SIH26');
      setQuestions(data.questions || []);
      setInitialTimeSeconds(data.time_remaining_seconds || data.total_time_seconds || 900);

      // Restore saved responses if any
      const initialResponses: Record<string, QuestionUserResponse> = {};
      const initialVisited = new Set<string>();

      if (data.saved_responses) {
        Object.entries(data.saved_responses).forEach(([qId, val]: [string, any]) => {
          initialResponses[qId] = {
            selected_option: val.selected_option || null,
            selected_options: val.selected_options || [],
            is_marked_for_review: Boolean(val.is_marked_for_review),
            time_spent_seconds: val.time_spent_seconds || 0,
          };
          if (val.selected_option || val.is_marked_for_review) {
            initialVisited.add(qId);
          }
        });
      }

      // Mark first question as visited
      if (data.questions && data.questions.length > 0) {
        const firstId = data.questions[0].id;
        initialVisited.add(firstId);
        if (!initialResponses[firstId]) {
          initialResponses[firstId] = {
            selected_option: null,
            is_marked_for_review: false,
            time_spent_seconds: 0,
          };
        }
      }

      setResponses(initialResponses);
      setVisitedQuestionIds(initialVisited);
      setCurrentIndex(data.current_question_index || 0);

      if (data.status === 'COMPLETED') {
        const fullReport = await assessmentApi.getReport(data.session_id);
        setReport(fullReport);
        setExamStatus('COMPLETED');
      } else {
        setExamStatus('READY');
      }
    } catch (err) {
      console.error('Failed to initialize session:', err);
      setErrorMessage((err as Error).message);
      setExamStatus('ERROR');
    }
  }, []);

  useEffect(() => {
    initSession(initialSessionId);
  }, [initialSessionId, initSession]);

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const currentResponse = useMemo(() => {
    if (!currentQuestion) return null;
    return responses[currentQuestion.id] || {
      selected_option: null,
      is_marked_for_review: false,
      time_spent_seconds: 0,
    };
  }, [currentQuestion, responses]);

  // Autosave dispatcher
  const dispatchAutoSave = useCallback((qId: string, updated: QuestionUserResponse) => {
    if (!sessionId) return;

    if (autosaveTimeoutRef.current[qId]) {
      clearTimeout(autosaveTimeoutRef.current[qId]);
    }

    autosaveTimeoutRef.current[qId] = setTimeout(() => {
      assessmentApi.saveAnswer(sessionId, {
        question_id: qId,
        selected_option: updated.selected_option,
        is_marked_for_review: updated.is_marked_for_review,
        time_spent_delta_seconds: 1,
      }).catch(err => {
        console.warn(`[Autosave] Failed for question ${qId}:`, err.message);
      });
    }, 250);
  }, [sessionId]);

  // Option selection
  const selectOption = useCallback((opt: OptionKey) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setResponses(prev => {
      const existing = prev[qId] || {
        selected_option: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
      };
      const nextVal: QuestionUserResponse = {
        ...existing,
        selected_option: opt,
      };
      dispatchAutoSave(qId, nextVal);
      return { ...prev, [qId]: nextVal };
    });

    setVisitedQuestionIds(prev => new Set(prev).add(qId));
  }, [currentQuestion, dispatchAutoSave]);

  // Clear current response
  const clearOption = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setResponses(prev => {
      const existing = prev[qId] || {
        selected_option: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
      };
      const nextVal: QuestionUserResponse = {
        ...existing,
        selected_option: null,
      };
      dispatchAutoSave(qId, nextVal);
      return { ...prev, [qId]: nextVal };
    });
  }, [currentQuestion, dispatchAutoSave]);

  // Mark for review toggle
  const toggleMarkForReview = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setResponses(prev => {
      const existing = prev[qId] || {
        selected_option: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
      };
      const nextVal: QuestionUserResponse = {
        ...existing,
        is_marked_for_review: !existing.is_marked_for_review,
      };
      dispatchAutoSave(qId, nextVal);
      return { ...prev, [qId]: nextVal };
    });
    setVisitedQuestionIds(prev => new Set(prev).add(qId));
  }, [currentQuestion, dispatchAutoSave]);

  // Navigation
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      const targetQ = questions[index];
      if (targetQ) {
        setVisitedQuestionIds(prev => new Set(prev).add(targetQ.id));
      }
    }
  }, [questions]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, goToQuestion]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  // Status per question for Palette
  const getQuestionStatus = useCallback((qId: string): QuestionStatus => {
    const resp = responses[qId];
    const isVisited = visitedQuestionIds.has(qId);

    if (resp?.is_marked_for_review) return 'MARKED_FOR_REVIEW';
    if (resp?.selected_option) return 'ANSWERED';
    if (isVisited) return 'VISITED';
    return 'NOT_VISITED';
  }, [responses, visitedQuestionIds]);

  // Palette counts
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let visited = 0;
    let notVisited = 0;

    questions.forEach(q => {
      const st = getQuestionStatus(q.id);
      if (st === 'ANSWERED') answered++;
      else if (st === 'MARKED_FOR_REVIEW') marked++;
      else if (st === 'VISITED') visited++;
      else notVisited++;
    });

    return { answered, marked, visited, notVisited, total: questions.length };
  }, [questions, getQuestionStatus]);

  // Submission
  const submitExam = useCallback(async () => {
    if (!sessionId) return;
    setExamStatus('SUBMITTING');

    try {
      const answerPayload = questions.map(q => {
        const resp = responses[q.id];
        return {
          question_id: q.id,
          selected_option: resp?.selected_option || null,
          time_spent_seconds: resp?.time_spent_seconds || 10,
        };
      });

      await assessmentApi.submitAssessment(sessionId, {
        answers: answerPayload,
      });

      const fullReport = await assessmentApi.getReport(sessionId);
      setReport(fullReport);
      setExamStatus('COMPLETED');
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setErrorMessage((err as Error).message);
      setExamStatus('READY'); // Revert so user can retry
    }
  }, [sessionId, questions, responses]);

  return {
    sessionId,
    testTitle,
    candidateAlias,
    questions,
    currentIndex,
    initialTimeSeconds,
    currentQuestion,
    currentResponse,
    examStatus,
    report,
    errorMessage,
    summaryCounts,
    selectOption,
    clearOption,
    toggleMarkForReview,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    getQuestionStatus,
    submitExam,
    initSession,
  };
}
