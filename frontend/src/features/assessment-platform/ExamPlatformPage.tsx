import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSession } from './hooks/useExamSession';
import { useExamTimer } from './hooks/useExamTimer';
import { useProctoring } from './hooks/useProctoring';
import { useDeviceCheck } from './hooks/useDeviceCheck';
import { useClipboardProtection } from './hooks/useClipboardProtection';
import { useSingleTabLock } from './hooks/useSingleTabLock';
import { useAudioVisualProctoring } from './hooks/useAudioVisualProctoring';
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
import { ProctoringConsentModal } from './components/ProctoringConsentModal';
import { ProctoringVideoHUD } from './components/ProctoringVideoHUD';
import { ProctoringLogModal } from './components/ProctoringLogModal';
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

  // 3. Audio-Visual Proctoring Module (Camera, Microphone, Gaze, Multi-Face, Noise Detection)
  const {
    stream: proctoringStream,
    consentState: proctoringConsent,
    status: proctoringStatus,
    events: proctoringEvents,
    requestPermissions: requestProctoringPermissions,
    setConsentAgreed: setProctoringConsentAgreed,
    stopMonitoring: stopProctoringMonitoring,
    dismissActiveWarning: dismissProctoringWarning,
  } = useAudioVisualProctoring({
    sessionId,
    isActive: examStatus === 'READY',
  });

  const [isProctoringLogsOpen, setIsProctoringLogsOpen] = useState(false);

  // 4. Timer hook with auto-submit upon expiry
  const handleTimerExpire = useCallback(() => {
    if (examStatus === 'READY') {
      stopProctoringMonitoring();
      submitExam();
    }
  }, [examStatus, submitExam, stopProctoringMonitoring]);

  const {
    formattedTime,
    isWarning,
    isUrgent,
  } = useExamTimer({
    sessionId,
    initialTimeSeconds: initialTimeSeconds || 900,
    onExpire: handleTimerExpire,
  });

  // 5. Forceful auto-submission at 4 tab-switch strikes
  const handleForcefulSubmit = useCallback(() => {
    console.warn('[Proctoring Alert] 4 tab switches exceeded. Forcefully completing test...');
    stopProctoringMonitoring();
    submitExam();
  }, [submitExam, stopProctoringMonitoring]);

  // 6. Proctoring hook (Strict 4-strike limit + Fullscreen monitoring)
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

  // 7. Anti-Copy/Paste & Clipboard Protection (with DevTools / Inspect Mode Detection)
  const { warningMessage: clipboardWarning, isDevToolsOpen, setIsDevToolsOpen } = useClipboardProtection({
    isActive: examStatus === 'READY',
  });

  // 8. Single Tab Exclusive Lock & Auto-Close Hook
  const {
    isLockedByAnotherTab,
    otherTabsDetected,
    enforceSingleTab,
    takeOverTab,
  } = useSingleTabLock({
    isActive: examStatus === 'READY',
  });

  // Handle final submission confirm
  const handleConfirmSubmit = async () => {
    setIsSubmitModalOpen(false);
    stopProctoringMonitoring();
    await submitExam();
  };

  // Handle entering fullscreen and locking other tabs
  const handleEnterFullscreen = async () => {
    enforceSingleTab();
    await requestFullscreen();
  };

  const handleProceedFromConsent = () => {
    handleEnterFullscreen();
  };

  // Navigate to roadmap
  const handleNavigateRoadmap = () => {
    navigate('/roadmap');
  };

  // ----------------------------------------------------------------------------
  // Gate 0: Duplicate Tab Lock Gate (Blocks exam if open in another tab)
  // ----------------------------------------------------------------------------
  if (isLockedByAnotherTab) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">
          Assessment Active in Another Tab
        </h2>
        <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
          Multiple tabs are strictly prohibited during the assessment. Only a single examination tab is allowed. Please close other tabs or continue examination here.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={takeOverTab}
            className="btn-saffron text-xs py-2.5 px-5"
          >
            Continue Assessment in This Tab
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Close This Duplicate Tab
          </button>
        </div>
      </div>
    );
  }

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

      {/* Live Audio-Visual Proctoring HUD (Floating Bottom-Right) */}
      {proctoringConsent.isReady && examStatus === 'READY' && (
        <ProctoringVideoHUD
          stream={proctoringStream}
          status={proctoringStatus}
          events={proctoringEvents}
          onOpenLogs={() => setIsProctoringLogsOpen(true)}
          onDismissWarning={dismissProctoringWarning}
        />
      )}

      {/* Proctoring Event Audit Log Modal */}
      <ProctoringLogModal
        isOpen={isProctoringLogsOpen}
        onClose={() => setIsProctoringLogsOpen(false)}
        events={proctoringEvents}
      />

      {/* Gate 1.5: Audio-Visual Proctoring Setup & Consent Check */}
      <ProctoringConsentModal
        isOpen={examStatus === 'READY' && !hasEnteredFullscreenOnce && !proctoringConsent.isReady}
        stream={proctoringStream}
        consentState={proctoringConsent}
        status={proctoringStatus}
        onRequestPermissions={requestProctoringPermissions}
        onConsentChange={setProctoringConsentAgreed}
        onProceedToExam={handleProceedFromConsent}
      />

      {/* Gate 2: Fullscreen Mode Enforcement Modal (3-min countdown with forceful auto-submit & close-all-tabs requirement) */}
      <FullscreenGateModal
        isOpen={!isFullscreen && examStatus === 'READY' && (hasEnteredFullscreenOnce || proctoringConsent.isReady)}
        onEnterFullscreen={handleEnterFullscreen}
        hasStarted={hasEnteredFullscreenOnce}
        onTimeoutAutoSubmit={submitExam}
        otherTabsDetected={otherTabsDetected}
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
              Developer Tools and Element Inspection are strictly prohibited during this assessment. Please keep developer tools closed.
            </p>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-800">
              Developer Tools shortcuts are disabled.
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsDevToolsOpen(false)}
                className="btn-saffron text-xs py-2.5 px-6 font-semibold"
              >
                Acknowledge & Resume Assessment
              </button>
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
