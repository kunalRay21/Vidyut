import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ExamQuestion,
  QuestionUserResponse,
  OptionKey,
  CodingLanguage,
  QuestionStatus,
  ExamReport,
} from '../types/exam';
import { assessmentApi, getStoredUser, setStoredUser } from '../../../services/api';
import { DEFAULT_EXAM_QUESTIONS } from '../data/defaultQuestions';

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
  const [initialTimeSeconds, setInitialTimeSeconds] = useState<number>(1800);
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
      let data: any = null;
      let resolvedQuestions: ExamQuestion[] = [];
      let resolvedSessionId: string = sid || '';

      if (sid) {
        try {
          data = await assessmentApi.getSession(sid);
          if (data && Array.isArray(data.questions) && data.questions.length > 0) {
            resolvedQuestions = data.questions;
            resolvedSessionId = data.session_id || sid;
          }
        } catch {
          try {
            data = await assessmentApi.startSession({
              test_title: 'Diagnostic Assessment — 10 MCQs & 5 Coding Challenges',
            });
            if (data && Array.isArray(data.questions) && data.questions.length > 0) {
              resolvedQuestions = data.questions;
              resolvedSessionId = data.session_id || sid;
            }
          } catch {
            // Check cache below
          }
        }
      } else {
        try {
          data = await assessmentApi.startSession({
            test_title: 'Diagnostic Assessment — 10 MCQs & 5 Coding Challenges',
          });
          if (data && Array.isArray(data.questions) && data.questions.length > 0) {
            resolvedQuestions = data.questions;
            resolvedSessionId = data.session_id;
          }
        } catch {
          // Check cache below
        }
      }

      // Check localStorage cached questions if still empty
      if (resolvedQuestions.length === 0 && sid) {
        try {
          const cached = localStorage.getItem(`session_${sid}_questions`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resolvedQuestions = parsed;
            }
          }
        } catch {
          // Fallback to default
        }
      }

      // Final fallback to canonical DEFAULT_EXAM_QUESTIONS
      if (resolvedQuestions.length === 0) {
        resolvedQuestions = DEFAULT_EXAM_QUESTIONS;
        if (!resolvedSessionId) {
          resolvedSessionId = `local-sess-${Date.now()}`;
        }
      }

      setSessionId(resolvedSessionId);
      setTestTitle(data?.test_title || 'Diagnostic Assessment — 10 MCQs & 5 Coding Challenges');
      setCandidateAlias(data?.student_id ? `Candidate #${data.student_id.slice(-6)}` : 'Candidate #SIH26');
      setQuestions(resolvedQuestions);
      setInitialTimeSeconds(data?.time_remaining_seconds || data?.total_time_seconds || 1800);

      // Restore saved responses if any
      const initialResponses: Record<string, QuestionUserResponse> = {};
      const initialVisited = new Set<string>();

      if (data?.saved_responses) {
        Object.entries(data.saved_responses).forEach(([qId, val]: [string, any]) => {
          initialResponses[qId] = {
            selected_option: val.selected_option || null,
            selected_options: val.selected_options || [],
            is_marked_for_review: Boolean(val.is_marked_for_review),
            time_spent_seconds: val.time_spent_seconds || 0,
            coding_language: val.coding_language || 'python',
            code_solution: val.code_solution || '',
          };
          if (val.selected_option || val.is_marked_for_review || (val.code_solution && val.code_solution.length > 20)) {
            initialVisited.add(qId);
          }
        });
      }

      // Initialize default boilerplate for questions
      resolvedQuestions.forEach((q: ExamQuestion) => {
        if (!initialResponses[q.id]) {
          const defaultCode = q.starter_code ? q.starter_code.python : '';
          initialResponses[q.id] = {
            selected_option: null,
            is_marked_for_review: false,
            time_spent_seconds: 0,
            coding_language: 'python',
            code_solution: defaultCode,
          };
        }
      });
      if (resolvedQuestions.length > 0) {
        initialVisited.add(resolvedQuestions[0].id);
      }

      setResponses(initialResponses);
      setVisitedQuestionIds(initialVisited);
      setCurrentIndex(Math.max(0, Math.min(data?.current_question_index || 0, resolvedQuestions.length - 1)));

      if (data?.status === 'COMPLETED') {
        const fullReport = await assessmentApi.getReport(data.session_id);
        setReport(fullReport);
        setExamStatus('COMPLETED');
      } else {
        setExamStatus('READY');
      }
    } catch (err) {
      console.warn('Session initialization encountered error, loading canonical fallback:', err);
      // Ensure questions are always visible even on unexpected errors
      setQuestions(DEFAULT_EXAM_QUESTIONS);
      setSessionId(sid || `offline-session-${Date.now()}`);
      setExamStatus('READY');
    }
  }, []);

  useEffect(() => {
    initSession(initialSessionId);
  }, [initialSessionId, initSession]);

  const currentQuestion = useMemo(() => {
    if (!questions || questions.length === 0) return null;
    const safeIdx = Math.max(0, Math.min(currentIndex, questions.length - 1));
    return questions[safeIdx] || null;
  }, [questions, currentIndex]);

  const currentResponse = useMemo(() => {
    if (!currentQuestion) return null;
    return responses[currentQuestion.id] || {
      selected_option: null,
      is_marked_for_review: false,
      time_spent_seconds: 0,
      coding_language: 'python',
      code_solution: currentQuestion.starter_code ? currentQuestion.starter_code.python : '',
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
        coding_language: updated.coding_language,
        code_solution: updated.code_solution,
        time_spent_delta_seconds: 1,
      }).catch(err => {
        console.warn(`[Autosave] Failed for question ${qId}:`, err.message);
      });
    }, 250);
  }, [sessionId]);

  // Option selection for MCQs
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

  // Code solution update for Coding challenges
  const updateCodeSolution = useCallback((code: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setResponses(prev => {
      const existing = prev[qId] || {
        selected_option: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
        coding_language: 'python',
        code_solution: '',
      };
      const nextVal: QuestionUserResponse = {
        ...existing,
        code_solution: code,
      };
      dispatchAutoSave(qId, nextVal);
      return { ...prev, [qId]: nextVal };
    });
    setVisitedQuestionIds(prev => new Set(prev).add(qId));
  }, [currentQuestion, dispatchAutoSave]);

  // Submit code solution for current or specific coding question
  const submitCodeSolution = useCallback((qId?: string) => {
    const targetId = qId || currentQuestion?.id;
    if (!targetId) return;

    setResponses(prev => {
      const existing = prev[targetId];
      if (!existing) return prev;
      const nextVal: QuestionUserResponse = {
        ...existing,
        is_code_submitted: true,
      };
      dispatchAutoSave(targetId, nextVal);
      return { ...prev, [targetId]: nextVal };
    });
  }, [currentQuestion, dispatchAutoSave]);

  // Coding language change
  const updateCodingLanguage = useCallback((lang: CodingLanguage) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setResponses(prev => {
      const existing = prev[qId] || {
        selected_option: null,
        is_marked_for_review: false,
        time_spent_seconds: 0,
        coding_language: lang,
        code_solution: '',
      };
      const starter = currentQuestion.starter_code ? currentQuestion.starter_code[lang] : '';
      const nextVal: QuestionUserResponse = {
        ...existing,
        coding_language: lang,
        code_solution: existing.code_solution && existing.code_solution !== currentQuestion.starter_code?.[existing.coding_language || 'python']
          ? existing.code_solution
          : starter,
      };
      dispatchAutoSave(qId, nextVal);
      return { ...prev, [qId]: nextVal };
    });
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
    const targetQ = questions.find(q => q.id === qId);

    if (resp?.is_marked_for_review) return 'MARKED_FOR_REVIEW';

    if (targetQ?.section === 'CODING') {
      const isCustomCode = Boolean(
        resp?.code_solution &&
        resp.code_solution.trim().length > 25 &&
        resp.code_solution.trim() !== targetQ.starter_code?.[resp.coding_language || 'python']?.trim()
      );

      if (resp?.is_code_submitted || isCustomCode) {
        return 'ANSWERED';
      }
    } else {
      if (resp?.selected_option) return 'ANSWERED';
    }

    if (isVisited) return 'VISITED';
    return 'NOT_VISITED';
  }, [responses, visitedQuestionIds, questions]);

  // Palette counts
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let marked = 0;
    let visited = 0;
    let notVisited = 0;
    let codingCompleted = 0;

    questions.forEach(q => {
      const st = getQuestionStatus(q.id);
      if (st === 'ANSWERED') {
        answered++;
        if (q.section === 'CODING') codingCompleted++;
      } else if (st === 'MARKED_FOR_REVIEW') marked++;
      else if (st === 'VISITED') visited++;
      else notVisited++;
    });

    return {
      answered,
      marked,
      visited,
      notVisited,
      total: questions.length,
      codingCompleted,
      codingRequired: 4,
    };
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
          time_spent_seconds: resp?.time_spent_seconds || 15,
          coding_language: resp?.coding_language,
          code_solution: resp?.code_solution,
        };
      });

      await assessmentApi.submitAssessment(sessionId, {
        answers: answerPayload,
      });

      const fullReport = await assessmentApi.getReport(sessionId);
      setReport(fullReport);
      setExamStatus('COMPLETED');

      // 1. Cache latest assessment result for immediate dashboard and roadmap inheritance
      const storedUser = getStoredUser();
      const scoreData = {
        student_id: storedUser?.student_profile_id || storedUser?.id,
        session_id: fullReport.session_id || sessionId,
        test_title: fullReport.test_title || testTitle,
        role_id: fullReport.role_id,
        overall_accuracy_pct: fullReport.overall_accuracy_pct,
        overall_readiness_pct: fullReport.overall_readiness_pct,
        correct_answers: fullReport.correct_answers,
        total_questions: fullReport.total_questions,
        coding_completed_count: fullReport.coding_completed_count,
        skill_scores: fullReport.skill_scores || [],
        discrepancies: fullReport.discrepancies || [],
        completed_at: fullReport.completed_at || new Date().toISOString(),
      };
      localStorage.setItem('assessment_result', JSON.stringify(scoreData));

      // 2. Append to multi-course assessment history
      try {
        const historyRaw = localStorage.getItem('assessment_history');
        const history: any[] = historyRaw ? JSON.parse(historyRaw) : [];
        const filtered = history.filter((h: any) => h.session_id !== scoreData.session_id);
        filtered.unshift(scoreData);
        localStorage.setItem('assessment_history', JSON.stringify(filtered.slice(0, 10)));
      } catch (e) {
        console.warn('History save error:', e);
      }

      // 3. Update multi-course progress map (course_progress_map)
      try {
        const progressMapRaw = localStorage.getItem('course_progress_map');
        const progressMap: Record<string, any> = progressMapRaw ? JSON.parse(progressMapRaw) : {};
        const trackKey = scoreData.role_id || scoreData.test_title || 'default';
        progressMap[trackKey] = {
          role_id: scoreData.role_id,
          test_title: scoreData.test_title,
          accuracy: scoreData.overall_accuracy_pct,
          readiness: scoreData.overall_readiness_pct,
          skill_scores: scoreData.skill_scores,
          completed_at: scoreData.completed_at,
          status: 'COMPLETED',
        };
        localStorage.setItem('course_progress_map', JSON.stringify(progressMap));
      } catch (e) {
        console.warn('Progress map save error:', e);
      }

      // 4. Update stored user profile in localStorage
      try {
        if (storedUser) {
          setStoredUser({
            ...storedUser,
            readiness_pct: scoreData.overall_readiness_pct || scoreData.overall_accuracy_pct,
            selected_role: scoreData.test_title || storedUser.selected_role,
            selected_role_id: scoreData.role_id || storedUser.selected_role_id,
          });
        }
      } catch (e) {
        console.warn('Stored user update error:', e);
      }
    } catch (err) {
      console.error('Failed to submit exam:', err);
      setErrorMessage((err as Error).message);
      setExamStatus('READY');
    }
  }, [sessionId, questions, responses, testTitle]);

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
    updateCodeSolution,
    updateCodingLanguage,
    submitCodeSolution,
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
