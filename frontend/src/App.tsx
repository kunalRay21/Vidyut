import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A111F] text-slate-100 selection:bg-saffron selection:text-white">
      {/* Official Indian National Flag Top Header Ribbon */}
      <div className="gov-tricolor-banner" />

      {/* Top Gov Header */}
      <header className="border-b border-[#1F3152] bg-[#111D32]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-chakraNavy flex items-center justify-center border border-chakraNavy-600 shadow-sm">
            <span className="text-saffron font-extrabold text-lg">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg text-white tracking-tight">VIDYUT</span>
              <span className="gov-badge text-[10px] py-0.5 px-2">SIH 2026</span>
            </div>
            <p className="text-[11px] text-slate-400">Adaptive Career & Skill Readiness Platform · Govt. of India</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="gov-badge-chakra hidden sm:inline-flex">Ashoka Chakra Dharma Theme</span>
          <button className="btn-saffron text-xs py-2 px-4">
            Sign In / Register
          </button>
        </div>
      </header>

      {/* Main Showcase Hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center">
        {/* Ministry / Scheme Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-saffron/30 bg-saffron/10 text-saffron-300 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          Problem Statement 26044: Academia–Industry Collaboration
        </div>

        {/* Hero Title with Tricolor Text Gradient */}
        <h1 className="text-4xl md:text-6xl font-extrabold font-heading tracking-tight mb-4 max-w-3xl">
          Empowering India's Students with <span className="text-gradient-tricolor">Adaptive Skill Intelligence</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          Standardized skill graphs, calibrated diagnostic evaluations, prerequisite-ordered roadmaps, and verified opportunity matching.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button className="btn-saffron text-sm px-6 py-3">
            Explore Career Domains
          </button>
          <button className="btn-green text-sm px-6 py-3">
            Verified Opportunities
          </button>
          <button className="btn-chakra text-sm px-6 py-3">
            Institution Portal
          </button>
        </div>

        {/* Design System / Theme Tokens Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Saffron Card */}
          <div className="gov-card p-6 border-saffron/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-saffron" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white">Kesari (Saffron)</h3>
              <span className="gov-badge">#FF9933</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Symbolizes courage, energy, and action. Used for high-demand domain badges, primary CTAs, active roadmaps, and attention callouts.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-saffron" />
              <span className="text-xs text-saffron-300 font-medium">Primary Brand Accent</span>
            </div>
          </div>

          {/* White / Chakra Navy Card */}
          <div className="gov-card p-6 border-chakraNavy-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-chakraNavy-500" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white">Ashoka Navy (Dharma)</h3>
              <span className="gov-badge-chakra">#000080</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Represents the eternal wheel of law and truth. Used for administrative and institutional headers, surfaces, navigation, and badges.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-chakraNavy-500" />
              <span className="text-xs text-blue-300 font-medium">Authoritative Accent</span>
            </div>
          </div>

          {/* India Green Card */}
          <div className="gov-card p-6 border-indiaGreen/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indiaGreen" />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-semibold text-white">Harit (India Green)</h3>
              <span className="gov-badge-green">#138808</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Represents growth, prosperity, and verified competence. Used for "Ready Now" tags, completed milestones, and success states.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indiaGreen" />
              <span className="text-xs text-green-300 font-medium">Growth & Success Accent</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F3152] bg-[#0A111F] py-6 text-center text-xs text-slate-500">
        <p>Vidyut — Smart India Hackathon 2026 · Ministry of Education & AICTE Initiative</p>
      </footer>
    </div>
  );
}
