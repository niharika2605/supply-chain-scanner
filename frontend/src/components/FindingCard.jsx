const SEVERITY_STYLES = {
  high: { bg: "var(--severity-high-bg)", border: "var(--severity-high-border)", text: "var(--severity-high-text)" },
  medium: { bg: "var(--severity-medium-bg)", border: "var(--severity-medium-border)", text: "var(--severity-medium-text)" },
  low: { bg: "var(--severity-low-bg)", border: "var(--severity-low-border)", text: "var(--severity-low-text)" },
};

const TYPE_LABELS = {
  typosquat: "Typosquat",
  dependency_confusion: "Dependency Confusion",
};

function FindingCard({ finding }) {
  const s = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.low;

  return (
    <div
      style={{
        border: `1px solid ${s.border}`,
        backgroundColor: s.bg,
        borderRadius: "12px",
        padding: "18px 20px",
        marginBottom: "12px",
        boxShadow: "var(--shadow-sm)",
        animation: "fadeInUp 0.4s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontWeight: 700,
              color: s.text,
              textTransform: "uppercase",
              fontSize: "11px",
              letterSpacing: "0.06em",
              padding: "3px 9px",
              border: `1px solid ${s.border}`,
              borderRadius: "20px",
            }}
          >
            {finding.severity}
          </span>
          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
            {TYPE_LABELS[finding.type] || finding.type}
          </span>
        </div>
        <span style={{ fontWeight: 800, color: s.text, fontSize: "14px" }}>{finding.riskScore}/100</span>
      </div>

      <h3 style={{ margin: "0 0 8px 0", fontFamily: "var(--font-mono)", fontSize: "15px", color: "var(--text-primary)" }}>
        {finding.dependencyName}
      </h3>

      <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.55 }}>
        {finding.reason}
      </p>

      {finding.plainEnglishExplanation && (
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <strong style={{ color: "var(--text-primary)" }}>What this means: </strong>
          <span style={{ color: "var(--text-secondary)" }}>{finding.plainEnglishExplanation}</span>
        </div>
      )}

      {finding.remediationSteps && (
        <div style={{ marginTop: "8px", fontSize: "14px" }}>
          <strong style={{ color: "var(--text-primary)" }}>How to fix it: </strong>
          <span style={{ color: "var(--text-secondary)" }}>{finding.remediationSteps}</span>
        </div>
      )}

      {!finding.plainEnglishExplanation && (
        <p style={{ marginTop: "10px", fontStyle: "italic", color: "var(--text-muted)", fontSize: "12px" }}>
          AI explanation unavailable for this finding.
        </p>
      )}
    </div>
  );
}

export default FindingCard;