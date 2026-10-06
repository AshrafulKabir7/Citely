import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Globe,
  Zap,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { RadialLogo } from './RadialLogo';
import { ThemeToggle } from './ThemeToggle';
import { EXECUTIVES, executiveInitials } from '../lib/rag/executives';
import { ExecutiveId } from '../lib/rag/types';
import { answerQuestion } from '../lib/rag/generator';
import { getInitialIngestedDocuments } from '../lib/rag/sample-data';
import { VectorStore } from '../lib/rag/vector-store';

interface HomepageProps {
  onLaunchApp: (executiveId?: ExecutiveId, initialQuery?: string) => void;
  onOpenKnowledge: () => void;
}

const NAV_LINKS = [
  { href: '#executives', label: 'Executive Board' },
  { href: '#features', label: 'Live Reasoning' },
  { href: '#capabilities', label: 'Knowledge Base' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

const STARTER_PROMPTS: { text: string; exec: ExecutiveId }[] = [
  { text: 'How quickly are customers told about a security incident?', exec: 'chief_of_it' },
  { text: 'What are our production API rate limits and webhook retries?', exec: 'chief_of_engineering' },
  { text: 'What is our annual PTO policy and home office tech stipend?', exec: 'chief_of_staff' },
  { text: 'What is our SLA guarantee and money-back policy for enterprise?', exec: 'chief_of_accounts' },
];

const FAQS = [
  {
    q: 'How does Citely prevent hallucinations?',
    a: 'Every answer line is quoted from a passage in your documents and cited. Before answering, Citely checks how much of the question the retrieved passages actually cover; below the bar it says it could not find the answer instead of guessing. Try asking it something unrelated in the live workspace.',
  },
  {
    q: 'Can I upload confidential financial or legal spreadsheets?',
    a: 'Yes. All embeddings and vector calculations run client-side or in your isolated private Docker container. Your data is never shared or used to train third-party public models.',
  },
  {
    q: 'Can I embed the chat widget on my existing website?',
    a: 'Yes. Citely provides a single-line script embed tag that works on Shopify, WordPress, Webflow, React, or vanilla HTML sites.',
  },
  {
    q: 'Which language models are supported?',
    a: 'The retrieval pipeline is model-agnostic. Plug in OpenAI, Anthropic, or a locally hosted model — citations and grounding checks work the same way with every provider.',
  },
];

const SOURCE_TYPES = [
  { path: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />, label: 'PDF handbooks' },
  { path: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M8 13h8M8 17h5" /></>, label: 'Word & Markdown docs' },
  { path: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>, label: 'Website pages' },
  { path: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v16" /></>, label: 'Spreadsheets & tables' },
  { path: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01" /></>, label: 'FAQs & help centres' },
  { path: <><path d="M4 4h16v12H5.2L4 17.2z" /><path d="M8 9h8M8 12h5" /></>, label: 'Support macros' },
];

/** The showcase runs the real engine on the bundled sample documents. */
const SHOWCASE = (() => {
  const store = new VectorStore(getInitialIngestedDocuments().flatMap((d) => d.chunks));
  const config = {
    topK: 4,
    similarityThreshold: 0.18,
    temperature: 0.2,
    activeExecutive: 'chief_of_staff' as ExecutiveId,
    strictGroundingOnly: true,
    provider: 'local_rag' as const,
  };
  return [
    'How many paid time off days do full-time employees get?',
    'What is the API rate limit on the Growth tier?',
    'Who won the 2022 World Cup?',
  ].map((question) => ({ question, result: answerQuestion(question, store, config) }));
})();

function ShowcaseAnswer({ text }: { text: string }) {
  return (
    <>
      {text
        .split('\n')
        .filter(Boolean)
        .map((line, i) => {
          const header = line.match(/^\*\*(.+?)\*\*(.*)$/);
          if (header) {
            return (
              <div key={i} className="bubble-question" style={{ marginBottom: 6 }}>
                {header[1]}
                <span style={{ opacity: 0.6 }}>{header[2]}</span>
              </div>
            );
          }
          const bullet = line.match(/^- (.*?)(?: \[(\d+)\])?$/);
          if (bullet) {
            return (
              <div key={i} className="bubble-list-item">
                • {bullet[1].replace(/\*\*/g, '')}
                {bullet[2] && (
                  <sup style={{ marginLeft: 4, padding: '0 5px', borderRadius: 999, background: '#ffd000', color: '#0c0c0c', fontWeight: 700 }}>
                    {bullet[2]}
                  </sup>
                )}
              </div>
            );
          }
          return (
            <div key={i} className="bubble-gap">
              {line.replace(/\*\*/g, '')}
            </div>
          );
        })}
    </>
  );
}

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
  </svg>
);

/** Adds `is-visible` to every [data-reveal] element inside `root` once it scrolls into view. */
function useScrollReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [root]);
}

/** Cycles through prompts with a typewriter effect, for the hero input placeholder. */
function useTypewriter(phrases: string[], active: boolean) {
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let phrase = 0;
    let chars = phrases[0].length;
    let deleting = true;
    let timer: number;

    const tick = () => {
      let delay: number;
      if (deleting) {
        chars -= 1;
        delay = 22;
        if (chars === 0) {
          deleting = false;
          phrase = (phrase + 1) % phrases.length;
          delay = 300;
        }
      } else {
        chars += 1;
        delay = 45;
        if (chars === phrases[phrase].length) {
          deleting = true;
          delay = 2400;
        }
      }
      setText(phrases[phrase].slice(0, chars));
      timer = window.setTimeout(tick, delay);
    };

    timer = window.setTimeout(tick, 3200);
    return () => window.clearTimeout(timer);
  }, [phrases, active]);

  return text;
}

