"use client";

import { useCallback, useRef, useState } from "react";

const MAX_EDGE = 2000;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  return blob ?? file;
}

export function ImageDropzone({
  onImageReady,
  disabled,
}: {
  onImageReady: (blob: Blob, previewUrl: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setIsPreparing(true);
      try {
        const blob = await compressImage(file);
        onImageReady(blob, URL.createObjectURL(blob));
      } finally {
        setIsPreparing(false);
      }
    },
    [onImageReady]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) void handleFile(file);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex min-h-64 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-black/15 hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <p className="text-lg font-medium">
        {isPreparing ? "Preparing photo…" : "Drop a photo of your robot arm here"}
      </p>
      <p className="text-sm text-black/50 dark:text-white/50">
        or click to choose a file — JPEG, PNG, or WebP
      </p>
    </div>
  );
}
