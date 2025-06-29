import { useState } from "react";
import "./App.css";
import { tokenizeJavaScript } from "./lexer";

function App() {
  const [code, setCode] = useState("// JavaScript code");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showTokens, setShowTokens] = useState(false);
  const [tokens, setTokens] = useState([]);

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCode = () => {
    setCode("// Paste your JavaScript code here");
    setResults(null);
    setError(null);
    setShowTokens(false);
    setTokens([]);
  };

  const handleTokenize = () => {
    try {
      setTokens(tokenizeJavaScript(code));
      setShowTokens(true);
    } catch (e) {
      setTokens([{ type: "error", value: e.message }]);
      setShowTokens(true);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      setResults(null);
      setShowTokens(false);
      setTokens([]);
    };
    reader.readAsText(file);
  };

  const renderResults = () => {
    if (!results) return null;

    const categories = {
      security: { title: "Security Vulnerabilities", issues: [], icon: "🔒" },
      errors: { title: "Coding Errors", issues: [], icon: "⚠️" },
      performance: { title: "Performance Issues", issues: [], icon: "⚡" },
      style: { title: "Style Violations", issues: [], icon: "✨" },
      complexity: { title: "Complexity Warnings", issues: [], icon: "🔄" },
      api: { title: "Insecure API Usage", issues: [], icon: "📡" },
    };

    results.issues?.forEach((issue) => {
      const category = issue.type || issue.category || "errors";
      if (categories[category]) {
        categories[category].issues.push(issue);
      } else {
        categories.errors.issues.push(issue);
      }
    });

    return (
      <div className={`results-container ${darkMode ? "dark" : ""}`}>
        <h2 className="results-header">
          <span className="results-icon">📊</span> Analysis Results
        </h2>

        {results.issues?.length === 0 ? (
          <div className="no-issues-card">
            <div className="success-icon">✅</div>
            <h3>All Clear!</h3>
            <p>No issues found. Your code looks good!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {Object.entries(categories).map(
              ([key, { title, issues, icon }]) =>
                issues.length > 0 && (
                  <div key={key} className="result-category-card">
                    <h3 className="category-header">
                      <span className="category-icon">{icon}</span>
                      {title}
                      <span className="issue-count">{issues.length}</span>
                    </h3>
                    <ul className="issues-list">
                      {issues.map((issue, index) => (
                        <li
                          key={index}
                          className={`issue-item severity-${
                            issue.severity || "medium"
                          }`}
                        >
                          <div className="issue-badge">
                            {getSeverityIcon(issue.severity)}
                          </div>
                          <div className="issue-content">
                            <div className="issue-message">{issue.message}</div>
                            {issue.rule && (
                              <div className="issue-rule">
                                Rule: {issue.rule}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    );
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "🟡";
    }
  };

  return (
    <div className={`jsguard-app ${darkMode ? "dark-mode" : ""}`}>
      <header className="app-header">
        <div className="logo-container">
          <div className="logo">
            JS<span>Guard</span>
          </div>
        </div>
        <h1>JavaScript Security Scanner</h1>
        <div className="theme-toggle">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-button"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main className="app-main" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="code-panel" style={{ width: "100%" }}>
          <div className="code-header">
            <h2>
              <span className="code-icon">📝</span> Source Code
            </h2>
            <div className="code-actions">
              <button className="action-button clear" onClick={clearCode}>
                <span className="button-icon">🗑️</span> Clear
              </button>
              <button
                className="action-button copy"
                onClick={() => navigator.clipboard.writeText(code)}
                title="Copy code to clipboard"
              >
                <span className="button-icon">📋</span> Copy
              </button>
              <input
                type="file"
                accept=".js"
                style={{ display: "none" }}
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload" className="action-button upload">
                <span className="button-icon">📂</span> Upload
              </label>
            </div>
          </div>
          <div className="editor-container">
            <textarea
              className={`code-editor ${darkMode ? "dark-editor" : ""}`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              rows="15"
              placeholder="Paste your JavaScript code here"
              style={{ width: "100%" }}
            />
          </div>
          <div className="code-submit" style={{ marginTop: "1rem" }}>
            <button
              className={`analyze-button tokenize-button`}
              onClick={handleTokenize}
              disabled={loading}
              style={{ marginRight: "1rem" }}
            >
              <span className="button-icon">🔤</span> Tokenize
            </button>
            <button
              className={`analyze-button ${loading ? "loading" : ""}`}
              onClick={analyzeCode}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Analyzing...
                </>
              ) : (
                <>
                  <span className="button-icon">🔍</span> Analyze Code
                </>
              )}
            </button>
          </div>
          {showTokens && (
            <div
              className="tokens-output"
              style={{
                background: "#16161a",
                borderRadius: "4px",
                padding: "0.5rem",
                marginTop: "1rem",
                fontSize: "0.95rem",
                color: "#eebbc3",
                maxHeight: "350px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Tokens
                <button
                  onClick={() => setShowTokens(false)}
                  style={{
                    float: "right",
                    background: "none",
                    border: "none",
                    color: "#eebbc3",
                    fontSize: "1.2em",
                    cursor: "pointer",
                  }}
                  title="Close"
                >
                  ✖
                </button>
              </h3>
              <pre style={{ margin: 0 }}>
                {tokens.length === 0
                  ? "No tokens yet."
                  : tokens
                      .map((tok, i) =>
                        typeof tok === "string"
                          ? tok
                          : JSON.stringify(tok, null, 2)
                      )
                      .join("\n")}
              </pre>
            </div>
          )}
        </div>
      </main>

      <div className="">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Analyzing your code...</p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <div className="error-icon">❌</div>
            <h3>Error Occurred</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && results && renderResults()}
      </div>
    </div>
  );
}

export default App;