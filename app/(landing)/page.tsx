"use client";

import Link from "next/link";
import {
  CheckCircle,
  Users,
  Zap,
  Video,
  MessageSquare,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    icon: Video,
    title: "Live Video Sessions",
    description:
      "Connect face-to-face with mentors in real-time. Share screens and collaborate through high-quality video calls.",
  },
  {
    icon: MessageSquare,
    title: "Integrated Chat",
    description:
      "Message mentors anytime. Ask questions, share resources, and maintain ongoing conversations.",
  },
  {
    icon: Users,
    title: "Skill Marketplace",
    description:
      "Browse mentors by skill and connect with people who share your learning goals.",
  },
  {
    icon: Star,
    title: "Ratings & Feedback",
    description:
      "Rate and review sessions to help others find the best mentors.",
  },
  {
    icon: Zap,
    title: "Smart Scheduling",
    description:
      "Schedule sessions easily with automatic reminders.",
  },
  {
    icon: CheckCircle,
    title: "Session History",
    description:
      "Track completed sessions and skills you've acquired.",
  },
];

const steps = [
  {
    title: "Create Your Profile",
    description: "Sign up and showcase your skills, interests, and learning goals.",
    icon: CheckCircle,
  },
  {
    title: "Find or Offer Skills",
    description: "Browse mentors or become one and share your expertise.",
    icon: Users,
  },
  {
    title: "Schedule Sessions",
    description: "Book time slots that work for both mentor and learner.",
    icon: Zap,
  },
  {
    title: "Learn & Grow",
    description: "Join live video calls and track your progress over time.",
    icon: Video,
  },
];

const testimonials = [
  {
    quote:
      "MentorMatch connected me with an amazing mentor who helped me transition into tech. Within 3 months I landed my first dev role.",
    author: "Sarah Chen",
    role: "Junior Developer",
    initial: "S",
    color: "#60a5fa",
  },
  {
    quote:
      "As a mentor, I love how easy it is to schedule sessions and help learners grow. The platform just gets out of the way.",
    author: "Alex Rodriguez",
    role: "Senior Engineer",
    initial: "A",
    color: "#a78bfa",
  },
  {
    quote:
      "The community here is incredibly supportive and inspiring. Found my co-founder through a mentorship session.",
    author: "Jordan Smith",
    role: "Product Designer",
    initial: "J",
    color: "#34d399",
  },
];

