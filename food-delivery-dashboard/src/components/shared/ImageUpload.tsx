"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({ label = "Upload image", value, onChange, className }: ImageUploadProps) {
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
          className="h-44 w-full rounded-xl object-cover"
          unoptimized
        />
      ) : (
        <>
          <Upload className="h-8 w-8 text-primary" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">PNG/JPG up to 2MB</p>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {value && (
        <Button type="button" variant="secondary" size="sm" className="absolute bottom-3 right-3">
          Change
        </Button>
      )}
    </label>
  );
}
