import { useEffect, useMemo, useRef, useState } from "react";
import Tesseract from "tesseract.js";

type OcrLine = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  confidence?: number;
};

function normalizeWord(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function keyForImage(imageSrc: string): string {
  // cheap stable key for data URLs; avoids hashing large strings
  return `sentinel.floorPlan.ocr:${imageSrc.slice(0, 48)}:${imageSrc.length}`;
}

interface FloorPlanTextOverlayProps {
  imageSrc: string;
}

export default function FloorPlanTextOverlay({ imageSrc }: FloorPlanTextOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<OcrLine[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [imageSize, setImageSize] = useState<{ w: number; h: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  const cacheKey = useMemo(() => keyForImage(imageSrc), [imageSrc]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { lines: OcrLine[]; imageSize?: { w: number; h: number } };
          if (!cancelled) {
            setLines(parsed.lines ?? []);
            if (parsed.imageSize) setImageSize(parsed.imageSize);
            setStatus("ready");
          }
          return;
        }

        const result = await Tesseract.recognize(imageSrc, "eng", {
          logger: () => {},
        });

        const imageSizeFromOcr =
          (result.data as any)?.imageSize?.width && (result.data as any)?.imageSize?.height
            ? { w: (result.data as any).imageSize.width as number, h: (result.data as any).imageSize.height as number }
            : null;

        const rawLines: OcrLine[] = (result.data.lines ?? [])
          .map((l) => ({
            text: normalizeWord(l.text ?? ""),
            bbox: { x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 },
            confidence: l.confidence,
          }))
          .filter((l) => l.text.length >= 3)
          .filter((l) => (l.confidence ?? 0) >= 60);

        // De-duplicate near-identical lines at same position.
        const deduped: OcrLine[] = [];
        for (const l of rawLines) {
          const match = deduped.find((d) => {
            const dx = Math.abs(d.bbox.x0 - l.bbox.x0) + Math.abs(d.bbox.y0 - l.bbox.y0);
            return dx < 8 && d.text.toLowerCase() === l.text.toLowerCase();
          });
          if (!match) deduped.push(l);
        }

        try {
          localStorage.setItem(cacheKey, JSON.stringify({ lines: deduped, imageSize: imageSizeFromOcr }));
        } catch {
          // ignore storage errors
        }

        if (!cancelled) {
          setLines(deduped);
          if (imageSizeFromOcr) setImageSize(imageSizeFromOcr);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, imageSrc]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Ensure we have the true image size for correct contain mapping.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
      img.src = "";
    };
  }, [imageSrc]);

  const contain = useMemo(() => {
    if (!imageSize || !containerSize) return null;
    const scale = Math.min(containerSize.w / imageSize.w, containerSize.h / imageSize.h);
    const drawW = imageSize.w * scale;
    const drawH = imageSize.h * scale;
    const offsetX = (containerSize.w - drawW) / 2;
    const offsetY = (containerSize.h - drawH) / 2;
    return { scale, offsetX, offsetY };
  }, [containerSize, imageSize]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {status === "loading" && (
        <div className="absolute bottom-2 left-2 bg-mc-surface/90 border border-mc-panel-border px-2 py-1">
          <span className="font-mono text-[8px] text-muted-foreground">Extracting labels…</span>
        </div>
      )}

      {status === "ready" &&
        contain &&
        imageSize &&
        lines.map((l, idx) => {
          const pad = 4;
          const sx = Math.max(0, l.bbox.x0 - pad);
          const sy = Math.max(0, l.bbox.y0 - pad);
          const sw = Math.min(imageSize.w - sx, l.bbox.x1 - l.bbox.x0 + pad * 2);
          const sh = Math.min(imageSize.h - sy, l.bbox.y1 - l.bbox.y0 + pad * 2);

          const dx = contain.offsetX + sx * contain.scale;
          const dy = contain.offsetY + sy * contain.scale;
          const dw = sw * contain.scale;
          const dh = sh * contain.scale;

          return (
            <div
              key={`${idx}-${l.text}`}
              className="absolute rounded-sm overflow-hidden"
              style={{
                left: `${dx}px`,
                top: `${dy}px`,
                width: `${dw}px`,
                height: `${dh}px`,
                backgroundImage: `url(${imageSrc})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${imageSize.w * contain.scale}px ${imageSize.h * contain.scale}px`,
                backgroundPosition: `${-sx * contain.scale}px ${-sy * contain.scale}px`,
                boxShadow: "0 0 8px rgba(0,0,0,0.9)",
              }}
            />
          );
        })}
    </div>
  );
}

