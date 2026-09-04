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
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ExamPlatformPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Mobile Device Check Gate (Restricts assessment on mobile)
  const { isMobile } = useDeviceCheck(1024);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // 1. Session state hook
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

  // 2. Timer hook with auto-submit upon expiry
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

  // 3. Proctoring hook
  const handleMaxStrikes = useCallback(() => {
    console.warn('[Proctoring Alert] Max strikes reached.');
  }, []);

  const {
    tabSwitchCount,
    showAlertModal,
    isFullscreen,
    maxStrikes,
    requestFullscreen,
    dismissAlert,
  } = useProctoring({
    sessionId,
    maxStrikes: 3,
    onMaxStrikesReached: handleMaxStrikes,
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
  // Gate: Block mobile devices from starting/taking assessment
  // ----------------------------------------------------------------------------
  if (isMobile) {
    return <MobileRestrictedGate />;
  }

  // ----------------------------------------------------------------------------
  // Render Loading State
  // ----------------------------------------------------------------------------
  if (examStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold font-heading text-slate-900 mb-1">
          Loading Diagnostic Assessment...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Preparing calibrated questions aligned to your career DAG.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Error State
  // ----------------------------------------------------------------------------
  if (examStatus === 'ERROR') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-heading text-slate-900 mb-1">
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
      <div className="min-h-screen bg-slate-100/60 flex flex-col">
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
  // Render Live Exam Mode (Split-Pane Architecture: 70% Left, 30% Right)
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 select-none">
      {/* Top Exam Navigation Bar */}
      <ExamNavbar
        testTitle={testTitle}
        candidateAlias={candidateAlias}
        formattedTime={formattedTime}
        isWarning={isWarning}
        isUrgent={isUrgent}
        isFullscreen={isFullscreen}
        onRequestFullscreen={requestFullscreen}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      {/* Main Examination Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (70% on desktop: 8 of 12 columns) */}
        <section className="lg:col-span-8 flex flex-col min-h-[560px] gov-card bg-white border-slate-200 overflow-hidden shadow-xs">
          {currentQuestion ? (
            <>
              {/* Question Stem Area */}
              <div className="p-6 flex-1 space-y-5 overflow-y-auto custom-scrollbar">
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

              {/* Bottom Action Navigation Toolbar */}
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
        </section>

        {/* Right Pane (30% on desktop: 4 of 12 columns) */}
        <aside className="lg:col-span-4 h-[560px]">
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            onSelectIndex={goToQuestion}
            getQuestionStatus={getQuestionStatus}
            summaryCounts={summaryCounts}
          />
        </aside>
      </main>

      {/* Proctoring Tab-Switch Alert Modal */}
      <ProctorAlertModal
        isOpen={showAlertModal}
        strikeCount={tabSwitchCount}
        maxStrikes={maxStrikes}
        onDismiss={dismissAlert}
      />

      {/* Pre-Submission Audit Modal */}
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
