"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from "@/lib/uploads";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  onReject?: (message: string) => void;
  maxSizeBytes?: number;
  className?: string;
}

export function ImageUpload({
  label = "Upload image",
  value,
  onChange,
  onReject,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
  className,
}: ImageUploadProps) {
  const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));

  const handleChange = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      onReject?.(`Image must be ${maxSizeMB}MB or smaller`);
      return;
    }

    onChange(file);
  };

  return (
    <label
      className={cn(
        "group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 p-4 text-center",
        className
      )}
    >
      {value ? (
        <Image
          src={value}
          alt={label}
          width={360}
          height={180}
          className="h-full min-h-[140px] w-full rounded-xl object-cover"
          unoptimized
        />
      ) : (
        <>
          <Upload className="h-8 w-8 text-primary" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">PNG/JPG up to {maxSizeMB}MB</p>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
      />
      {value && (
        <Button type="button" variant="secondary" size="sm" className="absolute bottom-3 right-3">
          Change
        </Button>
      )}
    </label>
  );
}
