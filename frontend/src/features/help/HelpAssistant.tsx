import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X,
  Send,
  Search,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Globe,
  ChevronDown,
  Bot
} from 'lucide-react';
import {
  HELP_CATEGORIES,
  HELP_QUESTIONS,
  HelpQuestion,
  getLocalizedCategory,
  getLocalizedQuestion,
  matchQuestionClient
} from './helpQuestions';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n/config';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  matchedQuestion?: HelpQuestion;
  suggestions?: HelpQuestion[];
  timestamp: string;
}

export const HelpAssistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLangCode = (i18n.language ? i18n.language.split('-')[0] : 'en');

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close language menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    if (showLangMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showLangMenu]);

  // Dynamic welcome message localized to current language
  const welcomeText = useMemo(() => {
    return t(
      'helpAssistant.welcomeMessage',
      "Hi there! 👋 I'm your Vidyut Assistant. I can help guide you through your career roadmap, skill assessments, compatibility scores, and recommended learning resources. How can I help you today?"
    );
  }, [t, currentLangCode]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update initial welcome message if language switches before conversation starts
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            ...prev[0],
            text: welcomeText,
          },
        ];
      }
      return prev;
    });
  }, [welcomeText]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Filter questions for the quick-browse drawer/section
  const filteredQuestions = useMemo(() => {
    return HELP_QUESTIONS.filter((q) => {
      const matchesCategory = selectedCategory === 'all' || q.categoryId === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const loc = getLocalizedQuestion(q, currentLangCode);
      const queryLower = searchQuery.toLowerCase().trim();

      const inQuestion =
        q.question.toLowerCase().includes(queryLower) ||
        loc.question.toLowerCase().includes(queryLower);

      const inTags =
        q.tags.some((t) => t.toLowerCase().includes(queryLower)) ||
        loc.tags.some((t) => t.toLowerCase().includes(queryLower));

      return inQuestion || inTags;
    });
  }, [selectedCategory, searchQuery, currentLangCode]);

  const handleSelectQuestion = (q: HelpQuestion) => {
    const loc = getLocalizedQuestion(q, currentLangCode);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: loc.question,
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
        text: loc.answer,
        matchedQuestion: q,
        suggestions: related,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 350);
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
      // Match query against questions in active language & fallback English
      const { matchedQuestion, candidates } = matchQuestionClient(query, currentLangCode);

      if (matchedQuestion) {
        const loc = getLocalizedQuestion(matchedQuestion, currentLangCode);
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: loc.answer,
          matchedQuestion,
          suggestions: candidates,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const fallbackMsg = t(
          'helpAssistant.fallbackMessage',
          "I'm here to help you navigate Vidyut! I couldn't find an exact answer for that question, but here are the most relevant topics I can help you with right now:"
        );
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: fallbackMsg,
          suggestions: candidates,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 400);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLangMenu(false);
  };

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-full shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer border border-amber-400/40"
            aria-label={t('helpAssistant.triggerLabel', 'Open Vidyut Help Assistant')}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-sm font-bold tracking-wide">
              {t('helpAssistant.triggerLabel', 'Help Assistant')}
            </span>
            
          </button>
        ) : null}
      </div>

      {/* Floating Help Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full h-[92vh] sm:w-[450px] sm:h-[650px] sm:max-h-[calc(100vh-4rem)] bg-white sm:rounded-3xl shadow-2xl shadow-slate-900/30 border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-250">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-amber-950 px-4 py-3 text-white flex items-center justify-between border-b border-amber-500/20 shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/30 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight font-heading">
                    {t('helpAssistant.title', 'Vidyut Assistant')}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {t('helpAssistant.online', 'Online')}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-300 line-clamp-1">
                  {t('helpAssistant.subtitle', 'Your smart guide for roadmaps, skills & opportunities')}
                </p>
              </div>
            </div>

            {/* Actions: Language Switcher, Reset, Close */}
            <div className="flex items-center gap-1.5">
              {/* Embedded Language Menu */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowLangMenu((prev) => !prev)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded-lg text-xs font-semibold border border-amber-500/30 transition cursor-pointer"
                  title={t('helpAssistant.switchLanguage', 'Language')}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">{currentLangMeta.nativeName}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs">
                    {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-[11.5px] transition cursor-pointer ${
                          currentLangCode === lang.code
                            ? 'bg-amber-600/30 text-amber-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        {currentLangCode === lang.code && (
                          <Check className="w-3 h-3 text-amber-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Conversation */}
              <button
                type="button"
                onClick={handleResetChat}
                title={t('helpAssistant.resetChat', 'Reset Conversation')}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={t('helpAssistant.close', 'Close Assistant')}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="px-3 py-2 bg-slate-50 border-b border-gray-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-gray-200'
              }`}
            >
              {t('helpAssistant.allTopics', 'All Topics')}
            </button>
            {HELP_CATEGORIES.map((cat) => {
              const locCat = getLocalizedCategory(cat.id, currentLangCode);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition flex items-center gap-1 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{locCat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Search Filter for Instant Question Browsing */}
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex items-center gap-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('helpAssistant.searchPlaceholder', 'Search topics or ask a question...')}
              className="w-full text-xs bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
                title={t('helpAssistant.clearSearch', 'Clear search')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Conversation & Questions Display */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#FAF9F6] text-xs">
            {/* If user is filtering questions in search bar, show live suggested matches */}
            {searchQuery && (
              <div className="bg-white p-3 rounded-2xl border border-amber-200/90 shadow-sm mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Search className="w-3 h-3 text-amber-600" />
                    {t('helpAssistant.suggestedTopics', 'Suggested Topics')} ({filteredQuestions.length}):
                  </p>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    {filteredQuestions.length} matches
                  </span>
                </div>

                {filteredQuestions.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">
                    {t('helpAssistant.noTopicsFound', {
                      query: searchQuery,
                      defaultValue: `No topics found matching "${searchQuery}". Try searching for "roadmap", "score", or "free".`,
                    })}
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredQuestions.map((q) => {
                      const loc = getLocalizedQuestion(q, currentLangCode);
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setSearchQuery('');
                            handleSelectQuestion(q);
                          }}
                          className="text-left px-3 py-2 rounded-xl bg-amber-50/70 hover:bg-amber-100 text-slate-800 border border-amber-200/60 text-[11.5px] transition flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                        >
                          <span className="font-semibold text-slate-800 group-hover:text-amber-900">
                            {loc.question}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      );
                    })}
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
                {/* Assistant Identity Tag */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1 pl-1 text-[10.5px] text-slate-500 font-medium">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5" />
                    </div>
                    <span>{t('helpAssistant.title', 'Vidyut Assistant')}</span>
                  </div>
                )}

                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-gray-200/90 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* If assistant matched a specific question with an action link */}
                  {msg.matchedQuestion?.actionLink && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {t('helpAssistant.category', 'Category')}:{' '}
                        {getLocalizedCategory(msg.matchedQuestion.categoryId, currentLangCode).name}
                      </span>
                      <Link
                        to={msg.matchedQuestion.actionLink.url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200 transition"
                      >
                        <span>
                          {getLocalizedQuestion(msg.matchedQuestion, currentLangCode).actionLabel ||
                            msg.matchedQuestion.actionLink.label}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Copy Answer Action */}
                  {msg.sender === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-2.5 pt-1.5 border-t border-gray-100 flex items-center justify-end">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-50 transition cursor-pointer"
                        title={t('helpAssistant.copyAnswer', 'Copy')}
                      >
                        {copiedMessageId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">
                              {t('helpAssistant.copied', 'Copied!')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('helpAssistant.copyAnswer', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Question Suggestion Pills under Assistant Response */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-col gap-1.5 w-[90%]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                      {t('helpAssistant.relatedTopics', 'Related Topics & Next Steps:')}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {msg.suggestions.map((sug) => {
                        const sugLoc = getLocalizedQuestion(sug, currentLangCode);
                        return (
                          <button
                            key={sug.id}
                            onClick={() => handleSelectQuestion(sug)}
                            className="text-left px-3 py-2 rounded-xl bg-white hover:bg-amber-50/80 text-slate-700 hover:text-amber-950 border border-gray-200/90 hover:border-amber-300 text-[11px] font-semibold transition flex items-center justify-between gap-1 shadow-2xs cursor-pointer group"
                          >
                            <span className="line-clamp-1 group-hover:text-amber-900">
                              {sugLoc.question}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-gray-200/90 w-24 text-slate-400 shadow-xs">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Questions View if conversation is fresh */}
          {messages.length === 1 && !searchQuery && (
            <div className="px-3.5 py-2.5 bg-white border-t border-gray-100 shrink-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t('helpAssistant.suggestedQuestions', 'Suggested Questions to Explore:')}
              </p>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredQuestions.slice(0, 3).map((q) => {
                  const loc = getLocalizedQuestion(q, currentLangCode);
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(q)}
                      className="text-left px-3 py-2 rounded-xl bg-amber-50/60 hover:bg-amber-100/80 text-slate-800 border border-amber-200/70 text-[11px] font-semibold transition flex items-center justify-between gap-2 cursor-pointer group"
                    >
                      <span className="line-clamp-1 group-hover:text-amber-950">
                        {loc.question}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0 shadow-sm"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('helpAssistant.inputPlaceholder', 'Ask a question about Vidyut...')}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white text-slate-800 placeholder-slate-400 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition shadow-sm cursor-pointer"
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
