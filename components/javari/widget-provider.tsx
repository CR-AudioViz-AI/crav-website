"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Dynamic import to avoid SSR issues
const JavariWidget = dynamic(
  () => import("@/components/javari/widget").then(mod => mod.JavariWidget),
  { ssr: false }
);

export function JavariWidgetProvider() {
  const pathname = usePathname();
  
  // Don't show on admin pages, embed pages, or auth pages
  const excludedPaths = ["/admin", "/embed", "/login", "/signup", "/auth"];
  const shouldShow = !excludedPaths.some(path => pathname?.startsWith(path));

  if (!shouldShow) return null;

  return <JavariWidget sourceApp="website" />;
}

export default JavariWidgetProvider;
