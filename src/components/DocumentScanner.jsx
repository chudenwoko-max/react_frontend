import { useRef, useState, useEffect, useCallback } from "react";

function laplacianVariance(imageData) {
  const d = imageData.data;
  const w = imageData.width;
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < imageData.height - 1; y += 2) {
    for (let x = 1; x < w - 1; x += 2) {
      const i = (y * w + x) * 4;
      const gray = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const lap =
        -4 * gray +
        (d[((y - 1) * w + x) * 4] + d[((y + 1) * w + x) * 4] +
         d[(y * w + x - 1) * 4] + d[(y * w + x + 1) * 4]) / 3;
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  const mean = sum / n;
  return sumSq / n - mean * mean;
}

function countEdges(imageData) {
  const d = imageData.data;
  const w = imageData.width;
  let edges = 0;
  for (let i = 0; i < d.length - w * 4; i += 16) {
    const g1 = (d[i] + d[i + 1] + d[i + 2]) / 3;
    const g2 = (d[i + w * 4] + d[i + w * 4 + 1] + d[i + w * 4 + 2]) / 3;
    if (Math.abs(g1 - g2) > 30) edges++;
  }
  return edges;
}

function averageBrightness(imageData) {
  const d = imageData.data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 16) sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
  return sum / (d.length / 16);
}

export default function DocumentScanner({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Point camera at document");
  const [borderColor, setBorderColor] = useState("#ef4444");
  const [streaming, setStreaming] = useState(false);
  const capturing = useRef(false);

  const doCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => onCapture(blob), "image/jpeg", 0.92);
  }, [onCapture]);

  const analyse = useCallback(() => {
    if (capturing.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = 320;
    canvas.height = 180;
    ctx.drawImage(video, 0, 0, 320, 180);
    const imageData = ctx.getImageData(0, 0, 320, 180);

    const sharpness = laplacianVariance(imageData);
    const edges = countEdges(imageData);
    const brightness = averageBrightness(imageData);

    let score = 0;
    if (sharpness > 80) score += 40;
    if (edges > 1200) score += 30;
    if (brightness > 40 && brightness < 200) score += 30;

    if (score >= 80) {
      setBorderColor("#22c55e");
      setStatus("Document clear — capturing…");
      capturing.current = true;
      setTimeout(doCapture, 500);
    } else if (score >= 50) {
      setBorderColor("#f59e0b");
      setStatus("Hold steady and fill the frame");
    } else {
      setBorderColor("#ef4444");
      setStatus("Move closer, improve light, or straighten");
    }
  }, [doCapture]);

  useEffect(() => {
    let stream;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreaming(true);
        }
      } catch {
        setStatus("Camera permission denied");
      }
    }
    start();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (!streaming) return;
    const id = setInterval(analyse, 350);
    return () => clearInterval(id);
  }, [streaming, analyse]);

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.frame, borderColor }}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <canvas ref={canvasRef} hidden />
      </div>
      <p style={styles.status}>{status}</p>
      <div style={styles.actions}>
        <button type="button" onClick={doCapture} style={styles.btn}>
          Capture manually
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.secondary}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { textAlign: "center", padding: 16 },
  frame: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    border: "5px solid",
    borderRadius: 20,
    overflow: "hidden",
  },
  video: { width: "100%", display: "block" },
  status: { margin: "12px 0", fontWeight: 600 },
  actions: { display: "flex", gap: 12, justifyContent: "center" },
  btn: {
    padding: "10px 24px",
    background: "#0F172A",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  secondary: {
    padding: "10px 24px",
    background: "#fff",
    color: "#0F172A",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    cursor: "pointer",
  },
};