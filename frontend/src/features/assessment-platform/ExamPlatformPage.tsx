import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from './hooks/useExamSession';
import { useExamTimer } from './hooks/useExamTimer';
import { useProctoring } from './hooks/useProctoring';
import { useDeviceCheck } from './hooks/useDeviceCheck';
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
import { AlertCircle, RefreshCw } from 'lucide-react';

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
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
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
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
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
  // Render Live Exam Mode (Split-Pane Full-Height Workspace)
  // ----------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white text-slate-800">
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
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left: Question Presentation & Options Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {currentQuestion ? (
            <>
              {/* Scrollable Question Body */}
              <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6">
                  <QuestionViewer
                    question={currentQuestion}
                    questionNumber={currentIndex + 1}
                    totalQuestions={questions.length}
                  />

                  <OptionSelector
                    question={currentQuestion}
                    selectedOption={currentResponse?.selected_option || null}
                    onSelectOption={selectOption}
                  />
                </div>
              </div>

              {/* Fixed Bottom Action Toolbar */}
              <ActionToolbar
                hasSelectedOption={Boolean(currentResponse?.selected_option)}
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
            <div className="p-12 text-center text-slate-400">
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

      {/* Gate 2: Fullscreen Mode Enforcement Modal (Blocks interaction when not in fullscreen) */}
      <FullscreenGateModal
        isOpen={!isFullscreen && examStatus === 'READY'}
        onEnterFullscreen={requestFullscreen}
        hasStarted={hasEnteredFullscreenOnce}
      />

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
