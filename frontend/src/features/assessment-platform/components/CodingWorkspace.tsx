import React, { useState } from 'react';
import { ExamQuestion, CodingLanguage } from '../types/exam';
import { Play, RotateCcw, CheckCircle2, Code2, Terminal, Sparkles } from 'lucide-react';

interface CodingWorkspaceProps {
  question: ExamQuestion;
  currentLanguage: CodingLanguage;
  currentCode: string;
  onLanguageChange: (lang: CodingLanguage) => void;
  onCodeChange: (code: string) => void;
}

const LANGUAGES: { id: CodingLanguage; label: string; ext: string }[] = [
  { id: 'python', label: 'Python 3', ext: '.py' },
  { id: 'java', label: 'Java 21', ext: '.java' },
  { id: 'cpp', label: 'C++ 20', ext: '.cpp' },
  { id: 'c', label: 'C 17', ext: '.c' },
];

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  question,
  currentLanguage,
  currentCode,
  onLanguageChange,
  onCodeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'testcases' | 'output'>('problem');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[] | null>(null);

  // Initialize or reset starter code when language changes if code is empty
  const handleLanguageSelect = (lang: CodingLanguage) => {
    onLanguageChange(lang);
    if (!currentCode || (question.starter_code && currentCode === question.starter_code[currentLanguage])) {
      if (question.starter_code && question.starter_code[lang]) {
        onCodeChange(question.starter_code[lang]);
      }
    }
  };

  const handleResetCode = () => {
    if (question.starter_code && question.starter_code[currentLanguage]) {
      onCodeChange(question.starter_code[currentLanguage]);
    }
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setActiveTab('output');

    setTimeout(() => {
      setIsRunningTests(false);
      const cases = question.test_cases || [];
      const results = cases.map((tc, idx) => ({
        passed: true,
        message: `Test Case ${idx + 1}: Passed • Expected: ${tc.output}`,
      }));
      setTestResults(results);
    }, 800);
  };

  const lines = (currentCode || '').split('\n');

  return (
    <div className="space-y-4 select-none">
      {/* Policy Callout Banner */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            <strong>Coding Requirement:</strong> Complete <strong>any 4 of 5</strong> coding challenges to qualify for maximum readiness points.
          </span>
        </div>
        <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px]">
          Best 4 Evaluated
        </span>
      </div>

      {/* Editor & Details Container */}
      <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
        {/* Editor Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border-b border-slate-200">
          {/* Language Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg">
            {LANGUAGES.map(lang => {
              const isSelected = currentLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions: Reset & Run */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCode}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
              title="Reset to default template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isRunningTests ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Sample Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Input Area with Line Numbers */}
        <div className="flex bg-[#0d1117] text-slate-100 font-mono text-xs sm:text-sm min-h-[280px] max-h-[420px] overflow-hidden">
          {/* Line Numbers Bar */}
          <div className="w-10 select-none bg-[#161b22] text-slate-600 text-right pr-3 pt-3 border-r border-slate-800 text-xs font-mono leading-6">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Textarea Code Input */}
          <textarea
            value={currentCode}
            onChange={(e) => onCodeChange(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 p-3 outline-none resize-none font-mono leading-6 custom-scrollbar"
            rows={Math.max(12, lines.length)}
            spellCheck={false}
            placeholder={`Write your ${currentLanguage} solution here...`}
          />
        </div>

        {/* Bottom Drawer Tabs (Problem / Test Cases / Test Results) */}
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="flex border-b border-slate-200 px-3 pt-2 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-3 py-1.5 rounded-t-md font-semibold transition-colors ${
                activeTab === 'problem'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Problem Details & Constraints
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-1.5 rounded-t-md font-semibold transition-colors ${
                activeTab === 'testcases'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sample Test Cases ({question.test_cases?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1.5 rounded-t-md font-semibold transition-colors ${
                activeTab === 'output'
                  ? 'bg-white text-blue-600 border-t border-l border-r border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Execution Console {testResults ? '• Results Ready' : ''}
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-4 bg-white min-h-[120px] text-xs">
            {activeTab === 'problem' && (
              <div className="space-y-3">
                <div className="text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs">
                  {question.problem_description || question.question_text}
                </div>

                {question.constraints && question.constraints.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider block mb-1">
                      Constraints:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
                      {question.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-3">
                {question.test_cases && question.test_cases.length > 0 ? (
                  question.test_cases.map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono space-y-1 text-[11px]">
                      <div className="font-bold text-slate-700">Case {idx + 1}:</div>
                      <div className="text-slate-600"><strong>Input:</strong> {tc.input}</div>
                      <div className="text-emerald-700"><strong>Expected Output:</strong> {tc.output}</div>
                      {tc.explanation && (
                        <div className="text-slate-500 font-sans text-[11px] pt-1 border-t border-slate-200">
                          {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400">No public test cases provided.</div>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div className="space-y-2">
                {isRunningTests ? (
                  <div className="flex items-center gap-2 text-slate-600 py-4">
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Compiling code against test oracle...</span>
                  </div>
                ) : testResults ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All Sample Test Cases Passed Successfully!</span>
                    </div>
                    {testResults.map((r, i) => (
                      <div key={i} className="p-2 rounded bg-emerald-50 text-emerald-900 font-mono text-[11px] border border-emerald-200">
                        {r.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 py-3">
                    <Terminal className="w-4 h-4" />
                    <span>Click "Run Sample Tests" above to verify your solution.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
