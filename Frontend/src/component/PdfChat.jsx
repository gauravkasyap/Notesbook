import { useState, useRef, useEffect } from "react";
import "./PdfChat.css";

const PORT = 5000;

export default function PdfChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function uploadPdf() {
    if (!pdfFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    await fetch(`http://localhost:${PORT}/api/pdf/upload`, {
      method: "POST",
      body: formData,
    });

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "📂 PDF uploaded successfully! Ask anything." },
    ]);

    setLoading(false);
  }

  async function sendMessage() {
    if (!input) return;

    const msg = input;
    setInput("");

    setMessages((prev) => [...prev, { sender: "me", text: msg }]);
    setThinking(true);

    const res = await fetch(`http://localhost:${PORT}/api/pdf/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();

    setThinking(false);

    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
  }

  return (
    <div className="chat-container fade-slide">

      <h2 className="title">🤖 AI PDF Assistant</h2>

      <div className="upload-row">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
        <button
          className="upload-btn"
          disabled={!pdfFile || loading}
          onClick={uploadPdf}
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.sender}`}>
            {m.text}
          </div>
        ))}

        {thinking && <div className="typing">AI typing...</div>}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your PDF..."
        />
        <button onClick={sendMessage} className="send-btn">Send ➤</button>
      </div>

    </div>
  );
}
