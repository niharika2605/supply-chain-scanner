import FindingCard from "./FindingCard";

function ResultsDashboard({ scanResult }) {
  const { projectName, totalDependencies, totalFindings, overallRiskScore, findings } = scanResult;
  const isClean = totalFindings === 0;

  return (
    <div style={{ marginTop: "24px", animation: "fadeInUp 0.4s ease" }}>
      <div
        style={{
          padding: "22px 24px",
          borderRadius: "14px",
          backgroundColor: isClean ? "var(--success-bg)" : "var(--bg-surface)",
          border: `1px solid ${isClean ? "var(--success-border)" : "var(--border-subtle)"}`,
          marginBottom: "18px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontFamily: "var(--font-mono)", fontSize: "17px" }}>
              {projectName}
            </h2>
            {isClean ? (
              <p style={{ margin: 0, color: "var(--success-text)", fontSize: "14px", fontWeight: 500 }}>
                ✓ No supply chain risks detected
              </p>
            ) : (
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px" }}>
                {totalFindings} issue{totalFindings !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
          <RiskBadge score={overallRiskScore} />
        </div>

        <div style={{ display: "flex", gap: "24px", fontSize: "13px", color: "var(--text-secondary)", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
          <Stat label="Dependencies" value={totalDependencies} />
          <Stat label="Findings" value={totalFindings} />
        </div>
      </div>

      {findings.map((finding, index) => (
        <FindingCard key={`${finding.dependencyName}-${index}`} finding={finding} />
      ))}
    </div>
  );
}

function RiskBadge({ score }) {
  let color = "var(--success-text)";
  let bg = "var(--success-bg)";
  let border = "var(--success-border)";
  if (score >= 70) {
    color = "var(--severity-high-text)";
    bg = "var(--severity-high-bg)";
    border = "var(--severity-high-border)";
  } else if (score >= 30) {
    color = "var(--severity-medium-text)";
    bg = "var(--severity-medium-bg)";
    border = "var(--severity-medium-border)";
  }
  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: "10px",
        padding: "8px 16px",
        textAlign: "center",
        minWidth: "84px",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 800, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em", marginTop: "2px" }}>RISK SCORE</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <span>
      <span style={{ color: "var(--text-muted)" }}>{label}: </span>
      <strong style={{ color: "var(--text-primary)" }}>{value}</strong>
    </span>
  );
}

export default ResultsDashboard;