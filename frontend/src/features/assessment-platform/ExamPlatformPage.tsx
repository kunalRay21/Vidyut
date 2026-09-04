import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from './hooks/useExamSession';
import { useExamTimer } from './hooks/useExamTimer';
import { useProctoring } from './hooks/useProctoring';
import { useDeviceCheck } from './hooks/useDeviceCheck';
import { useClipboardProtection } from './hooks/useClipboardProtection';
import { ExamNavbar } from './components/ExamNavbar';
import { QuestionPalette } from './components/QuestionPalette';
import { QuestionViewer } from './components/QuestionViewer';
import { OptionSelector } from './components/OptionSelector';
import { ActionToolbar } from './components/ActionToolbar';
import { ProctorAlertModal } from './components/ProctorAlertModal';
import { SubmitConfirmation } from './components/SubmitConfirmation';
import { ResultAnalyticsView } from './components/ResultAnalyticsView';
import { MobileRestrictedGate } from './components/MobileRestrictedGate';
import { FullscreenGateModal } from './components/FullscreenGateModal';
import { CodingWorkspace } from './components/CodingWorkspace';
import { AlertCircle, RefreshCw, ShieldAlert } from 'lucide-react';

export const ExamPlatformPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // 1. Mobile Device Check Gate (Restricts assessment on mobile)
  const { isMobile } = useDeviceCheck(1024);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // 2. Session state hook
  const {
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
  } = useExamSession({ initialSessionId: id });

  // 3. Timer hook with auto-submit upon expiry
  const handleTimerExpire = useCallback(() => {
    if (examStatus === 'READY') {
      submitExam();
    }
  }, [examStatus, submitExam]);

  const {
    formattedTime,
    isWarning,
    isUrgent,
  } = useExamTimer({
    sessionId,
    initialTimeSeconds: initialTimeSeconds || 900,
    onExpire: handleTimerExpire,
  });

  // 4. Forceful auto-submission at 4 tab-switch strikes
  const handleForcefulSubmit = useCallback(() => {
    console.warn('[Proctoring Alert] 4 tab switches exceeded. Forcefully completing test...');
    submitExam();
  }, [submitExam]);

  // 5. Proctoring hook (Strict 4-strike limit + Fullscreen monitoring)
  const {
    tabSwitchCount,
    showAlertModal,
    isFullscreen,
    hasEnteredFullscreenOnce,
    maxStrikes,
    isForceSubmitted,
    requestFullscreen,
    dismissAlert,
  } = useProctoring({
    sessionId,
    maxStrikes: 4,
    onMaxStrikesReached: handleForcefulSubmit,
    isActive: examStatus === 'READY',
  });

  // 6. Anti-Copy/Paste & Clipboard Protection (with DevTools / Inspect Mode Detection)
  const { warningMessage: clipboardWarning, isDevToolsOpen } = useClipboardProtection({
    isActive: examStatus === 'READY',
  });

  // Handle final submission confirm
  const handleConfirmSubmit = async () => {
    setIsSubmitModalOpen(false);
    await submitExam();
  };

  // Navigate to roadmap
  const handleNavigateRoadmap = () => {
    navigate('/roadmap');
  };

  // ----------------------------------------------------------------------------
  // Gate 1: Block mobile devices from starting/taking assessment
  // ----------------------------------------------------------------------------
  if (isMobile) {
    return <MobileRestrictedGate />;
  }

  // ----------------------------------------------------------------------------
  // Render Loading State
  // ----------------------------------------------------------------------------
  if (examStatus === 'LOADING') {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold font-heading text-slate-900 mb-1">
          Loading Examination Workspace...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Preparing calibrated questions and synchronizing diagnostic session.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Error State
  // ----------------------------------------------------------------------------
  if (examStatus === 'ERROR') {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mb-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold font-heading text-slate-900 mb-1">
          Assessment Session Error
        </h2>
        <p className="text-xs text-red-700 max-w-md mb-5 leading-relaxed">
          {errorMessage || 'Unable to connect to Vidyut assessment services.'}
        </p>
        <button
          onClick={() => initSession(id)}
          className="btn-saffron text-xs font-semibold py-2 px-5 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Completed / Report State
  // ----------------------------------------------------------------------------
  if (examStatus === 'COMPLETED' && report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="gov-tricolor-banner" />
        <ResultAnalyticsView
          report={report}
          onNavigateRoadmap={handleNavigateRoadmap}
          onRetake={() => initSession(null)}
        />
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Live Exam Mode (Protected Split-Pane Workspace)
  // ----------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white text-slate-800 select-none">
      {/* Clipboard Protection Warning Toast */}
      {clipboardWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-lg flex items-center gap-2 animate-fadeIn select-none">
          <ShieldAlert className="w-4 h-4 text-white flex-shrink-0" />
          <span>{clipboardWarning}</span>
        </div>
      )}

      {/* 1. Header Navbar (54px height) */}
      <ExamNavbar
        testTitle={testTitle}
        candidateAlias={candidateAlias}
        formattedTime={formattedTime}
        isWarning={isWarning}
        isUrgent={isUrgent}
        isFullscreen={isFullscreen}
        onRequestFullscreen={requestFullscreen}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        currentQuestionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />

      {/* 2. Main Workspace Split-Pane */}
      <div className="flex-1 flex overflow-hidden w-full select-none">
        {/* Left: Question Presentation & Options Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white select-none">
          {currentQuestion ? (
            <>
              {/* Scrollable Question Body (Copy Protected) */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 custom-scrollbar select-none">
                <div className="max-w-3xl mx-auto space-y-6 select-none">
                  {isDevToolsOpen ? (
                    <div className="p-16 text-center text-slate-500 font-mono text-xs select-none">
                      [Protected Assessment Content — Inspect Mode Disabled]
                    </div>
                  ) : (
                    <>
                      <QuestionViewer
                        question={currentQuestion}
                        questionNumber={currentIndex + 1}
                        totalQuestions={questions.length}
                      />

                      {currentQuestion.section === 'CODING' ? (
                        <CodingWorkspace
                          question={currentQuestion}
                          currentLanguage={currentResponse?.coding_language || 'python'}
                          currentCode={currentResponse?.code_solution ?? ''}
                          isSubmitted={currentResponse?.is_code_submitted}
                          onLanguageChange={updateCodingLanguage}
                          onCodeChange={updateCodeSolution}
                          onSubmitCode={() => submitCodeSolution(currentQuestion.id)}
                        />
                      ) : (
                        <OptionSelector
                          question={currentQuestion}
                          selectedOption={currentResponse?.selected_option || null}
                          onSelectOption={selectOption}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Fixed Bottom Action Toolbar */}
              <ActionToolbar
                hasSelectedOption={Boolean(
                  currentResponse?.selected_option ||
                  (currentQuestion.section === 'CODING' && currentResponse?.code_solution && currentResponse.code_solution.trim().length > 0)
                )}
                isMarkedForReview={Boolean(currentResponse?.is_marked_for_review)}
                isFirstQuestion={currentIndex === 0}
                isLastQuestion={currentIndex === questions.length - 1}
                onPrev={prevQuestion}
                onNext={nextQuestion}
                onClearOption={clearOption}
                onToggleMarkForReview={toggleMarkForReview}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              />
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 select-none">
              No diagnostic questions found.
            </div>
          )}
        </div>

        {/* Right: Question Matrix Navigator Sidebar */}
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          onSelectIndex={goToQuestion}
          getQuestionStatus={getQuestionStatus}
          summaryCounts={summaryCounts}
        />
      </div>

      {/* Gate 2: Fullscreen Mode Enforcement Modal (3-min countdown with forceful auto-submit) */}
      <FullscreenGateModal
        isOpen={!isFullscreen && examStatus === 'READY'}
        onEnterFullscreen={requestFullscreen}
        hasStarted={hasEnteredFullscreenOnce}
        onTimeoutAutoSubmit={submitExam}
      />

      {/* Gate 3: Anti-Inspect / DevTools Detected Security Shield */}
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
          <div className="max-w-md w-full bg-white rounded-2xl p-7 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold font-heading text-slate-900">
              Inspect Mode Restricted
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Developer Tools and Element Inspection are strictly prohibited during this assessment. Question and answer details have been removed from the DOM to maintain proctoring integrity.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-800">
              Close Developer Tools (F12) to restore examination content.
            </div>
          </div>
        </div>
      )}

      {/* Proctoring Tab-Switch Alert Modal (Strict 4-strike limit) */}
      <ProctorAlertModal
        isOpen={showAlertModal}
        strikeCount={tabSwitchCount}
        maxStrikes={maxStrikes}
        onDismiss={dismissAlert}
        isForceSubmitted={isForceSubmitted}
      />

      {/* Pre-Submission Confirmation Modal */}
      <SubmitConfirmation
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={examStatus === 'SUBMITTING'}
        summaryCounts={summaryCounts}
      />
    </div>
  );
};
