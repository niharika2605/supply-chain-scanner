import { useState } from "react";
import { loginUser, registerUser } from "../services/api";

const CODE_LINES = [
  { indent: 0, text: "const scanner = require('supply-chain-risk');" },
  { indent: 0, text: "" },
  { indent: 0, text: "async function scanDependencies(pkg) {" },
  { indent: 1, text: "const findings = [];" },
  { indent: 1, text: "" },
  { indent: 1, text: "for (const dep of pkg.dependencies) {" },
  { indent: 2, text: "const risk = await detectTyposquat(dep);" },
  { indent: 2, text: "if (risk.score > 0) {" },
  { indent: 3, text: "findings.push(risk);" },
  { indent: 2, text: "}" },
  { indent: 1, text: "}" },
  { indent: 1, text: "" },
  { indent: 1, text: "return {" },
  { indent: 2, text: "totalFindings: findings.length," },
  { indent: 2, text: "riskScore: calculateRisk(findings)," },
  { indent: 1, text: "};" },
  { indent: 0, text: "}" },
];

function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result =
        mode === "login" ? await loginUser(email, password) : await registerUser(email, password);
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("userEmail", result.user.email);
      onAuthSuccess(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#0a0e14",
        fontFamily: "var(--font-sans, -apple-system, sans-serif)",
      }}
    >
      {/* LEFT PANEL — decorative code background */}
      <div
        style={{
          flex: "1 1 55%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          padding: "60px",
          background:
            "linear-gradient(135deg, #0a0e14 0%, #0d1420 50%, #0a0e14 100%)",
        }}
        className="auth-left-panel"
      >
        {/* subtle glow accents */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,191,0.10), transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,38,38,0.08), transparent 70%)",
            filter: "blur(10px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "0",
              backdropFilter: "blur(6px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "7px",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#dc2626" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#d97706" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#16a34a" }} />
              <span style={{ marginLeft: "10px", fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono, monospace)" }}>
                scanner.js
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: "22px 24px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "13px",
                lineHeight: 1.85,
                color: "rgba(255,255,255,0.55)",
                overflowX: "auto",
              }}
            >
              {CODE_LINES.map((line, i) => (
                <div key={i} style={{ paddingLeft: `${line.indent * 20}px`, whiteSpace: "pre" }}>
                  {line.text ? (
                    <SyntaxHighlight text={line.text} />
                  ) : (
                    "\u00A0"
                  )}
                </div>
              ))}
            </pre>
          </div>

          <div style={{ marginTop: "36px", maxWidth: "420px" }}>
            <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 700, margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>
              Ship dependencies with confidence.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Automated typosquat and dependency confusion detection for your npm packages, backed by real risk scoring.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — login/register form */}
      <div
        style={{
          flex: "1 1 45%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          backgroundColor: "#0d1117",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2dd4bf, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                color: "#0a0e14",
                fontSize: "16px",
              }}
            >
              &gt;_
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>RiskScan</span>
          </div>

          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: 800, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", margin: "0 0 32px 0" }}>
            {mode === "login" ? "Log in to view your scan history." : "Start scanning your dependencies for free."}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  backgroundColor: "rgba(220,38,38,0.1)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  color: "#fca5a5",
                  fontSize: "13px",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "18px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #2dd4bf, #0ea5e9)",
                color: "#0a0e14",
                border: "none",
                borderRadius: "8px",
                padding: "13px",
                fontSize: "14px",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(45,212,191,0.25)",
              }}
            >
              {isLoading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "24px", textAlign: "center" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#2dd4bf",
                fontWeight: 700,
                padding: 0,
                cursor: "pointer",
              }}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .auth-left-panel { display: none; }
        }
      `}</style>
    </div>
  );
}

function SyntaxHighlight({ text }) {
  // Very lightweight keyword coloring for visual flavor only — not a real parser
  const keywords = ["const", "async", "function", "await", "for", "of", "if", "return"];
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        const clean = part.trim();
        if (keywords.includes(clean)) {
          return (
            <span key={i} style={{ color: "#c084fc" }}>
              {part}
            </span>
          );
        }
        if (/^['"].*['"];?,?$/.test(clean)) {
          return (
            <span key={i} style={{ color: "#86efac" }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.5)",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontSize: "14px",
};

export default AuthForm;