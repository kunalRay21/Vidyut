import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from './hooks/useExamSession';
import { useExamTimer } from './hooks/useExamTimer';
import { useProctoring } from './hooks/useProctoring';
import { ExamNavbar } from './components/ExamNavbar';
import { QuestionPalette } from './components/QuestionPalette';
import { QuestionViewer } from './components/QuestionViewer';
import { OptionSelector } from './components/OptionSelector';
import { ActionToolbar } from './components/ActionToolbar';
import { ProctorAlertModal } from './components/ProctorAlertModal';
import { SubmitConfirmation } from './components/SubmitConfirmation';
import { ResultAnalyticsView } from './components/ResultAnalyticsView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ExamPlatformPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

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
  // Render Loading State
  // ----------------------------------------------------------------------------
  if (examStatus === 'LOADING') {
    return (
      <div className="min-h-screen bg-[#0A111F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-saffron border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-heading text-white mb-2">
          Initializing Calibrated Diagnostic Engine...
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Generating randomized diagnostic questions aligned to candidate career graph and prerequisite DAG.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // Render Error State
  // ----------------------------------------------------------------------------
  if (examStatus === 'ERROR') {
    return (
      <div className="min-h-screen bg-[#0A111F] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-white mb-2">
          Assessment Session Error
        </h2>
        <p className="text-sm text-red-300 max-w-md mb-6 leading-relaxed">
          {errorMessage || 'Unable to connect to Vidyut assessment services.'}
        </p>
        <button
          onClick={() => initSession(id)}
          className="btn-saffron text-xs font-bold py-2.5 px-6 flex items-center gap-2"
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
      <div className="min-h-screen bg-[#0A111F] flex flex-col">
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
    <div className="min-h-screen flex flex-col bg-[#0A111F] text-slate-100 select-none">
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
        <section className="lg:col-span-8 flex flex-col min-h-[580px] gov-card bg-[#0D1829] border-[#1F3152] overflow-hidden">
          {currentQuestion ? (
            <>
              {/* Question Stem Area */}
              <div className="p-6 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
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
        <aside className="lg:col-span-4 h-[580px]">
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
