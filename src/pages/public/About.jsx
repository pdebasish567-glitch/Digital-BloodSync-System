import React, { useEffect, useState } from "react";
import {
  Activity, AlertCircle, ArrowRight, CalendarClock, CheckCircle2,
  Database, Droplets, Globe, HeartHandshake, MapPin, Shield,
  Target, Users, XCircle, ChevronRight, RotateCcw, Award, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

/* ════════════════════════════════════════
   BLOOD DONATION ELIGIBILITY QUIZ
   Human body SVG + 10 questions
════════════════════════════════════════ */

const QUESTIONS = [
  {
    q: "Are you between 18 and 65 years of age?",
    hint: "Most blood banks require donors to be 18–65 years old. Minors and elderly individuals face higher donation risks.",
    correct: 0,
    options: ["Yes, I am within this range", "No, I am outside this range"],
  },
  {
    q: "Do you weigh more than 50 kg (about 110 lbs)?",
    hint: "Minimum weight of 50 kg ensures the donor's body can safely spare 450 mL of blood without risk.",
    correct: 0,
    options: ["Yes, I weigh more than 50 kg", "No, I weigh less than 50 kg"],
  },
  {
    q: "Is your hemoglobin level 12.5 g/dL or above?",
    hint: "Hemoglobin below 12.5 g/dL indicates potential anemia — the donor needs their own iron levels before donating.",
    correct: 0,
    options: ["Yes, my Hb is 12.5 or higher", "No, my Hb is below 12.5 g/dL"],
  },
  {
    q: "Has it been at least 3 months since your last blood donation?",
    hint: "The body needs ~3 months to fully replenish red blood cells, iron stores and plasma proteins after donation.",
    correct: 0,
    options: ["Yes, 3+ months have passed", "No, it has been less than 3 months"],
  },
  {
    q: "Are you currently free from fever, cold, or flu?",
    hint: "Active infections can contaminate donated blood and also place stress on the donor's immune system.",
    correct: 0,
    options: ["Yes, I feel completely healthy", "No, I have fever or flu symptoms"],
  },
  {
    q: "Is your blood pressure within normal range (80–120 mmHg)?",
    hint: "Very high or very low blood pressure creates risk during venipuncture and can cause fainting or injury.",
    correct: 0,
    options: ["Yes, my BP is in normal range", "No, I have BP issues"],
  },
  {
    q: "Are you currently NOT taking antibiotics or blood thinners?",
    hint: "Antibiotics affect blood quality. Anticoagulants (blood thinners) increase risk of excessive bleeding during donation.",
    correct: 0,
    options: ["Correct — I'm not on these medicines", "No — I am taking antibiotics or blood thinners"],
  },
  {
    q: "Have you avoided tattoos or piercings in the last 6 months?",
    hint: "Tattoos and piercings create an entry point for bloodborne pathogens like Hepatitis B and C within 6 months.",
    correct: 0,
    options: ["Yes — no tattoos or piercings in 6 months", "No — I got one in the last 6 months"],
  },
  {
    q: "Are you currently NOT pregnant or breastfeeding?",
    hint: "Pregnancy and lactation reduce available nutrients and blood volume — donation could harm mother or child.",
    correct: 0,
    options: ["Correct — I am not pregnant/breastfeeding", "No — I am pregnant or breastfeeding"],
  },
  {
    q: "Are you free from HIV, Hepatitis B/C, and other bloodborne diseases?",
    hint: "Blood safety is critical. All donated blood is tested, but self-screening prevents unnecessary waste and infection risk.",
    correct: 0,
    options: ["Yes — I have no bloodborne conditions", "No — I have a bloodborne condition"],
  },
];

/* ── Human body SVG that fills from bottom with blood ── */
function HumanBody({ pct }) {
  // viewBox 0 0 120 320, body occupies y≈6 to y≈312
  // Blood rises from feet (y=312) upward
  const totalH = 306;
  const topY   = 6;
  const fillH  = (totalH * pct) / 100;
  const fillY  = topY + totalH - fillH;

  const bodyColor   = "#e2e8f0";
  const strokeColor = "#94a3b8";
  const bloodColor  = `rgba(185,28,28,${0.75 + pct * 0.002})`;

  return (
    <svg viewBox="0 0 120 320" style={{ width: "100%", maxWidth: 160, display: "block", margin: "0 auto", filter: "drop-shadow(0 8px 20px rgba(185,28,28,0.2))" }}>
      <defs>
        <clipPath id="bodyClip">
          {/* Head */}
          <circle cx="60" cy="26" r="20" />
          {/* Neck */}
          <rect x="53" y="44" width="14" height="14" />
          {/* Left arm */}
          <polygon points="12,58 32,58 24,68 16,140 4,137" />
          {/* Left hand */}
          <ellipse cx="8" cy="145" rx="7" ry="11" />
          {/* Right arm */}
          <polygon points="108,58 88,58 96,68 104,140 116,137" />
          {/* Right hand */}
          <ellipse cx="112" cy="145" rx="7" ry="11" />
          {/* Torso */}
          <polygon points="32,58 88,58 82,155 38,155" />
          {/* Hips */}
          <polygon points="34,155 86,155 90,175 30,175" />
          {/* Left leg */}
          <polygon points="30,175 59,175 57,308 26,308" />
          {/* Right leg */}
          <polygon points="61,175 90,175 94,308 63,308" />
        </clipPath>

        {/* Gradient for blood */}
        <linearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="1" />
        </linearGradient>

        {/* Shimmer overlay */}
        <linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Body fill (empty) */}
      <circle cx="60" cy="26" r="20" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <rect x="53" y="44" width="14" height="14" fill={bodyColor} stroke={strokeColor} strokeWidth="1" />
      <polygon points="12,58 32,58 24,68 16,140 4,137" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <ellipse cx="8" cy="145" rx="7" ry="11" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="108,58 88,58 96,68 104,140 116,137" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <ellipse cx="112" cy="145" rx="7" ry="11" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="32,58 88,58 82,155 38,155" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="34,155 86,155 90,175 30,175" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="30,175 59,175 57,308 26,308" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />
      <polygon points="61,175 90,175 94,308 63,308" fill={bodyColor} stroke={strokeColor} strokeWidth="1.5" />

      {/* Blood fill rising from bottom — clipped to body */}
      <rect
        x="0" y={fillY} width="120" height={fillH + 4}
        fill="url(#bloodGrad)"
        clipPath="url(#bodyClip)"
        style={{ transition: "y 0.8s ease, height 0.8s ease" }}
      />
      {/* Shimmer on blood */}
      {pct > 0 && (
        <rect x="0" y={fillY} width="120" height={fillH} fill="url(#shimmer)" clipPath="url(#bodyClip)" />
      )}

      {/* Body outline on top */}
      <circle cx="60" cy="26" r="20" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <rect x="53" y="44" width="14" height="14" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1" />
      <polygon points="12,58 32,58 24,68 16,140 4,137" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <ellipse cx="8" cy="145" rx="7" ry="11" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.5" />
      <polygon points="108,58 88,58 96,68 104,140 116,137" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <ellipse cx="112" cy="145" rx="7" ry="11" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.5" />
      <polygon points="32,58 88,58 82,155 38,155" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <polygon points="34,155 86,155 90,175 30,175" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <polygon points="30,175 59,175 57,308 26,308" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />
      <polygon points="61,175 90,175 94,308 63,308" fill="none" stroke={pct > 80 ? "#fca5a5" : strokeColor} strokeWidth="1.8" />

      {/* Face dots (subtle) */}
      <circle cx="54" cy="24" r="1.5" fill={pct > 50 ? "#fff" : "#94a3b8"} />
      <circle cx="66" cy="24" r="1.5" fill={pct > 50 ? "#fff" : "#94a3b8"} />
      <path d="M 55,31 Q 60,35 65,31" stroke={pct > 50 ? "#fff" : "#94a3b8"} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Pct label at center */}
      <text x="60" y="118" textAnchor="middle" fontSize="12" fontWeight="900" fill={pct > 40 ? "#fff" : "#94a3b8"} fontFamily="system-ui">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

/* ── Quiz component ── */
function BloodEligibilityQuiz() {
  const [phase, setPhase]         = useState("intro"); // intro | quiz | result
  const [qIdx, setQIdx]           = useState(0);
  const [score, setScore]         = useState(0);
  const [answered, setAnswered]   = useState(null);   // null | {chosen, correct}
  const [history, setHistory]     = useState([]);     // array of booleans

  const fillPct = Math.round((score / 10) * 100);
  const q       = QUESTIONS[qIdx];

  const handleAnswer = (chosenIdx) => {
    if (answered !== null) return;
    const isCorrect = chosenIdx === q.correct;
    if (isCorrect) setScore(s => s + 1);
    setHistory(h => [...h, isCorrect]);
    setAnswered({ chosen: chosenIdx, isCorrect });
  };

  const handleNext = () => {
    if (qIdx + 1 >= QUESTIONS.length) {
      setPhase("result");
    } else {
      setQIdx(i => i + 1);
      setAnswered(null);
    }
  };

  const restart = () => {
    setPhase("intro");
    setQIdx(0);
    setScore(0);
    setAnswered(null);
    setHistory([]);
  };

  /* ── eligibility tier ── */
  const tier = fillPct >= 90
    ? { label: "Fully Eligible", emoji: "🏆", desc: "You meet all major criteria for blood donation. Please visit your nearest blood bank!", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" }
    : fillPct >= 70
    ? { label: "Mostly Eligible", emoji: "✅", desc: "You meet most criteria. A few concerns should be checked with a doctor before donating.", color: "#d97706", bg: "#fffbeb", border: "#fde68a" }
    : fillPct >= 40
    ? { label: "Partially Eligible", emoji: "⚠️", desc: "Some important criteria were not met. Consult a healthcare professional for guidance.", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" }
    : { label: "Not Currently Eligible", emoji: "❌", desc: "You may not be eligible to donate at this time. Work on the flagged areas and try again.", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };

  return (
    <section style={{ padding: "5.5rem 0", background: "#f8fafc" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Interactive Tool</div>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 0.75rem", letterSpacing: "-0.025em" }}>
            Are You Eligible to Donate Blood?
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: 520, margin: "0 auto" }}>
            Answer 10 pre-donation screening questions. Watch the human body fill with blood as you qualify — and see your eligibility score at the end.
          </p>
        </div>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 8px 32px rgba(15,23,42,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🩸</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: "0 0 0.75rem" }}>Blood Donation Pre-Screening</h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              This tool simulates the standard pre-donation checklist used at hospital blood banks. Every correct answer fills the human body with blood. Your final score shows your donation readiness percentage.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem", textAlign: "left" }}>
              {[["10 questions","Standard screening criteria"],["Instant feedback","Learn after each answer"],["Body fills up","Visual eligibility meter"],["Final score","Eligibility percentage"]].map(([t,d]) => (
                <div key={t} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", background: "#f8fafc", borderRadius: "10px", padding: "0.75rem" }}>
                  <CheckCircle2 size={14} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
                  <div><div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0f172a" }}>{t}</div><div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{d}</div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("quiz")} style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.9rem 2rem", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(185,28,28,0.3)", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
              Start Screening →
            </button>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2.5rem", alignItems: "start", maxWidth: 860, margin: "0 auto" }}>

            {/* Left: body + progress */}
            <div style={{ position: "sticky", top: "6rem" }}>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center", marginBottom: "1rem" }}>
                {QUESTIONS.map((_, i) => {
                  const done = i < history.length;
                  const ok   = done && history[i];
                  const curr = i === qIdx;
                  return (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: ok ? "#22c55e" : done ? "#ef4444" : curr ? "#b91c1c" : "#e2e8f0",
                      boxShadow: curr ? "0 0 0 3px rgba(185,28,28,0.2)" : "none",
                      transition: "all 0.3s",
                    }} title={`Q${i+1}`} />
                  );
                })}
              </div>

              {/* Blood body */}
              <HumanBody pct={fillPct} />

              {/* Score label */}
              <div style={{ textAlign: "center", marginTop: "0.85rem" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: fillPct > 60 ? "#b91c1c" : "#94a3b8" }}>{fillPct}%</div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Eligibility</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.3rem" }}>Q{qIdx + 1} of 10</div>
              </div>
            </div>

            {/* Right: question card */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "20px", padding: "2rem", boxShadow: "0 8px 32px rgba(15,23,42,0.07)" }}>
              {/* Q header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "8px", background: "#fff1f2", display: "grid", placeItems: "center" }}>
                    <Droplets size={14} style={{ color: "#b91c1c" }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.08em" }}>Question {qIdx + 1} / 10</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Score: <strong style={{ color: "#0f172a" }}>{score}/{qIdx + (answered ? 1 : 0)}</strong></div>
              </div>

              {/* Question text */}
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
                {q.q}
              </h3>

              {/* Option buttons */}
              <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {q.options.map((opt, i) => {
                  const isChosen  = answered?.chosen === i;
                  const isCorrect = i === q.correct;
                  let bg = "#f8fafc", border = "#e2e8f0", color = "#334155";

                  if (answered !== null) {
                    if (isCorrect) { bg = "#f0fdf4"; border = "#86efac"; color = "#15803d"; }
                    else if (isChosen && !isCorrect) { bg = "#fef2f2"; border = "#fca5a5"; color = "#dc2626"; }
                  }

                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={answered !== null} style={{
                      background: bg, border: `1.5px solid ${border}`, color, borderRadius: "12px",
                      padding: "0.9rem 1.25rem", textAlign: "left", fontWeight: 600, fontSize: "0.88rem",
                      cursor: answered !== null ? "default" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem",
                      transition: "all 0.25s",
                      transform: (answered === null) ? "none" : "none",
                    }}
                      onMouseEnter={e => { if (answered === null) { e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.background = "#fff5f5"; } }}
                      onMouseLeave={e => { if (answered === null) { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; } }}
                    >
                      <span>{opt}</span>
                      {answered !== null && isCorrect && <CheckCircle2 size={18} style={{ color: "#16a34a", flexShrink: 0 }} />}
                      {answered !== null && isChosen && !isCorrect && <XCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>

              {/* Hint after answer */}
              {answered !== null && (
                <div style={{ background: answered.isCorrect ? "#f0fdf4" : "#fff7ed", border: `1px solid ${answered.isCorrect ? "#bbf7d0" : "#fed7aa"}`, borderRadius: "12px", padding: "1rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{answered.isCorrect ? "✅" : "💡"}</span>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: answered.isCorrect ? "#15803d" : "#c2410c", marginBottom: "0.25rem" }}>
                      {answered.isCorrect ? "Correct! +10% eligibility" : "Not quite — but here's why:"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: answered.isCorrect ? "#16a34a" : "#ea580c", lineHeight: 1.6 }}>{q.hint}</div>
                  </div>
                </div>
              )}

              {/* Next button */}
              {answered !== null && (
                <button onClick={handleNext} style={{ width: "100%", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.85rem", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 4px 16px rgba(185,28,28,0.3)", transition: "transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
                  {qIdx + 1 >= QUESTIONS.length ? "See My Result" : "Next Question"} <ChevronRight size={17} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "2rem", alignItems: "start", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "24px", padding: "2.5rem", boxShadow: "0 12px 48px rgba(15,23,42,0.1)" }}>
              {/* Body + score */}
              <div style={{ textAlign: "center" }}>
                <HumanBody pct={fillPct} />
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: tier.color }}>{fillPct}%</div>
                  <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Eligibility Score</div>
                </div>
              </div>

              {/* Result details */}
              <div>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{tier.emoji}</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: tier.color, margin: "0 0 0.5rem" }}>{tier.label}</h3>
                <div style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: "12px", padding: "1rem", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.88rem", color: tier.color, margin: 0, lineHeight: 1.6 }}>{tier.desc}</p>
                </div>

                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "0.6rem" }}>Your answers:</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1.5rem" }}>
                  {history.map((ok, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: ok ? "#15803d" : "#dc2626", background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`, borderRadius: "8px", padding: "0.4rem 0.6rem" }}>
                      {ok ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      Q{i + 1}: {ok ? "Eligible" : "Flagged"}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button onClick={restart} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.7rem 1.25rem", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    <RotateCcw size={14}/> Try Again
                  </button>
                  {fillPct >= 70 && (
                    <Link to="/become-donor" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", borderRadius: "10px", padding: "0.7rem 1.25rem", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(185,28,28,0.3)" }}>
                      <Award size={14}/> Register as Donor
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   STATIC CONTENT SECTIONS
════════════════════════════════════════ */
const PROBLEMS = [
  { icon: AlertCircle,   text: "Poor communication between hospitals and available donors", color: "#ef4444" },
  { icon: Activity,      text: "Manual, error-prone blood inventory record keeping", color: "#f59e0b" },
  { icon: Droplets,      text: "Difficulty finding specific blood groups during emergencies", color: "#ef4444" },
  { icon: MapPin,        text: "No way to identify or contact nearby available donors quickly", color: "#f59e0b" },
  { icon: CalendarClock, text: "Blood expiry tracking leading to avoidable wastage", color: "#ef4444" },
  { icon: Zap,           text: "Life-threatening delays in critical emergency situations", color: "#dc2626" },
];

const OBJECTIVES = [
  { icon: Target,         title: "Faster Discovery",    desc: "Instant blood group search with live availability from the hospital's digital inventory — no phone calls.", color: "#ef4444" },
  { icon: HeartHandshake, title: "Better Coordination", desc: "Bridge donors and hospitals through emergency workflows with GPS location and real-time alerts.", color: "#8b5cf6" },
  { icon: Database,       title: "Reliable Records",    desc: "Structured donor profiles, donation histories, hemoglobin reports, and inventory in one place.", color: "#10b981" },
];

const MODULES = [
  { label: "Hospital Admin Dashboard",  icon: Shield,        color: "#ef4444" },
  { label: "Donor Registration Portal", icon: Users,         color: "#8b5cf6" },
  { label: "Blood Inventory Manager",   icon: Database,      color: "#10b981" },
  { label: "Emergency Request System",  icon: Zap,           color: "#f59e0b" },
  { label: "GPS Location Support",      icon: MapPin,        color: "#06b6d4" },
  { label: "Expiry Tracking Module",    icon: CalendarClock, color: "#f97316" },
  { label: "Public Blood Search",       icon: Globe,         color: "#84cc16" },
  { label: "Donation History Logs",     icon: Activity,      color: "#ec4899" },
];

const FUTURE = [
  "Multi-hospital blood sharing network",
  "Automated SMS/push donor notifications",
  "AI-powered expiry and demand forecasting",
  "Mobile app for donor quick-response",
  "Integration with national blood bank registry",
  "Verified hemoglobin eligibility automation",
];



export default function About() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ background: "#fff" }}>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg,#fff 0%,#fff5f5 50%,#fff 100%)", padding: "4.5rem 0 3.5rem", borderBottom: "1px solid #f1f5f9", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, #f1f5f9 1px, transparent 0)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-80px", right: "8%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(185,28,28,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease", maxWidth: 700 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "999px", padding: "0.35rem 0.9rem", marginBottom: "1.25rem" }}>
              <Droplets size={13} style={{ color: "#b91c1c" }} />
              <span style={{ fontSize: "0.68rem", color: "#b91c1c", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>About the System</span>
            </div>
            <h1 style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
              Digital Blood Sync System
            </h1>
            <p style={{ fontSize: "1rem", color: "#64748b", lineHeight: 1.75, marginBottom: "1.5rem", maxWidth: 580 }}>
              A full-stack platform designed to modernize blood bank operations for Indian hospitals — connecting donors, inventory management and emergency coordination in one digital system.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.6rem 1rem", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
              <span style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>Designed for Indian hospital blood-bank workflow</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE QUIZ ── */}
      <BloodEligibilityQuiz />

      {/* ── PROBLEM STATEMENT ── */}
      <section style={{ padding: "5.5rem 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: "3.5rem", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Problem Statement</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 1rem", letterSpacing: "-0.025em" }}>What's Broken in Traditional Blood Banks</h2>
              <p style={{ color: "#64748b", lineHeight: 1.75, fontSize: "0.9rem", margin: 0 }}>
                Most hospital blood banks in India still rely on paper records, phone calls and manual donor tracking — causing critical delays when every minute matters.
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {PROBLEMS.map(({ icon: Icon, text, color }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.9rem 1.1rem", background: "#fff", border: "1px solid #f1f5f9", borderRadius: "12px", boxShadow: "0 2px 8px rgba(15,23,42,0.03)", transition: "border-color 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color + "44"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = ""; }}>
                  <div style={{ width: 36, height: 36, borderRadius: "9px", background: color + "15", border: `1px solid ${color}30`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ── */}
      <section style={{ padding: "5.5rem 0", background: "#0f172a", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Goals</div>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.025em" }}>System Objectives</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1.25rem" }}>
            {OBJECTIVES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "18px", padding: "2rem", transition: "background 0.2s, transform 0.2s, border-color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = color + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; }}>
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: color + "20", border: `1px solid ${color}40`, display: "grid", placeItems: "center", marginBottom: "1.25rem" }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: "0 0 0.6rem" }}>{title}</h3>
                <p style={{ fontSize: "0.84rem", color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES ── */}
      <section style={{ padding: "5.5rem 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Architecture</div>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.025em" }}>System Modules</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: "0.85rem" }}>
            {MODULES.map(({ label, icon: Icon, color }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: "14px", padding: "1.25rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color + "40"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#f1f5f9"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}>
                <div style={{ width: 38, height: 38, borderRadius: "11px", background: color + "15", border: `1px solid ${color}30`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#334155" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE SCOPE ── */}
      <section style={{ padding: "5.5rem 0", background: "#0f172a", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "3.5rem", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Roadmap</div>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.025em" }}>Future Scope</h2>
              <p style={{ color: "#94a3b8", lineHeight: 1.75, fontSize: "0.9rem" }}>
                Version 2.0 expands this into a production-ready platform with AI assistance, multi-hospital networking and real-time mobile notifications.
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {FUTURE.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "0.85rem 1rem", transition: "background 0.2s, border-color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                  <CheckCircle2 size={15} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem", color: "#e2e8f0" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "5rem 0", background: "#fff", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: 580 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#b91c1c", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.6rem" }}>Get Started</div>
          <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 0.85rem", letterSpacing: "-0.025em" }}>Ready to Use the System?</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Whether you're a donor wanting to save lives or a hospital admin managing inventory — start here.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/become-donor" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", border: "none", borderRadius: "12px", padding: "0.85rem 1.6rem", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", boxShadow: "0 8px 24px rgba(185,28,28,0.25)" }}>
              Become a Donor <ArrowRight size={16} />
            </Link>
            <Link to="/blood-availability" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.85rem 1.6rem", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              <Droplets size={16} style={{ color: "#dc2626" }} /> Check Blood Stock
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
