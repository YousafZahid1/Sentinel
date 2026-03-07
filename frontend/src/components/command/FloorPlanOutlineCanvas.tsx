import { useEffect, useRef, useState } from "react";

/**
 * Sobel-like edge detection on grayscale ImageData (uses R channel).
 */
function edgeDetect(
  src: ImageData,
  dst: ImageData,
  width: number,
  height: number,
  threshold: number
): void {
  const w = width;
  const h = height;
  const data = src.data;
  const out = dst.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const gx =
        -data[((y - 1) * w + x - 1) * 4] +
        data[((y - 1) * w + x + 1) * 4] +
        -2 * data[(y * w + x - 1) * 4] +
        2 * data[(y * w + x + 1) * 4] +
        -data[((y + 1) * w + x - 1) * 4] +
        data[((y + 1) * w + x + 1) * 4];
      const gy =
        -data[((y - 1) * w + x - 1) * 4] -
        2 * data[((y - 1) * w + x) * 4] -
        data[((y - 1) * w + x + 1) * 4] +
        data[((y + 1) * w + x - 1) * 4] +
        2 * data[((y + 1) * w + x) * 4] +
        data[((y + 1) * w + x + 1) * 4];
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      const v = mag >= threshold ? 255 : 0;
      out[i] = out[i + 1] = out[i + 2] = v;
      out[i + 3] = 255;
    }
  }
}

function grayscale(data: ImageData): void {
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = g;
  }
}

function contrast(data: ImageData, factor: number, mid: number = 128): void {
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i];
    d[i] = d[i + 1] = d[i + 2] = Math.max(
      0,
      Math.min(255, mid + (v - mid) * factor)
    );
  }
}

const WHITE_R = 255;
const WHITE_G = 255;
const WHITE_B = 255;

interface FloorPlanOutlineCanvasProps {
  imageSrc: string;
  className?: string;
}

export default function FloorPlanOutlineCanvas({
  imageSrc,
  className = "",
}: FloorPlanOutlineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    const draw = () => {
      if (!container || !canvas) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;

      const workSize = 400;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const off = document.createElement("canvas");
      off.width = workSize;
      off.height = workSize;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, workSize, workSize);
      const srcData = offCtx.getImageData(0, 0, workSize, workSize);
      grayscale(srcData);
      contrast(srcData, 2.2, 110);
      offCtx.putImageData(srcData, 0, 0);

      ctx.fillStyle = "hsl(220, 20%, 4%)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.25;
      ctx.drawImage(off, 0, 0, workSize, workSize, 0, 0, w, h);
      ctx.globalAlpha = 1;

      const baseData = ctx.getImageData(0, 0, w, h);
      const edgeData = offCtx.createImageData(workSize, workSize);
      edgeDetect(srcData, edgeData, workSize, workSize, 18);
      offCtx.putImageData(edgeData, 0, 0);
      ctx.drawImage(off, 0, 0, workSize, workSize, 0, 0, w, h);
      const edgeScreen = ctx.getImageData(0, 0, w, h);
      const ed = edgeScreen.data;
      const bd = baseData.data;
      for (let i = 0; i < ed.length; i += 4) {
        if (ed[i] > 180) {
          bd[i] = WHITE_R;
          bd[i + 1] = WHITE_G;
          bd[i + 2] = WHITE_B;
          bd[i + 3] = 255;
        }
      }
      ctx.putImageData(baseData, 0, 0);

      setReady(true);
    };

    img.onload = () => {
      draw();
      const ro = new ResizeObserver(draw);
      ro.observe(container);
      return () => ro.disconnect();
    };
    img.onerror = () => setReady(false);
    img.src = imageSrc;

    return () => {
      img.src = "";
    };
  }, [imageSrc]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
