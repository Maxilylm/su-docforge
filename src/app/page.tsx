"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";

const SAMPLE_JSON = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "created_at": "2024-01-15T10:30:00Z",
  "is_active": true,
  "profile": {
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "Software developer"
  }
}`;

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [endpointInfo, setEndpointInfo] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview");

  const handleGenerate = useCallback(async () => {
    if (!jsonInput.trim()) {
      setError("Please paste a JSON response first.");
      return;
    }

    try {
      JSON.parse(jsonInput);
    } catch {
      setError("Invalid JSON. Please check your input.");
      return;
    }

    setLoading(true);
    setError("");
    setMarkdown("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonInput: jsonInput.trim(),
          endpointInfo: endpointInfo.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setMarkdown(data.markdown);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [jsonInput, endpointInfo]);

  const handleLoadSample = useCallback(() => {
    setJsonInput(SAMPLE_JSON);
    setEndpointInfo("GET /api/users/:id - Get user by ID");
  }, []);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdown);
  }, [markdown]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">DocForge</h1>
            <p className="text-xs text-zinc-500">
              AI API Documentation Generator
            </p>
          </div>
        </div>
        <button
          onClick={handleLoadSample}
          className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-md px-3 py-1.5 hover:bg-zinc-800 transition-colors"
        >
          Load Sample
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel - Input */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
            <h2 className="text-sm font-medium text-zinc-300">JSON Input</h2>
          </div>

          {/* Endpoint info */}
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
            <input
              type="text"
              placeholder="Endpoint info (optional) — e.g. GET /api/users/:id - Get user by ID"
              value={endpointInfo}
              onChange={(e) => setEndpointInfo(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* JSON textarea */}
          <div className="flex-1 p-4 min-h-0">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON API response here..."
              spellCheck={false}
              className="w-full h-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm font-mono text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Generate button */}
          <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
            {error && (
              <p className="text-red-400 text-xs mb-2">{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "Generating documentation..." : "Generate Docs"}
            </button>
          </div>
        </div>

        {/* Right panel - Output */}
        <div className="w-1/2 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-medium text-zinc-300">
              Documentation Output
            </h2>
            <div className="flex items-center gap-2">
              {markdown && (
                <button
                  onClick={handleCopyMarkdown}
                  className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-md px-2.5 py-1 hover:bg-zinc-800 transition-colors"
                >
                  Copy MD
                </button>
              )}
              <div className="flex bg-zinc-800 rounded-md">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    viewMode === "preview"
                      ? "bg-zinc-600 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("markdown")}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    viewMode === "markdown"
                      ? "bg-zinc-600 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 min-h-0">
            {!markdown && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                <svg
                  className="w-12 h-12 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm">
                  Paste JSON and click Generate to create docs
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-indigo-500 rounded-full animate-spin mb-3" />
                <p className="text-sm">Analyzing JSON and generating docs...</p>
              </div>
            )}

            {markdown && viewMode === "preview" && (
              <div className="prose-docs">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            )}

            {markdown && viewMode === "markdown" && (
              <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                {markdown}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