const stats = [
  { value: "5K+", label: "Active Learners" },
  { value: "2K+", label: "Expert Mentors" },
  { value: "10K+", label: "Sessions Done" },
];

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/profile");
    }
  }, [user, isLoaded, router]);

  return (
    <div
      className="w-full min-h-screen text-[#d3d3d3] overflow-x-hidden"
      style={{ background: "#0b090a", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --accent: #60a5fa;
          --accent-dim: rgba(96,165,250,0.12);
          --border: rgba(255,255,255,0.07);
          --card: rgba(255,255,255,0.03);
          --card-hover: rgba(255,255,255,0.055);
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px); pointer-events: none; z-index: 0;
        }
        .orb-blue {
          width: min(600px, 100vw); height: min(600px, 100vw);
          background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%);
          top: -100px; left: -200px;
        }
        .orb-purple {
          width: min(500px, 90vw); height: min(500px, 90vw);
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          top: 100px; right: -150px;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2);
          border-radius: 100px; padding: 6px 14px; font-size: 13px;
          color: #93c5fd; font-weight: 500; letter-spacing: 0.02em; margin-bottom: 24px;
        }

        .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(96,165,250,0.7); margin-bottom: 12px;
        }

        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }

        .section-pad { padding: 100px 0; }

        .feature-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 16px;
          background: radial-gradient(circle at 30% 20%, var(--accent-dim), transparent 60%);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .feature-card:hover { border-color: rgba(96,165,250,0.25); background: var(--card-hover); transform: translateY(-2px); }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover .icon-wrap { background: rgba(96,165,250,0.2); }

        .icon-wrap {
          width: 46px; height: 46px; border-radius: 12px;
          background: var(--accent-dim); display: flex; align-items: center;
          justify-content: center; transition: background 0.3s ease; flex-shrink: 0;
        }

        .step-number {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 700; color: #93c5fd; flex-shrink: 0;
        }

        .stat-item {
          text-align: center; padding: 20px 12px; border-radius: 14px;
          background: var(--card); border: 1px solid var(--border);
        }

        .testimonial-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          display: flex; flex-direction: column; gap: 18px;
          transition: all 0.3s ease;
        }
        .testimonial-card:hover { border-color: rgba(96,165,250,0.2); background: var(--card-hover); transform: translateY(-2px); }

        .hero-mockup {
          background: rgba(255,255,255,0.025); border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
        }
        .mockup-bar {
          background: rgba(255,255,255,0.04); border-bottom: 1px solid var(--border);
          padding: 12px 16px; display: flex; align-items: center; gap: 8px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        .cta-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        .animate-hero        { animation: fadeUp 0.7s 0.00s ease both; }
        .animate-hero-delay  { animation: fadeUp 0.7s 0.15s ease both; }
        .animate-hero-delay2 { animation: fadeUp 0.7s 0.30s ease both; }
        .animate-hero-delay3 { animation: fadeUp 0.7s 0.45s ease both; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px; border: none;
          background: linear-gradient(135deg,#3b82f6,#6366f1);
          color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s, transform 0.2s; text-decoration: none; white-space: nowrap;
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent; color: rgba(211,211,211,0.85);
          font-size: 15px; cursor: pointer; transition: all 0.2s;
          text-decoration: none; white-space: nowrap;
        }
        .btn-ghost:hover { border-color: rgba(96,165,250,0.4); color: #fff; }

        /* ─── RESPONSIVE ─── */

        /* Hero */
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .hero-mockup-col { display: none; }
        }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px)  { .features-grid { grid-template-columns: 1fr; } }

        /* Steps */
        .steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
        .step-col { padding: 0 24px; }
        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1px; background: rgba(255,255,255,0.06);
            border-radius: 16px; overflow: hidden;
          }
          .step-col { background: #0b090a; border-right: none !important; padding: 28px 24px !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
        }

        /* Testimonials */
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .testimonials-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px)  { .testimonials-grid { grid-template-columns: 1fr; } }

        /* Stats */
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

        /* CTA buttons */
        .cta-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
        @media (max-width: 480px) {
          .cta-buttons { flex-direction: column; }
          .btn-primary, .btn-ghost { width: 100%; justify-content: center; }
        }

        /* Footer */
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 400px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-brand { grid-column: auto; }
        }

        .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }

        /* Section padding mobile */
        @media (max-width: 640px) {
          .section-pad { padding: 64px 0; }
          .container { padding: 0 16px; }
          .hero-section { padding: 72px 0 80px !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="hero-section"
        style={{ position: "relative", padding: "100px 0 120px", overflow: "hidden" }}
      >
        <div className="orb orb-blue" />
        <div className="orb orb-purple" />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 0,
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-grid">
            {/* Left */}
            <div>
              <div className="badge animate-hero">
                <Sparkles style={{ width: 13, height: 13 }} />
                Skill-sharing, reimagined
              </div>

              <h1
                className="animate-hero-delay"
                style={{
                  fontSize: "clamp(38px, 6vw, 72px)",
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: 400, lineHeight: 1.1, color: "#fff",
                  margin: "0 0 24px", letterSpacing: "-0.02em",
                }}
              >
                Master Skills.
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Teach What You Know.
                </span>
              </h1>

              <p
                className="animate-hero-delay2"
                style={{
                  fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.7,
                  color: "rgba(211,211,211,0.65)", maxWidth: 480, margin: "0 0 36px",
                }}
              >
                Connect with mentors and learners worldwide. Schedule live sessions,
                share knowledge, and grow together through real-time video collaboration.
              </p>

              <div className="cta-buttons animate-hero-delay3" style={{ marginBottom: 52 }}>
                <Link href="/sign-up" className="btn-primary">
                  Start Learning Free
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="/sign-up" className="btn-ghost">
                  Become a Mentor
                </Link>
              </div>

              <div className="stats-grid">
                {stats.map((s, i) => (
                  <div key={i} className="stat-item">
                    <div style={{
                      fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: "#fff",
                      fontFamily: "'Instrument Serif', serif", letterSpacing: "-0.02em",
                    }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(211,211,211,0.5)", marginTop: 4 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right mockup — hidden on mobile via CSS */}
            <div className="hero-mockup-col" style={{ position: "relative" }}>
              <div style={{
                position: "absolute", inset: -40,
                background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15), transparent 70%)",
                borderRadius: "50%", pointerEvents: "none",
              }} />
              <div className="hero-mockup">
                <div className="mockup-bar">
                  <div className="dot" style={{ background: "#ff5f57" }} />
                  <div className="dot" style={{ background: "#febc2e" }} />
                  <div className="dot" style={{ background: "#28c840" }} />
                  <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.04)", borderRadius: 6, marginLeft: 8 }} />
                </div>
                <div style={{ padding: 28 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 100,
                    background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)",
                    marginBottom: 20,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse-dot 1.5s infinite" }} />
                    <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>LIVE NOW</span>
                  </div>

                  <div style={{
                    background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)",
                    borderRadius: 12, padding: "40px 0",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 20,
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: "50%",
                      background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Video style={{ width: 28, height: 28, color: "#fff" }} />
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                      React Fundamentals — Session 4
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {["#3b82f6", "#a78bfa", "#34d399"].map((c, i) => (
                        <div key={i} style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: c, border: "2px solid #0b090a", marginLeft: i === 0 ? 0 : -10,
                        }} />
                      ))}
                      <span style={{ marginLeft: 8, fontSize: 13, color: "rgba(211,211,211,0.6)" }}>3 participants</span>
                    </div>
                    <div style={{
                      display: "flex", gap: 6, alignItems: "center",
                      background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 12px",
                    }}>
                      <MessageSquare style={{ width: 14, height: 14, color: "#60a5fa" }} />
                      <span style={{ fontSize: 12, color: "rgba(211,211,211,0.6)" }}>Chat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-pad" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <p className="section-label">Features</p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 400, color: "#fff",
              margin: "0 0 16px", letterSpacing: "-0.02em", maxWidth: 520,
            }}>
              Everything you need to learn and teach
            </h2>
            <p style={{ color: "rgba(211,211,211,0.55)", fontSize: 16, maxWidth: 480 }}>
              A complete platform for mentors and learners to connect, collaborate, and grow.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="icon-wrap" style={{ marginBottom: 18 }}>
                  <feature.icon style={{ width: 20, height: 20, color: "#60a5fa" }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                  {feature.title}
                </h3>
                <p style={{ color: "rgba(211,211,211,0.55)", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-pad" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="section-label">Process</p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 400, color: "#fff",
              margin: "0 0 16px", letterSpacing: "-0.02em",
            }}>
              Up and running in 4 steps
            </h2>
            <p style={{ color: "rgba(211,211,211,0.55)", fontSize: 16, maxWidth: 420, margin: "0 auto" }}>
              Simple onboarding to kickstart your mentorship journey today.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isLast = idx === steps.length - 1;
              return (
                <div
                  key={idx}
                  className="step-col"
                  style={{ borderRight: isLast ? "none" : "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div className="step-number">{idx + 1}</div>
                  </div>
                  <div className="icon-wrap" style={{ marginBottom: 16 }}>
                    <StepIcon style={{ width: 20, height: 20, color: "#60a5fa" }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(211,211,211,0.55)", lineHeight: 1.65, margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section-pad" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div style={{ marginBottom: 56 }}>
            <p className="section-label">Testimonials</p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 400, color: "#fff",
              margin: "0 0 16px", letterSpacing: "-0.02em",
            }}>
              Loved by our community
            </h2>
            <p style={{ color: "rgba(211,211,211,0.55)", fontSize: 16 }}>
              Thousands of successful mentorships and learning journeys.
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <div style={{ display: "flex", gap: 3 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: 13, height: 13, color: "#fbbf24", fill: "#fbbf24" }} />
                  ))}
                </div>
                <p style={{
                  fontSize: 15, lineHeight: 1.7, color: "rgba(211,211,211,0.8)",
                  margin: 0, flex: 1, fontStyle: "italic",
                  fontFamily: "'Instrument Serif', serif",
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `${t.color}22`, border: `1px solid ${t.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: t.color,
                    fontFamily: "'Instrument Serif', serif", flexShrink: 0,
                  }}>
                    {t.initial}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#fff", fontWeight: 600, fontSize: 14 }}>{t.author}</p>
                    <p style={{ margin: 0, color: "rgba(211,211,211,0.5)", fontSize: 12, marginTop: 2 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-pad" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
        <div className="cta-glow" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <p className="section-label">Get started</p>
            <h2 style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 400, color: "#fff",
              margin: "0 0 20px", letterSpacing: "-0.02em", lineHeight: 1.15,
            }}>
              Ready to transform your learning?
            </h2>
            <p style={{ color: "rgba(211,211,211,0.6)", fontSize: 16, lineHeight: 1.7, margin: "0 0 40px" }}>
              Join thousands of learners and mentors building meaningful connections
              through skill exchange. It's free to get started.
            </p>
            <div className="cta-buttons" style={{ justifyContent: "center" }}>
              <Link href="/sign-up" className="btn-primary" style={{ padding: "15px 32px" }}>
                Create Free Account
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link href="/sign-in" className="btn-ghost" style={{ padding: "15px 32px" }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "64px 0 40px", background: "rgba(0,0,0,0.2)" }}>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "linear-gradient(135deg,#3b82f6,#818cf8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Video style={{ width: 13, height: 13, color: "#fff" }} />
                </div>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#fff" }}>
                  MentorMatch
                </span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(211,211,211,0.45)", lineHeight: 1.7, maxWidth: 260, margin: 0 }}>
                Connect with mentors and learners worldwide. Share knowledge, grow together.
              </p>
            </div>

            {[
              { label: "Product", links: ["Features", "Pricing", "Security"] },
              { label: "Company", links: ["About", "Blog", "Careers"] },
              { label: "Legal", links: ["Privacy", "Terms", "Contact"] },
            ].map((col) => (
              <div key={col.label}>
                <h4 style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: "0 0 16px",
                }}>
                  {col.label}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ fontSize: 13, color: "rgba(211,211,211,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(211,211,211,0.9)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(211,211,211,0.5)")}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24 }}>
            <p style={{ fontSize: 12, color: "rgba(211,211,211,0.35)", margin: 0 }}>
              © 2026 MentorMatch. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{ fontSize: 12, color: "rgba(211,211,211,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(211,211,211,0.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(211,211,211,0.35)")}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}