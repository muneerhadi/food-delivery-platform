"use client";

import { useTheme } from "next-themes";

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return {
    grid: isDark ? "hsl(165 15% 22%)" : "hsl(140 19% 90%)",
    axis: isDark ? "hsl(165 10% 70%)" : "hsl(165 7% 44%)",
    tooltipBg: isDark ? "hsl(165 15% 11%)" : "hsl(0 0% 100%)",
    tooltipBorder: isDark ? "hsl(165 15% 20%)" : "hsl(140 19% 90%)",
    tooltipText: isDark ? "hsl(48 100% 97%)" : "hsl(160 54% 15%)",
    line: isDark ? "#0A8A67" : "#005D44",
    bar: "#E6A543",
  };
}
