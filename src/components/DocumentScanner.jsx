import { useRef, useState, useEffect, useCallback } from "react";

function calculateSharpness(imageData) {
  const data = imageData.data;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 16) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += gray;
    count++;
  }
  const avg = sum / count;
  let variance = 0;
  for (let i = 0; i < data.length; i += 16) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += (gray - avg) ** 2;
  }
  return Math.sqrt(variance / count);
}

export default function DocumentScanner({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureTimeoutRef = useRef(null);
  const capturedRef = useRef(false);
  const [status, setStatus] = useState("Point camera at document");
  const [borderColor, setBorderColor] = useState("#ef4444");
  const [streaming, setStreaming] = useState(false);

  const capture = useCallback(() => {
    if (capturedRef.current) return;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

    capturedRef.current = true;
    clearTimeout(captureTimeoutRef.current);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      capturedRef.current = false;
      setStatus("Could not capture the document. Please try again.");
      return;
    }
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
      else {
        capturedRef.current = false;
        setStatus("Could not capture the document. Please try again.");
      }
    }, "image/jpeg", 0.92);
  }, [onCapture]);

  const checkQuality = useCallback(() => {
    if (capturedRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = 320;
    canvas.height = 180;
    ctx.drawImage(video, 0, 0, 320, 180);
    const imageData = ctx.getImageData(0, 0, 320, 180);
    const score = calculateSharpness(imageData);

    if (score > 120) {
      setBorderColor("#22c55e");
      setStatus("Perfect — capturing…");
      if (!captureTimeoutRef.current) {
        captureTimeoutRef.current = setTimeout(capture, 600);
      }
    } else if (score > 60) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
      setBorderColor("#f59e0b");
      setStatus("Hold steady");
    } else {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
      setBorderColor("#ef4444");
      setStatus("Move closer / improve lighting");
    }
  }, [capture]);

  useEffect(() => {
    let stream;
    let cancelled = false;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setStatus("Camera unavailable. Please choose a document file instead.");
          return;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
        }
      } catch {
        if (!cancelled) {
          setStatus("Camera unavailable. Check permissions or choose a document file instead.");
        }
      }
    }
    start();
    return () => {
      cancelled = true;
      clearTimeout(captureTimeoutRef.current);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!streaming) return;
    const interval = setInterval(checkQuality, 400);
    return () => clearInterval(interval);
  }, [streaming, checkQuality]);

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.frame, borderColor }}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
      <p style={styles.status}>{status}</p>
      <div>
        <button type="button" onClick={capture} disabled={!streaming} style={styles.manual}>
          Capture manually
        </button>
        <button type="button" onClick={onCancel} style={styles.cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { textAlign: "center" },
  frame: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    border: "4px solid",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  video: { width: "100%", display: "block" },
  status: { marginTop: 12, fontWeight: 600, color: "#0F172A" },
  manual: {
    marginTop: 12,
    padding: "10px 20px",
    background: "#0F172A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  cancel: {
    marginTop: 12,
    marginLeft: 8,
    padding: "10px 20px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#0f172a",
    cursor: "pointer",
  },
};