const PLACEHOLDERS = [
  'Break down a decision, problem, or idea…',
  'What is our refund policy for annual plans?',
  'Summarize the security controls in our SOC-2 report…',
  'Compare our API tiers for a new enterprise client…',
];

export const Homepage: React.FC<HomepageProps> = ({ onLaunchApp, onOpenKnowledge }) => {
  const [heroInput, setHeroInput] = useState('');
  const [strictGrounding, setStrictGrounding] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);
  const placeholder = useTypewriter(PLACEHOLDERS, heroInput.length === 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileMenuOpen);
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroInput.trim()) {
      onLaunchApp('chief_of_staff', heroInput.trim());
    } else {
      onLaunchApp();
    }
  };

  return (
    <div className="home-root" ref={rootRef}>
      {/* ======================================================================
          STICKY HEADER
          ====================================================================== */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-topbar">
          <div className="nav-left">
            <a href="#home" aria-label="Citely home" className="logo-brand-link">
              <RadialLogo size={38} glow />
              <div className="flex flex-col">
                <span className="logo-brand-text">
                  Citely
                  <span className="brand-badge">2.0</span>
                </span>
                <span className="logo-brand-sub">Executive AI Reasoning</span>
              </div>
            </a>
          </div>

          <nav className="nav-center" aria-label="Main navigation">
            <ul className="nav-links">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="nav-link-item">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-right">
            <ThemeToggle />
            <button onClick={() => onLaunchApp()} className="btn-start-free nav-right-btn">
              <span>Start Free</span>
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="burger-btn"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="burger-bar" />
              <span className="burger-bar" />
              <span className="burger-bar" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-menu-head">
            <div className="flex items-center gap-2">
              <RadialLogo size={34} />
              <span className="font-semibold text-lg text-fg">Citely</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={() => setMobileMenuOpen(false)} className="icon-btn" aria-label="Close menu">
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>

          <nav className="mobile-menu-links">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-menu-link"
                style={{ '--i': i } as React.CSSProperties}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            <div style={{ height: 2, width: '100%', background: 'var(--grad)' }} />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchApp();
              }}
              className="btn-start-free"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              Launch Live Workspace
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================
          SECTION 1 — HERO
          ====================================================================== */}
      <section className="hero-page" id="home">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-grid" />
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
        </div>

        <div className="hero-content">
          <a
            href="#features"
            className="hero-eyebrow hero-enter"
            style={{ '--delay': '100ms' } as React.CSSProperties}
          >
            <span className="hero-eyebrow-tag">NEW</span>
            <span>Live reasoning with verbatim citations</span>
            <ArrowRight style={{ width: 13, height: 13 }} />
          </a>

          <h1 className="hero-title">
            <span className="hl-mask">
              <span className="hl-line" style={{ '--delay': '200ms' } as React.CSSProperties}>
                Think clearly.
              </span>
            </span>
            <span className="hl-mask">
              <span className="hl-line text-gradient" style={{ '--delay': '340ms' } as React.CSSProperties}>
                Decide confidently.
              </span>
            </span>
          </h1>

          <p className="hero-subtitle hero-enter" style={{ '--delay': '560ms' } as React.CSSProperties}>
            An AI workspace that structures your reasoning, not just your answers —
            grounded in your company documents &amp; website.
          </p>

          <div className="composer-shell hero-enter" style={{ '--delay': '720ms' } as React.CSSProperties}>
            <div className="composer-glow" />
            <div className="composer">
              <form onSubmit={handleHeroSubmit} className="flex flex-col h-full">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder={placeholder}
                  aria-label="Ask Citely"
                  className="composer-input"
                />

                <div className="starter-chips-row">
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p.text}
                      type="button"
                      onClick={() => onLaunchApp(p.exec, p.text)}
                      className="starter-chip"
                      title={p.text}
                    >
                      {p.text}
                    </button>
                  ))}
                </div>

                <div className="composer-controls">
                  <button
                    type="button"
                    onClick={onOpenKnowledge}
                    className="chip-round"
                    aria-label="Upload or inspect knowledge base"
                    title="Upload or Inspect Knowledge Base"
                  >
                    <Plus style={{ width: 20, height: 20 }} strokeWidth={1.9} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStrictGrounding(!strictGrounding)}
                    className={`chip-pill ${strictGrounding ? 'active' : ''}`}
                    aria-pressed={strictGrounding}
                    title="Toggle deep multi-step executive reasoning"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.5 6a1.5 1.5 0 0 1 .5 1.1V17h6v-.9c0-.4.2-.8.5-1.1A7 7 0 0 0 12 2z" />
                    </svg>
                    <span>{strictGrounding ? "Strict grounding" : "Relaxed grounding"}</span>
                  </button>

                  <div className="controls-spacer" />

                  <button type="button" className="mic-btn" aria-label="Voice input" title="Voice input">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                    </svg>
                  </button>

                  <button type="submit" className="send-btn" aria-label="Send query" title="Launch live reasoning">
                    <span className="send-inner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="trust-footer hero-enter" style={{ '--delay': '950ms' } as React.CSSProperties}>
          <p className="trust-label">Answers from your own sources</p>
          <div className="marquee">
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
                  {SOURCE_TYPES.map((source) => (
                    <div className="brand-logo" key={source.label}>
                      <svg viewBox="0 0 24 24">{source.path}</svg>
                      <span>{source.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECTION 2 — LIVE REASONING SHOWCASE
          ====================================================================== */}
      <section className="section-two" id="features">
        <div className="s2-wrap">
          <div className="s2-header" data-reveal>
            <h2 className="s2-title">
              Built for human thinking.
              <br />
              <span className="text-gradient">Powered by structured intelligence.</span>
            </h2>
            <p className="s2-subhead">
              Ask complex questions. Explore multiple perspectives.
              <br />
              Get structured, reliable answers — instantly.
            </p>
          </div>

          <div className="panel" data-reveal>
            <div className="reasoning-row">
              <div className="live-dot" />
              <span className="reasoning-label">Live reasoning • Grounded RAG</span>
            </div>

            <div className="chat-card" data-reveal>
              {SHOWCASE.map(({ question, result }, i) => (
                <React.Fragment key={question}>
                  <div className="chat-msg-row user" style={{ '--i': i * 2 } as React.CSSProperties}>
                    <div className="bubble">{question}</div>
                    <div className="avatar-user"><UserIcon /></div>
                  </div>
                  <div className="chat-msg-row ai" style={{ '--i': i * 2 + 1 } as React.CSSProperties}>
                    <div className="avatar-ai" />
                    <div className="bubble">
                      <ShowcaseAnswer text={result.isHallucinationPrevented ? result.answer.split('\n\n')[0] : result.answer} />
                      <div className="bubble-gap" style={{ fontSize: '0.72rem', opacity: 0.65 }}>
                        {result.isHallucinationPrevented
                          ? 'Declined: the documents do not cover this question.'
                          : `Quoted from ${result.citations.map((c) => c.sourceName).join(', ')} · evidence coverage ${result.groundingConfidence}%`}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <button
                type="button"
                onClick={() => onLaunchApp()}
                className="chat-inputbar"
                style={{ '--i': 6 } as React.CSSProperties}
                title="Launch the live executive workspace"
              >
                <span className="chat-inputbar-placeholder">These answers are live engine output. Click to ask your own question</span>
                <span className="input-mic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="currentColor" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </span>
                <span className="input-send">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECTION 3 — EXECUTIVE SUITE
          ====================================================================== */}
      <section className="section-block" id="executives">
        <div className="section-header-centered" data-reveal>
          <span className="section-eyebrow">Specialized Executive Intelligence</span>
          <h2 className="section-title">Your Complete AI Executive Suite</h2>
          <p className="section-desc">
            Each executive operates with strict domain boundaries and direct ingestion of verified company documents.
          </p>
        </div>

        <div className="grid-4-cards">
          {EXECUTIVES.map((exec, i) => (
            <div
              key={exec.id}
              className="exec-card glow-card"
              data-reveal
              style={{ '--d': i } as React.CSSProperties}
            >
              <div>
                <div className="exec-card-top">
                  <div className="exec-card-icon">{executiveInitials(exec.name)}</div>
                  <span className="verified-badge">VERIFIED</span>
                </div>
                <h3 className="exec-card-title">{exec.name}</h3>
                <p className="exec-card-role">{exec.role}</p>
                <p className="exec-card-desc">{exec.description}</p>
                <div className="exec-card-source">
                  <div className="exec-card-source-label">Trained on</div>
                  <div className="exec-card-source-file" title={exec.sourceFileFocus}>{exec.sourceFileFocus}</div>
                </div>
              </div>

              <button onClick={() => onLaunchApp(exec.id)} className="exec-card-btn">
                <span>Consult {exec.name}</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================
          SECTION 4 — GROUNDING PIPELINE
          ====================================================================== */}
      <section className="section-block section-block-alt" id="capabilities">
        <div className="section-header-centered" data-reveal>
          <span className="section-eyebrow info">Grounding pipeline</span>
          <h2 className="section-title">How every answer stays on the record</h2>
          <p className="section-desc">
            Four steps between your question and an answer, each one inspectable in the workspace.
          </p>
        </div>

        <div className="grid-4-cards">
          {[
            {
              icon: <FileText style={{ width: 22, height: 22 }} />,
              color: 'var(--accent)',
              title: 'Section-aware chunking',
              desc: 'Documents are split along their own headings and bullet points, so each passage is one topic and every citation points at a specific section.',
            },
            {
              icon: <Globe style={{ width: 22, height: 22 }} />,
              color: 'var(--positive)',
              title: 'Website pages',
              desc: 'Page HTML is cleaned of scripts, styles and navigation before chunking. Client builds add a server-side crawler that keeps pages fresh.',
            },
            {
              icon: <Zap style={{ width: 22, height: 22 }} />,
              color: 'var(--info)',
              title: 'Hybrid retrieval',
              desc: 'BM25 keyword ranking plus vector similarity. A passage is only used when it covers most of the question, measured term by term.',
            },
            {
              icon: <ShieldCheck style={{ width: 22, height: 22 }} />,
              color: 'var(--accent)',
              title: 'Quoted, cited answers',
              desc: 'Every answer line is quoted from a passage and numbered [1], [2]. Questions the documents do not cover are declined, not guessed.',
            },
          ].map((f, i) => (
            <div key={f.title} className="feat-card glow-card" data-reveal style={{ '--d': i } as React.CSSProperties}>
              <div className="feat-card-head">
                <div className="feat-icon-box" style={{ color: f.color }}>{f.icon}</div>
                <span className="feat-step">0{i + 1}</span>
              </div>
              <h3 className="feat-card-title">{f.title}</h3>
              <p className="feat-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================
          SECTION 5 — PRICING
          ====================================================================== */}
      <section className="section-block" id="pricing">
        <div className="section-header-centered" data-reveal>
          <span className="section-eyebrow">Simple One-Time Pricing</span>
          <h2 className="section-title">Turnkey Deployment Packages</h2>
          <p className="section-desc">
            A RAG chatbot trained on your documents &amp; website — built, deployed, and ready for your team.
          </p>
        </div>

        <div className="grid-3-cards">
          {[
            {
              title: 'Starter RAG',
              meta: '1 Executive',
              price: '$75',
              desc: 'A grounded document bot for a small knowledge base. Delivered in 2 days.',
              features: [
                'Up to 3 documents (PDF, TXT or FAQ)',
                'Hybrid search with source citations',
                'Interactive web test interface',
                '2 revisions',
              ],
              cta: 'Choose Starter',
              exec: 'chief_of_staff' as ExecutiveId,
            },
            {
              title: 'Full Boardroom',
              meta: '4 Executives',
              price: '$150',
              desc: 'Multi-source bot with a website crawler, custom persona and embeddable widget. Delivered in 3 days.',
              features: [
                'Up to 15 documents + website URL crawler',
                'Custom persona and tone',
                'Floating website widget (script or iframe)',
                '3 revisions',
              ],
              cta: 'Launch Full Boardroom',
              exec: 'chief_of_engineering' as ExecutiveId,
              popular: true,
            },
            {
              title: 'Enterprise RAG',
              meta: 'Custom LLM',
              price: '$350',
              desc: 'Production RAG with a vector database, API, admin panel and escalation routing. Delivered in 5 days.',
              features: [
                'Unlimited documents + multi-page crawler',
                'Vector DB (Chroma, Pinecone or pgvector)',
                'REST API, webhooks, admin panel',
                'Your choice of LLM provider or a local model',
              ],
              cta: 'Choose Enterprise',
              exec: 'chief_of_it' as ExecutiveId,
              info: true,
            },
          ].map((plan, i) => (
            <div
              key={plan.title}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              data-reveal
              style={{ '--d': i } as React.CSSProperties}
            >
              {plan.popular && <div className="popular-tag">Most Popular</div>}
              <div>
                <div className="pricing-head">
                  <h3 className="pricing-plan-title">{plan.title}</h3>
                  <span
                    className="pricing-meta"
                    style={plan.popular ? { color: 'var(--accent)' } : plan.info ? { color: 'var(--info)' } : undefined}
                  >
                    {plan.meta}
                  </span>
                </div>
                <div className="pricing-price">
                  <span>{plan.price}</span>
                  <span className="pricing-period">/ one-time</span>
                </div>
                <p className="pricing-desc">{plan.desc}</p>
                <div className="pricing-feature-list">
                  {plan.features.map((f) => (
                    <div className="pricing-feature-item" key={f}>
                      <CheckCircle2 className={`pricing-check-icon ${plan.info ? 'info' : ''}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => onLaunchApp(plan.exec)} className="pricing-cta-btn">
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================================
          SECTION 6 — FAQ + CTA
          ====================================================================== */}
      <section className="section-block section-block-alt" id="faq">
        <div className="section-header-centered" data-reveal>
          <span className="section-eyebrow">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-desc">
            Everything you need to know about deterministic RAG and executive intelligence.
          </p>
        </div>

        <div className="faq-wrap">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div
                key={item.q}
                className={`faq-card ${open ? 'open' : ''}`}
                data-reveal
                style={{ '--d': i } as React.CSSProperties}
              >
                <button
                  className="faq-toggle"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={`faq-answer-${i}`}
                >
                  <h3 className="faq-q">{item.q}</h3>
                  <span className="faq-icon"><Plus style={{ width: 16, height: 16 }} /></span>
                </button>
                <div className="faq-body" id={`faq-answer-${i}`}>
                  <div>
                    <p className="faq-a">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cta-banner" data-reveal style={{ marginTop: 'clamp(56px, 9vh, 96px)' }}>
          <h2 className="section-title">Ready to consult your AI boardroom?</h2>
          <p className="section-desc" style={{ maxWidth: '36rem', margin: '0 auto 28px' }}>
            Launch the live workspace and ask your first grounded question in seconds — no signup required.
          </p>
          <button onClick={() => onLaunchApp()} className="btn-start-free" style={{ padding: '0.85em 1.8em', fontSize: '1rem' }}>
            <span>Launch Live Workspace</span>
            <ArrowRight style={{ width: 17, height: 17 }} />
          </button>
        </div>
      </section>

      <footer className="master-footer">
        <div className="footer-brand">
          <RadialLogo size={24} />
          <span>Citely • AI Executives</span>
        </div>
        <span>© 2026 Citely. All rights reserved.</span>
        <div className="footer-links">
          <a href="#home">Top</a>
          <a href="#executives">Executives</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </div>
  );
};
