"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CameraSource, DetectedObject } from "@/lib/agent/types";

const BADGE = "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

export function CameraPanel({
  source,
  onSourceChange,
  detections,
  selectedId,
  onSelect,
  onDetect,
  detecting,
  detectError,
}: {
  source: CameraSource;
  onSourceChange: (source: CameraSource) => void;
  detections: DetectedObject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Called with the current frame as a JPEG blob. */
  onDetect: (frame: Blob) => void;
  detecting: boolean;
  detectError: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const uploadedBlobRef = useRef<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopWebcam, [stopWebcam]);

  const startWebcam = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
      uploadedBlobRef.current = null;
      onSourceChange("webcam");
      // the <video> element mounts on the next render
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch (err) {
      setCameraError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera permission denied — allow camera access or upload a test image."
          : "Could not open a camera — upload a test image instead."
      );
      onSourceChange("none");
    }
  }, [onSourceChange, uploadedUrl]);

  const handleUpload = useCallback(
    (file: File) => {
      stopWebcam();
      if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(URL.createObjectURL(file));
      uploadedBlobRef.current = file;
      setCameraError(null);
      onSourceChange("uploaded-image");
    },
    [stopWebcam, uploadedUrl, onSourceChange]
  );

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (source === "uploaded-image") return uploadedBlobRef.current;
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  }, [source]);

  const refreshDetection = useCallback(async () => {
    const frame = await captureFrame();
    if (frame) onDetect(frame);
  }, [captureFrame, onDetect]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${BADGE} ${
            source !== "none" ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
          }`}
        >
          Camera {source !== "none" ? "Connected" : "Disconnected"}
        </span>
        <span className={`${BADGE} bg-white/10 text-white/60`}>RGB Only — Depth Unavailable</span>
        {source === "uploaded-image" && (
          <span className={`${BADGE} bg-amber-500/15 text-amber-300`}>Demo Mode — Robot execution is disabled</span>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/50">
        {source === "webcam" ? (
          <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-contain" />
        ) : uploadedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={uploadedUrl} alt="Uploaded test scene" className="aspect-video w-full object-contain" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-sm text-white/30">
            No camera — start the webcam or upload a test image
          </div>
        )}

        {/* Detection overlay (normalized boxes) */}
        {source !== "none" &&
          detections.map(
            (d) =>
              d.box && (
                <button
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  title={`${d.id} (${(d.confidence * 100).toFixed(0)}%)`}
                  className={`absolute border-2 transition-colors ${
                    selectedId === d.id
                      ? "border-emerald-400 bg-emerald-400/10"
                      : "border-cyan-400/70 hover:border-cyan-300"
                  }`}
                  style={{
                    left: `${d.box.x * 100}%`,
                    top: `${d.box.y * 100}%`,
                    width: `${d.box.w * 100}%`,
                    height: `${d.box.h * 100}%`,
                  }}
                >
                  <span
                    className={`absolute -top-5 left-0 whitespace-nowrap px-1 font-mono text-[10px] ${
                      selectedId === d.id ? "bg-emerald-400 text-black" : "bg-cyan-400/90 text-black"
                    }`}
                  >
                    {d.id} {(d.confidence * 100).toFixed(0)}%
                  </span>
                </button>
              )
          )}
      </div>

      {cameraError && <p className="text-xs text-amber-300">{cameraError}</p>}
      {detectError && <p className="text-xs text-red-300">{detectError}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => void startWebcam()}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-cyan-400/50 hover:text-cyan-300"
        >
          {source === "webcam" ? "Restart camera" : "Start camera"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-cyan-400/50 hover:text-cyan-300"
        >
          Upload Test Image
        </button>
        <button
          onClick={() => void refreshDetection()}
          disabled={source === "none" || detecting}
          className="rounded-full bg-cyan-500/90 px-4 py-2 text-xs font-medium text-black hover:bg-cyan-400 disabled:opacity-30"
        >
          {detecting ? "Detecting…" : "Refresh Detection"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {detections.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-white/50">
            Detected objects — AI vision, boxes are approximate. Select the target manually:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detections.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                  selectedId === d.id
                    ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-300"
                    : "border-white/15 text-white/60 hover:border-cyan-400/50 hover:text-cyan-300"
                }`}
              >
                {d.id} · {(d.confidence * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
