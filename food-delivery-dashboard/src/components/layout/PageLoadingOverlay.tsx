"use client";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useNavigationLoading } from "@/contexts/NavigationLoadingContext";

export function PageLoadingOverlay() {
  const { isNavigating } = useNavigationLoading();

  if (!isNavigating) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
      <LoadingSpinner label="Loading page..." className="min-h-[40vh]" />
    </div>
  );
}
