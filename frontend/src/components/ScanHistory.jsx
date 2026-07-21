import { useState, useEffect } from "react";
import { getScanHistory } from "../services/api";

function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setIsLoading(true);
    setError(null);
    try {
      setScans(await getScanHistory());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading scan history…</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert" style={{ color: "var(--severity-high-text)", fontSize: "14px" }}>{error}</p>
        <button
          onClick={loadHistory}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px",
          color: "var(--text-secondary)",
          border: "1.5px dashed var(--border-subtle)",
          borderRadius: "14px",
          fontSize: "14px",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        No scans yet. Run your first scan to see it here.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        animation: "fadeInUp 0.4s ease",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ textAlign: "left", backgroundColor: "var(--bg-base)" }}>
            {["Project", "Scanned", "Deps", "Findings", "Risk"].map((h) => (
              <th key={h} style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr
              key={scan._id}
              onClick={() => onSelectScan(scan._id)}
              style={{ cursor: "pointer", borderTop: "1px solid var(--border-subtle)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: 500 }}>
                {scan.projectName}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                {new Date(scan.scannedAt).toLocaleString()}
              </td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{scan.totalDependencies}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{scan.totalFindings}</td>
              <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-primary)" }}>
                {scan.overallRiskScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScanHistory;