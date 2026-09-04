import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Send,
  Search,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import {
  HELP_CATEGORIES,
  HELP_QUESTIONS,
  HelpQuestion,
  matchQuestionClient
} from './helpQuestions';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedQuestion?: HelpQuestion;
  suggestions?: HelpQuestion[];
  timestamp: string;
}

export const HelpAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const initialMessage: ChatMessage = {
    id: 'welcome',
    sender: 'assistant',
    text: 'Hello! I am Vidyut\'s Guided Help Assistant. I can answer specific, verified questions about Roadmaps, Assessments, Compatibility Scoring, Career Domains, and Curated Resources. Click any question below or type your query!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Filter questions for the quick-browse drawer/section
  const filteredQuestions = HELP_QUESTIONS.filter((q) => {
    const matchesCategory = selectedCategory === 'all' || q.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectQuestion = (q: HelpQuestion) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      // Find other related questions in the same category
      const related = HELP_QUESTIONS.filter(
        (item) => item.categoryId === q.categoryId && item.id !== q.id
      ).slice(0, 3);

      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: q.answer,
        matchedQuestion: q,
        suggestions: related,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      // Match strictly against pre-defined questions
      const { matchedQuestion, candidates } = matchQuestionClient(query);

      if (matchedQuestion) {
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: matchedQuestion.answer,
          matchedQuestion,
          suggestions: candidates,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, botMsg]);
      } else {
        // Did not match: enforce constraint that this assistant only answers pre-defined questions
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: 'I am a specialized assistant configured to answer verified questions from Vidyut\'s official knowledge base only. I could not find a direct answer for that query. Please select from one of these relevant questions below:',
          suggestions: candidates,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 400);
  };

  const handleResetChat = () => {
    setMessages([initialMessage]);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Open Vidyut Help Assistant"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">Help Assistant</span>
            <span className="bg-amber-700/60 text-amber-100 text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline">
              FAQ
            </span>
          </button>
        ) : null}
      </div>

      {/* Floating Help Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 px-4 py-3.5 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">Vidyut Help Assistant</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pre-Defined Q&A
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Verified answers for roadmaps, scoring & opportunities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-gray-200'
              }`}
            >
              All Topics
            </button>
            {HELP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Search Filter for Instant Question Browsing */}
          <div className="px-3 py-1.5 bg-white border-b border-gray-100 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pre-defined questions..."
              className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Conversation & Questions Display */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#FAF9F6] text-xs">
            {/* If user is filtering questions in the search bar, show matching pre-defined questions */}
            {searchQuery && (
              <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-xs mb-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-amber-600" />
                  Matching Questions ({filteredQuestions.length}):
                </p>
                {filteredQuestions.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">
                    No pre-defined question matches &quot;{searchQuery}&quot;. Please try a different term like &quot;roadmap&quot;, &quot;score&quot;, or &quot;free&quot;.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {filteredQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setSearchQuery('');
                          handleSelectQuestion(q);
                        }}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-amber-50/70 hover:bg-amber-100/80 text-slate-800 border border-amber-200/50 text-[11.5px] transition flex items-start justify-between gap-2"
                      >
                        <span className="font-medium">{q.question}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Render Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-gray-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* If assistant matched an official question with an action link */}
                  {msg.matchedQuestion?.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Category: {msg.matchedQuestion.categoryId}
                      </span>
                      <Link
                        to={msg.matchedQuestion.actionLink.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition"
                      >
                        <span>{msg.matchedQuestion.actionLink.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Question Suggestion Pills under Assistant Response */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 w-[88%]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Related Verified Questions:
                    </p>
                    <div className="flex flex-col gap-1">
                      {msg.suggestions.map((sug) => (
                        <button
                          key={sug.id}
                          onClick={() => handleSelectQuestion(sug)}
                          className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-gray-200/80 hover:border-amber-300 text-[11px] font-medium transition flex items-center justify-between gap-1 shadow-2xs"
                        >
                          <span className="line-clamp-1">{sug.question}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl rounded-bl-none border border-gray-200 w-24 text-slate-400">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel if conversation is fresh */}
          {messages.length === 1 && !searchQuery && (
            <div className="px-3 py-2 bg-white border-t border-gray-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Frequently Asked Questions:
              </p>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {filteredQuestions.slice(0, 3).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(q)}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-amber-50/60 hover:bg-amber-100/70 text-slate-800 border border-amber-200/60 text-[11px] transition flex items-center justify-between gap-2"
                  >
                    <span className="line-clamp-1 font-medium">{q.question}</span>
                    <ChevronRight className="w-3 h-3 text-amber-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question (pre-defined topics only)..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-xs"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
export default HelpAssistant;
