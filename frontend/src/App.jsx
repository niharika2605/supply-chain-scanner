import { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import ScanInput from "./components/ScanInput";
import ResultsDashboard from "./components/ResultsDashboard";
import ScanHistory from "./components/ScanHistory";
import { scanPackageJson, getScanById } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [view, setView] = useState("scan");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      setUser({ email });
    }
    setCheckedAuth(true);
  }, []);

  function handleLogout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    setUser(null);
    setScanResult(null);
  }

  async function handleScan(content) {
    setIsLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      setScanResult(await scanPackageJson(content));
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectPastScan(scanId) {
    setIsLoading(true);
    setScanError(null);
    try {
      setScanResult(await getScanById(scanId));
      setView("scan");
    } catch (err) {
      setScanError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!checkedAuth) return null;

  if (!user) {
    return <AuthForm onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div style={{ minHeight: "100vh", maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "9px",
                backgroundColor: "var(--accent)",
                color: "var(--accent-ink)",
                fontFamily: "var(--font-mono)",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              &gt;_
            </div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Supply Chain Risk Scanner
            </h1>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "8px 0 0 44px", fontSize: "14px" }}>
            Detects typosquatting and dependency confusion risks in your npm dependencies.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              borderRadius: "7px",
              padding: "8px 14px",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <nav style={{ display: "flex", gap: "4px", margin: "28px 0 24px 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <TabButton active={view === "scan"} onClick={() => setView("scan")}>New Scan</TabButton>
        <TabButton active={view === "history"} onClick={() => setView("history")}>Past Scans</TabButton>
      </nav>

      {view === "scan" && (
        <>
          <ScanInput onScan={handleScan} isLoading={isLoading} />

          {scanError && (
            <div
              role="alert"
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--severity-high-bg)",
                border: "1px solid var(--severity-high-border)",
                color: "var(--severity-high-text)",
                fontSize: "14px",
              }}
            >
              {scanError}
            </div>
          )}

          {scanResult && <ResultsDashboard scanResult={scanResult} />}
        </>
      )}

      {view === "history" && <ScanHistory onSelectScan={handleSelectPastScan} />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: "10px 16px",
        fontSize: "14px",
        fontWeight: 600,
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        marginBottom: "-1px",
      }}
    >
      {children}
    </button>
  );
}

export default App;