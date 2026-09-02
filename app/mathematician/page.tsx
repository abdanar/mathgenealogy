import { Suspense } from "react";
import { MathematicianPageClient } from "@/components/MathematicianPageClient";

export default function MathematicianPage() {
  return <Suspense><MathematicianPageClient /></Suspense>;
}