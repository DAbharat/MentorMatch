"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Video,
  Calendar,
  Star,
  Bell,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  UserCircle2,
  Search,
  Play,
  Clock,
  ChevronRight,
} from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg:       "#0b090a",
  blue:      "#60a5fa",
  indigo:    "#6366f1",
  text:      "#ffffff",
  sec:       "rgba(211,211,211,0.65)",
  muted:     "rgba(211,211,211,0.50)",
  border:    "rgba(255,255,255,0.07)",
  borderH:   "rgba(255,255,255,0.12)",
  card:      "rgba(255,255,255,0.03)",
  cardH:     "rgba(255,255,255,0.055)",
  gradBtn:   "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)",
  gradText:  "linear-gradient(135deg,#60a5fa 0%,#6366f1 100%)",
};

// ─── Tiny Primitives ──────────────────────────────────────────────────────────
function GText({ children, italic = false }: { children: React.ReactNode; italic?: boolean }) {
  return (
    <span style={{
      background: T.gradText,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontStyle: italic ? "italic" : "normal",
    }}>
      {children}
    </span>
  );
}

function Orb({ size, opacity, style }: { size: number; opacity: number; style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle,rgba(96,165,250,${opacity}) 0%,rgba(99,102,241,${opacity * 0.5}) 45%,transparent 70%)`,
      filter: "blur(80px)",
      pointerEvents: "none",
      zIndex: 0,
      ...style,
    }} />
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "'DM Sans',sans-serif",
      fontSize: "0.7rem",
      fontWeight: 500,
      color: T.blue,
      background: "rgba(96,165,250,0.08)",
      border: "1px solid rgba(96,165,250,0.15)",
      padding: "2px 10px",
      borderRadius: 999,
      letterSpacing: "0.01em",
    }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} />;
}

function SectionChip({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'DM Sans',sans-serif",
      fontSize: "0.7rem",
      fontWeight: 500,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: T.blue,
      marginBottom: "1.1rem",
    }}>
      {children}
    </p>
  );
}

function H2({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{
      fontFamily: "'Instrument Serif',Georgia,serif",
      fontSize: "clamp(1.9rem,3.4vw,2.7rem)",
      lineHeight: 1.12,
      letterSpacing: "-0.03em",
      color: T.text,
      marginBottom: "0.9rem",
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </h2>
  );
}

function Sub({ children, center = false, maxW = 500 }: { children: React.ReactNode; center?: boolean; maxW?: number }) {
  return (
    <p style={{
      fontFamily: "'DM Sans',sans-serif",
      fontSize: "0.98rem",
      fontWeight: 300,
      lineHeight: 1.75,
      color: T.sec,
      maxWidth: maxW,
      margin: center ? "0 auto" : undefined,
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </p>
  );
}

function BtnPri({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  const [h, setH] = useState(false);
  return (
    <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: T.gradBtn, color: "#fff",
      fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem",
      padding: "11px 24px", borderRadius: 40,
      transition: "transform 0.2s,box-shadow 0.2s",
      transform: h ? "translateY(-2px)" : "none",
      boxShadow: h ? "0 8px 28px rgba(96,165,250,0.22)" : "0 2px 8px rgba(0,0,0,0.4)",
      textDecoration: "none", whiteSpace: "nowrap",
    }}>
      {children}
    </a>
  );
}

function BtnSec({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  const [h, setH] = useState(false);
  return (
    <a href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: h ? "rgba(96,165,250,0.06)" : "transparent",
      color: h ? T.blue : T.text,
      fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.9rem",
      padding: "11px 24px", borderRadius: 40,
      border: `1px solid ${h ? "rgba(96,165,250,0.35)" : T.border}`,
      transition: "all 0.2s",
      transform: h ? "translateY(-2px)" : "none",
      textDecoration: "none", whiteSpace: "nowrap",
    }}>
      {children}
    </a>
  );
}

// ─── Fade-up on scroll ────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(24px)",
      transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
    }}>
      {children}
    </div>
  );
}

// ─── Card with hover ──────────────────────────────────────────────────────────
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: h ? T.cardH : T.card,
      border: `1px solid ${h ? "rgba(96,165,250,0.16)" : T.border}`,
      borderRadius: 18,
      transition: "all 0.22s",
      transform: h ? "translateY(-2px)" : "none",
      boxShadow: h ? "0 8px 28px rgba(96,165,250,0.05)" : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════════════════════════
function Hero() {
  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(40px,10vw,60px) 24px clamp(30px,4vw,60px)",
      overflow: "hidden",
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
        backgroundSize: "56px 56px",
      }} />
      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 220,
        background: `linear-gradient(to bottom,transparent,${T.bg})`,
        pointerEvents: "none",
      }} />
      {/* Orbs */}
      <Orb size={640} opacity={0.11} style={{ top: -120, left: "50%", transform: "translateX(-50%)" }} />
      <Orb size={340} opacity={0.07} style={{ bottom: "10%", right: "-4%" }} />
      <Orb size={240} opacity={0.06} style={{ bottom: "25%", left: "-3%" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 840, width: "100%", textAlign: "center" }}>
        {/* Top badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 999, marginBottom: 36,
          background: "rgba(96,165,250,0.07)",
          border: "1px solid rgba(96,165,250,0.17)",
          animation: "fadeUp 0.6s ease both",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: T.blue, boxShadow: `0 0 6px ${T.blue}`,
            display: "block", animation: "pls 2s infinite",
          }} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.77rem", fontWeight: 500, color: T.blue }}>
            Real-time mentorship for developers
          </span>
          <ChevronRight size={11} color={T.blue} style={{ opacity: 0.65 }} />
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Instrument Serif',Georgia,serif",
          fontSize: "clamp(2.9rem,7.5vw,5.6rem)",
          lineHeight: 1.06,
          letterSpacing: "-0.04em",
          marginBottom: 26,
          animation: "fadeUp 0.7s 0.08s ease both",
        }}>
          <span style={{ color: T.text }}>Learn from people</span>
          <br />
          <GText italic>who've been there.</GText>
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "1.08rem",
          fontWeight: 300,
          lineHeight: 1.78,
          color: T.sec,
          maxWidth: 500,
          margin: "0 auto 44px",
          animation: "fadeUp 0.7s 0.16s ease both",
        }}>
          MentorMatch connects you with verified mentors for live 1-on-1 sessions
          via chat and video — scheduled around your availability.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
          marginBottom: 64,
          animation: "fadeUp 0.7s 0.24s ease both",
        }}>
          <BtnPri href="/sign-in">Find a mentor <ArrowRight size={14} /></BtnPri>
          <BtnSec href="#how">See how it works</BtnSec>
        </div>

        {/* Mini proof row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
          flexWrap: "wrap",
          animation: "fadeUp 0.7s 0.3s ease both",
        }}>
          {[
            { icon: ShieldCheck, text: "Verified mentors" },
            { icon: Video,       text: "HD video calls" },
            { icon: Clock,       text: "Flexible scheduling" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Icon size={14} color={T.blue} strokeWidth={1.8} />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: T.muted }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero product card */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 840, marginTop: 72, animation: "fadeUp 0.8s 0.38s ease both" }}>
        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div style={{
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.024)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.04),0 32px 80px rgba(0,0,0,0.55),0 0 56px rgba(96,165,250,0.04)",
      overflow: "hidden",
    }}>
      {/* Window chrome */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <Dot color="rgba(255,90,90,0.45)" />
        <Dot color="rgba(255,190,50,0.22)" />
        <Dot color="rgba(50,200,90,0.22)" />
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.72rem", color: T.muted, marginLeft: 8 }}>
          mentormatch.app — Session with Roman R.
        </span>
        <LivePill />
      </div>

      {/* Layout: sidebar + chat */}
      <div className="product-layout" style={{ display: "flex", height: 320 }}>
        {/* Sidebar */}
        <div className="sidebar" style={{
          width: 210, borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: 14, display: "flex", flexDirection: "column", gap: 8,
          flexShrink: 0,
        }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.63rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 4 }}>
            My Mentors
          </p>
          {[
            { init: "RR", name: "Roman Reigns",    skill: "System Design",  active: true },
            { init: "SR", name: "Seth Rollins",    skill: "React & Next.js", active: false },
            { init: "DA", name: "Dean Ambrose",     skill: "Node.js & APIs",  active: false },
          ].map((m) => (
            <SidebarRow key={m.init} {...m} />
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Chat header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar init="RR" size={28} active />
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.8rem", fontWeight: 500, color: T.text }}>Roman Reigns</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.67rem", color: T.muted }}>System Design · 38 min</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <MiniBtn icon={<Video size={12} color={T.muted} />} />
              <MiniBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>} />
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
            <Bubble left>How would you approach designing a rate limiter at scale?</Bubble>
            <Bubble left={false}>Start with a token bucket — simple, predictable. Use Redis for shared state.</Bubble>
            <CodeBlock />
            <TypingDots />
          </div>

          {/* Input bar */}
          <div style={{ padding: "0 14px 12px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 11px",
              borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.76rem", color: T.muted, flex: 1 }}>
                Ask a question or paste code…
              </span>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: T.gradBtn, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />;
}

function LivePill() {
  return (
    <div style={{
      marginLeft: "auto", display: "flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 999,
      background: "rgba(96,165,250,0.09)", border: "1px solid rgba(96,165,250,0.2)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.blue, display: "block", animation: "pls 1.5s infinite" }} />
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.67rem", color: T.blue, fontWeight: 500 }}>Live</span>
    </div>
  );
}

function SidebarRow({ init, name, skill, active }: { init: string; name: string; skill: string; active: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 9, cursor: "pointer",
      background: active ? "rgba(96,165,250,0.08)" : "transparent",
      border: `1px solid ${active ? "rgba(96,165,250,0.14)" : "transparent"}`,
    }}>
      <Avatar init={init} size={26} active={active} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.74rem", fontWeight: 500, color: active ? T.text : T.sec, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{name}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: T.muted, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{skill}</p>
      </div>
    </div>
  );
}

function Avatar({ init, size, active = false }: { init: string; size: number; active?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: active ? "rgba(96,165,250,0.16)" : "rgba(255,255,255,0.06)",
      border: `1px solid ${active ? "rgba(96,165,250,0.22)" : "rgba(255,255,255,0.09)"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 700, color: active ? T.blue : T.muted,
      fontFamily: "'DM Sans',sans-serif",
    }}>
      {init}
    </div>
  );
}

function MiniBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    }}>
      {icon}
    </div>
  );
}

function Bubble({ children, left }: { children: React.ReactNode; left: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: left ? "flex-start" : "flex-end" }}>
      <div style={{
        maxWidth: "78%", padding: "7px 11px", borderRadius: 10,
        background: left ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.12)",
        border: `1px solid ${left ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.2)"}`,
        fontFamily: "'DM Sans',sans-serif", fontSize: "0.75rem", lineHeight: 1.55, color: T.sec,
      }}>
        {children}
      </div>
    </div>
  );
}

function CodeBlock() {
  return (
    <div style={{
      borderRadius: 9, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.28)",
    }}>
      <div style={{ padding: "4px 11px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.63rem", color: T.blue, fontWeight: 500 }}>
        rate_limiter.py
      </div>
      <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.67rem", lineHeight: 1.65, padding: "7px 11px", color: "rgba(211,211,211,0.55)", margin: 0, overflowX: "auto" }}>
        <span style={{ color: "#6366f1" }}>def </span>
        <span style={{ color: "#60a5fa" }}>is_allowed</span>
        {`(key, limit):\n  count = redis.incr(key)\n  `}
        <span style={{ color: "#6366f1" }}>return</span>
        {` count <= limit`}
      </pre>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 11px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[0, 0.17, 0.34].map((d, i) => (
          <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(96,165,250,0.45)", display: "block", animation: `bnc 1.1s ${d}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURES
// ══════════════════════════════════════════════════════════════════════════════
const FEATURES = [
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    desc: "Instant messaging with code blocks and file sharing — built for technical conversations during live sessions.",
    tag: "Socket.io",
  },
  {
    icon: Video,
    title: "HD Video Calls",
    desc: "Peer-to-peer video via WebRTC with screen sharing. No external apps required — runs fully in browser.",
    tag: "WebRTC",
  },
  {
    icon: Calendar,
    title: "Session Scheduling",
    desc: "Book sessions based on mentor availability across timezones. Automated reminders keep things on track.",
    tag: "Calendar",
  },
  {
    icon: Star,
    title: "Feedback & Reviews",
    desc: "Structured post-session feedback helps you track progress and gives mentors meaningful insight.",
    tag: "Reviews",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Instant alerts for session reminders, messages, and availability changes across all your devices.",
    tag: "Alerts",
  },
  {
    icon: ShieldCheck,
    title: "Verified Mentors",
    desc: "Every mentor is reviewed for industry experience and communication quality before joining the platform.",
    tag: "Verified",
  },
];

function Features() {
  return (
    <section id="features" style={{ padding: "clamp(60px,10vw,100px) 24px", position: "relative", overflow: "hidden" }}>
      <Orb size={380} opacity={0.06} style={{ top: "15%", right: "-5%" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <SectionChip>Features</SectionChip>
          <H2><GText>What's included</GText> in every session</H2>
          <Sub maxW={460}>
            Every feature is built around one goal — making your time with a mentor as productive as possible.
          </Sub>
        </FadeUp>

        <div className="feat-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16, marginTop: 52,
        }}>
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.05}>
              <FeatureCard {...f} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, tag }: { icon: React.ElementType; title: string; desc: string; tag: string }) {
  return (
    <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={T.blue} strokeWidth={1.75} />
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.93rem", fontWeight: 500, color: T.text, marginBottom: 7 }}>{title}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", fontWeight: 300, lineHeight: 1.65, color: T.muted }}>{desc}</p>
      </div>
      <div style={{ marginTop: "auto" }}>
        <Tag>{tag}</Tag>
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════════════════════════
const STEPS = [
  { icon: UserCircle2, num: "01", title: "Create profile",    desc: "Tell us what you want to learn. Your profile helps us surface mentors." },
  { icon: Search,      num: "02", title: "Find a mentor",      desc: "Browse verified profiles, check availability, and send a request." },
  { icon: Calendar,    num: "03", title: "Schedule",           desc: "Pick a time that works for both. You'll get a reminder automatically." },
  { icon: Play,        num: "04", title: "Join & Learn",       desc: "Connect via live chat or HD video. Get direct feedback on real work." },
];

function HowItWorks() {
  return (
    <section id="how" style={{ padding: "clamp(60px,10vw,100px) 24px", position: "relative", overflow: "hidden" }}>
      <Orb size={320} opacity={0.06} style={{ bottom: "5%", left: "25%", transform: "translateX(-50%)" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionChip>How It Works</SectionChip>
            <H2 center>From sign-up to <GText>live session</GText></H2>
            <Sub center maxW={440}>
              Getting started takes a few minutes. The rest is up to you and your mentor.
            </Sub>
          </div>
        </FadeUp>

        <div style={{ position: "relative" }}>
          {/* Connector Line (Desktop Only) */}
          <div className="how-connector" style={{
            position: "absolute", top: 27,
            left: "12%", right: "12%",
            height: 1,
            background: "linear-gradient(90deg,transparent,rgba(96,165,250,0.22) 20%,rgba(99,102,241,0.22) 80%,transparent)",
            zIndex: 0
          }} />
          <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 32, position: "relative", zIndex: 1 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.num} delay={i * 0.07}>
                <StepCard {...s} index={i} />
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ icon: Icon, title, desc, index }: { icon: React.ElementType; title: string; desc: string; index: number }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} className="step-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ position: "relative", width: "fit-content" }}>
        <div style={{
          width: 54, height: 54, borderRadius: 15,
          background: h ? "rgba(96,165,250,0.13)" : "rgba(96,165,250,0.07)",
          border: `1px solid ${h ? "rgba(96,165,250,0.28)" : "rgba(96,165,250,0.14)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.22s",
          boxShadow: h ? "0 0 20px rgba(96,165,250,0.1)" : "none",
        }}>
          <Icon size={21} color={T.blue} strokeWidth={1.75} />
        </div>
        <div style={{
          position: "absolute", top: -5, right: -5,
          width: 18, height: 18, borderRadius: "50%",
          background: T.gradBtn,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.58rem", fontWeight: 700, color: "#fff",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          {index + 1}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem", fontWeight: 500, color: T.text, marginBottom: 7 }}>{title}</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem", fontWeight: 300, lineHeight: 1.65, color: T.muted }}>{desc}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRODUCT EXPERIENCE
// ══════════════════════════════════════════════════════════════════════════════
function ProductExperience() {
  const [tab, setTab] = useState<"chat" | "video" | "schedule">("chat");
  return (
    <section id="product" style={{ padding: "clamp(60px,10vw,100px) 24px", position: "relative", overflow: "hidden" }}>
      <Orb size={480} opacity={0.06} style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionChip>Product</SectionChip>
            <H2 center>See it in <GText>action</GText></H2>
            <Sub center maxW={420}>
              A look at the core interfaces you'll use every session.
            </Sub>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          {/* Tab bar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <div style={{
              display: "flex", gap: 3, padding: 4, borderRadius: 16,
              background: T.card, border: `1px solid ${T.border}`,
              flexWrap: "wrap", justifyContent: "center"
            }}>
              {([
                { id: "chat",     label: "Live Chat" },
                { id: "video",    label: "Video Call" },
                { id: "schedule", label: "Scheduling" },
              ] as const).map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "7px 18px", borderRadius: 12,
                  background: tab === t.id ? "rgba(96,165,250,0.1)" : "transparent",
                  border: `1px solid ${tab === t.id ? "rgba(96,165,250,0.2)" : "transparent"}`,
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "0.84rem",
                  color: tab === t.id ? T.blue : T.muted,
                  cursor: "pointer", transition: "all 0.18s",
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel */}
          <div style={{
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.022)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.45),0 0 40px rgba(96,165,250,0.035)",
          }}>
            {/* Chrome */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <Dot color="rgba(255,90,90,0.4)" />
              <Dot color="rgba(255,190,50,0.2)" />
              <Dot color="rgba(50,200,90,0.2)" />
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.71rem", color: T.muted, marginLeft: 8 }}>
                mentormatch.app/{tab}
              </span>
            </div>

            <div style={{ padding: "clamp(16px,4vw,32px)" }}>
              {tab === "chat"     && <ChatPreview />}
              {tab === "video"    && <VideoPreview />}
              {tab === "schedule" && <SchedulePreview />}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <div className="experience-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
      <div>
        <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "1.6rem", color: T.text, marginBottom: 12, lineHeight: 1.2 }}>
          Chat built for<br /><GText italic>technical work</GText>
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.75, color: T.sec, marginBottom: 20 }}>
          Share code directly in the conversation with syntax highlighting. No copy-pasting into external tools.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {["Code blocks", "File sharing", "Socket.io"].map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar init="RR" size={24} active />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 500, color: T.text }}>Roman Reigns</span>
          <LivePill />
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
          <Bubble left>Walk me through the component structure.</Bubble>
          <div style={{ borderRadius: 9, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "3px 11px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.62rem", color: T.blue }}>layout.tsx</div>
            <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.67rem", padding: "7px 11px", color: "rgba(211,211,211,0.5)", margin: 0, lineHeight: 1.6 }}>
              {`export default function Layout() {\n  return <div>{children}</div>\n}`}
            </pre>
          </div>
          <Bubble left>Makes sense. Let's talk data fetching.</Bubble>
        </div>
      </div>
    </div>
  );
}

function VideoPreview() {
  return (
    <div className="experience-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
      <div>
        <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "1.6rem", color: T.text, marginBottom: 12, lineHeight: 1.2 }}>
          HD video — <br /><GText italic>no extra apps</GText>
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.75, color: T.sec, marginBottom: 20 }}>
          Peer-to-peer WebRTC video with screen sharing runs entirely in your browser. No downloads required.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {["WebRTC", "Screen share", "P2P"].map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ background: "#070910", padding: "30px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,rgba(96,165,250,0.04) 0%,transparent 70%)" }} />
          <Avatar init="RR" size={52} active />
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: T.muted, zIndex: 1 }}>Roman Reigns — Mentor</p>
          <div style={{ padding: "8px 12px", borderRadius: 9, zIndex: 1, background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.14)", fontFamily: "'DM Sans',sans-serif", fontSize: "0.74rem", color: T.muted }}>🖥️ Screen share active</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "10px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {["🎤", "📹", "🖥️"].map((e) => (
            <div key={e} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>{e}</div>
          ))}
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(239,68,68,0.13)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" }}>✕</div>
        </div>
      </div>
    </div>
  );
}

function SchedulePreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const [sel, setSel] = useState<string | null>("Wed-10:00");
  return (
    <div className="experience-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
      <div>
        <p style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "1.6rem", color: T.text, marginBottom: 12, lineHeight: 1.2 }}>
          Schedule around<br /><GText italic>your availability</GText>
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.88rem", fontWeight: 300, lineHeight: 1.75, color: T.sec, marginBottom: 20 }}>
          See exactly when your mentor is available and book a slot that fits your day.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {["Availability sync", "Timezone aware"].map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      </div>
      <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", fontWeight: 500, color: T.text }}>Roman Reigns</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem", color: T.muted }}>This week</span>
        </div>
        <div style={{ padding: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 8 }}>
            {days.map((d) => (
              <div key={d} style={{ textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: "0.68rem", color: T.muted, fontWeight: 500 }}>{d}</div>
            ))}
          </div>
          {["10:00", "14:00"].map((time) => (
            <div key={time} style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 6 }}>
              {days.map((day) => {
                const id = `${day}-${time}`;
                const isSelected = sel === id;
                return (
                  <div key={id} onClick={() => setSel(id)} style={{
                    padding: "5px 0", borderRadius: 7, textAlign: "center",
                    fontFamily: "'DM Sans',sans-serif", fontSize: "0.65rem",
                    cursor: "pointer",
                    background: isSelected ? "rgba(96,165,250,0.16)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)"}`,
                    color: isSelected ? T.blue : T.sec,
                    transition: "all 0.15s",
                  }}>{time}</div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CTA
// ══════════════════════════════════════════════════════════════════════════════
function CTA() {
  return (
    <section id="cta" style={{ padding: "120px 24px", position: "relative", overflow: "hidden", textAlign: "center" }}>
      <Orb size={640} opacity={0.1} style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
        <FadeUp>
          <SectionChip>Get Started</SectionChip>
          <h2 style={{
            fontFamily: "'Instrument Serif',Georgia,serif",
            fontSize: "clamp(2.2rem,5vw,3.8rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
            marginBottom: 20,
          }}>
            Start learning from<br />
            <GText italic>real people.</GText>
          </h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "1rem",
            fontWeight: 300,
            lineHeight: 1.78,
            color: T.sec,
            maxWidth: 420,
            margin: "0 auto 44px",
          }}>
            Book your first session with a verified mentor.
            No commitment — just a conversation.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            <BtnPri href="/sign-in">Find a mentor <ArrowRight size={14} /></BtnPri>
            <BtnSec href="#features">See features</BtnSec>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {["No subscription", "Cancel anytime"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={13} color={T.blue} strokeWidth={2} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.82rem", color: T.muted }}>{t}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 32px" }}>
      <div className="footer-layout" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <div className="footer-top" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
          <div>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, textDecoration: "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: T.gradBtn, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="#fff" strokeWidth="1.5" fill="none" />
                  <circle cx="8" cy="8" r="2" fill="#fff" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "0.95rem", color: T.text }}>
                Mentor<GText>Match</GText>
              </span>
            </a>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.83rem", fontWeight: 300, lineHeight: 1.7, color: T.muted, maxWidth: 240 }}>
              Live 1-on-1 mentorship for developers. Real sessions, real feedback.
            </p>
          </div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            {[
              { group: "Platform", links: ["Features", "How It Works"] },
              { group: "Company",  links: ["About", "Blog", "Contact"] },
              { group: "Legal",    links: ["Privacy", "Terms"] },
            ].map(({ group, links }) => (
              <div key={group}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: T.text, marginBottom: 14 }}>{group}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {links.map((l) => <FLink key={l}>{l}</FLink>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: T.muted }}>
            © {new Date().getFullYear()} MentorMatch.
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.78rem", color: T.muted }}>
            Built for learners.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FLink({ children }: { children: React.ReactNode }) {
  const [h, setH] = useState(false);
  return (
    <a href="#" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "0.84rem", color: h ? T.text : T.muted, transition: "color 0.16s", textDecoration: "none" }}>
      {children}
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL CSS + ROOT
// ══════════════════════════════════════════════════════════════════════════════
function GlobalStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #0b090a; color: #ffffff; font-family: 'DM Sans',sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; line-height: 1.6; }
      
      /* RESPONSIVE OVERRIDES */
      @media (max-width: 1024px) {
        .feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }

      @media (max-width: 860px) {
        .how-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .how-connector { display: none !important; }
        .experience-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
      }

      @media (max-width: 640px) {
        .feat-grid, .how-grid { grid-template-columns: 1fr !important; }
        .sidebar { display: none !important; }
        .product-layout { height: auto !important; }
        .product-layout > div { min-height: 300px; }
      }

      @keyframes fadeUp { from { opacity:0; transform:translateY(26px); } to { opacity:1; transform:none; } }
      @keyframes pls    { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(1.3); } }
      @keyframes bnc    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
    ` }} />
  );
}

export default function Page() {
  return (
    <>
      <GlobalStyles />
      <main>
        <Hero />
        <Divider />
        <Features />
        <Divider />
        <HowItWorks />
        <Divider />
        <ProductExperience />
        <Divider />
        <CTA />
      </main>
      <Footer />
    </>
  );
}