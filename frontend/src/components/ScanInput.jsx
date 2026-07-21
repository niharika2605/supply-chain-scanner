import { useState } from "react";

function ScanInput({ onScan, isLoading }) {
  const [pastedContent, setPastedContent] = useState("");
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  function loadFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPastedContent(e.target.result);
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsText(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!pastedContent.trim()) {
      setError("Paste your package.json content or upload a file first.");
      return;
    }
    try {
      JSON.parse(pastedContent);
    } catch {
      setError("This doesn't look like valid JSON. Check for missing quotes or brackets.");
      return;
    }
    onScan(pastedContent);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "14px",
        padding: "24px",
        boxShadow: "var(--shadow-md)",
        animation: "fadeInUp 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <label htmlFor="package-json-input" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
          Paste your package.json
        </label>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          JSON
        </span>
      </div>

      <textarea
        id="package-json-input"
        rows={11}
        value={pastedContent}
        onChange={(e) => {
          setPastedContent(e.target.value);
          setFileName(null);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          loadFile(e.dataTransfer.files[0]);
        }}
        placeholder='{"name": "my-project", "dependencies": { ... } }'
        style={{
          width: "100%",
          backgroundColor: "var(--bg-base)",
          border: `1.5px dashed ${isDragging ? "var(--accent)" : "var(--border-subtle)"}`,
          borderRadius: "10px",
          color: "var(--text-primary)",
          padding: "14px",
          fontSize: "13px",
          resize: "vertical",
          lineHeight: 1.5,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
        <label
          htmlFor="package-json-file"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--accent)",
            border: "1px solid var(--border-subtle)",
            padding: "8px 14px",
            borderRadius: "7px",
            backgroundColor: "var(--bg-base)",
          }}
        >
          Upload file
        </label>
        <input
          id="package-json-file"
          type="file"
          accept=".json"
          onChange={(e) => loadFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        <span style={{ fontSize: "12px", color: fileName ? "var(--accent)" : "var(--text-muted)" }}>
          {fileName || "or drag & drop above · no file chosen"}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: "var(--severity-high-bg)",
            border: "1px solid var(--severity-high-border)",
            color: "var(--severity-high-text)",
            fontSize: "13px",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "14px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--accent-ink)",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: 700,
          boxShadow: "var(--shadow-sm)",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {isLoading && (
          <span
            style={{
              width: "13px",
              height: "13px",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        )}
        {isLoading ? "Scanning…" : "Scan for risks"}
      </button>
    </form>
  );
}

export default ScanInput;