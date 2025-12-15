// Second.jsx
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Second.css";

export default function Second() {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState(""); // "", "loading", "success", "error"

  function openFileDialog() {
    fileRef.current?.click();
  }

  function onFile(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setStatus("error");
      setTimeout(() => setStatus(""), 2400);
      return;
    }

    // demo: show success then navigate after short time
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        // here you would upload and then navigate to chat page
        // example: navigate('/chat?fileUrl=...') — but we keep demo simple
      }, 900);
    }, 900);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave(e) {
    e.preventDefault();
    setDragOver(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    onFile({ dataTransfer: e.dataTransfer });
  }

  return (
    <section className="Second section-fade">
      {/* decorative blobs */}
      <div className="sec-bg">
        <div className="blob blob--left" />
        <div className="blob blob--right" />
      </div>

      <div className="sec-inner">
        <div className="sec-text">
          <h2 className="sec-title">
            Chat with a PDF — upload your notes and ask questions
          </h2>
          <p className="sec-sub">
            Drop a PDF here (or click the card). I’ll extract the pages and let
            you ask questions, summarize, or practice from the content.
          </p>

          <div className="features">
            <div className="feat">
              <strong>Instant Q&A</strong>
              <span>Ask the document — get answers fast</span>
            </div>
            <div className="feat">
              <strong>Private</strong>
              <span>Your PDF is processed securely — not public</span>
            </div>
            <div className="feat">
              <strong>Free & Paid</strong>
              <span>Works with free notes or paid uploads</span>
            </div>
          </div>
        </div>

        <div
          className={`upload-card ${dragOver ? "drag-over" : ""} ${
            status ? `state-${status}` : ""
          }`}
          onClick={openFileDialog}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openFileDialog();
          }}
          aria-label="Upload PDF to chat"
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={onFile}
            style={{ display: "none" }}
            aria-hidden
          />

          <div className="upload-inside">
            <svg  className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
            </svg>

            <div className="upload-title">Drop PDF here or click to upload</div>
            <div className="upload-sub">
              Supports single PDF — max size depends on backend
            </div>

            <div className="cta-row">
              <button
                className="btn btn-primary btn-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                type="button"
              >
                Upload & Chat
              </button>

              <Link
                to="/chat"
                className="btn btn-ghost"
                onClick={(e) => e.stopPropagation()}
              >
                Go to Chat
              </Link>
            </div>

            <div className="status-row">
              {status === "loading" && (
                <span className="status loading">Preparing…</span>
              )}
              {status === "success" && (
                <span className="status success">Ready — opening chat</span>
              )}
              {status === "error" && (
                <span className="status error">Only PDF files allowed</span>
              )}
            </div>
          </div>

          {/* floating badges */}
          <div className="badge badge-top">AI-chat</div>
          <div className="badge badge-right">Private</div>
        </div>
      </div>
    </section>
  );
}
