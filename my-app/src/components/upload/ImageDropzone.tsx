"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { MAX_IMAGE_FILES } from "@/lib/constants";

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
  onImagesReady,
  disabled,
}: {
  onImagesReady: (blobs: Blob[], previewUrls: string[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, MAX_IMAGE_FILES);
      if (files.length === 0) return;

      setIsPreparing(true);
      try {
        const blobs = await Promise.all(files.map(compressImage));
        const previewUrls = blobs.map((blob) => URL.createObjectURL(blob));
        onImagesReady(blobs, previewUrls);
      } finally {
        setIsPreparing(false);
      }
    },
    [onImagesReady]
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
        if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
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
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
        }}
      />
      <p className="text-lg font-medium">
        {isPreparing ? t("preparingPhotos") : t("dropPhotosHere")}
      </p>
      <p className="text-sm text-black/50 dark:text-white/50">
        {t("chooseFilesHint").replace("{count}", String(MAX_IMAGE_FILES))}
      </p>
    </div>
  );
}
