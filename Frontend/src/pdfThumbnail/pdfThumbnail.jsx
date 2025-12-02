// PdfThumbnail.jsx
import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
// Vite / modern bundlers: import worker as URL
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PdfThumbnail({ pdfUrl, className, alt }) {
  const [thumbSrc, setThumbSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const load = async () => {
      try {
        setError(null);
        setThumbSrc(null);

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        const page = await pdf.getPage(1); // first page
        const viewport = page.getViewport({ scale: 1.2 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) {
          const dataUrl = canvas.toDataURL("image/png");
          setThumbSrc(dataUrl);
        }
      } catch (e) {
        console.error("Failed to render PDF thumbnail", e);
        if (!cancelled) setError(e);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  if (error) {
    // fallback if rendering fails
    return (
      <img
        src="/placeholder-thumbnail.png"
        alt={alt}
        className={className}
      />
    );
  }

  if (!thumbSrc) {
    // loading skeleton / spinner
    return <div className={`pdf-thumb-skeleton ${className || ""}`} />;
  }

  return <img src={thumbSrc} alt={alt} className={className} />;
}

export default PdfThumbnail;
