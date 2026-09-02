import { Suspense } from "react";
import { SearchPageClient } from "@/components/SearchPageClient";

export const metadata = { title: "Search | MathGenealogy" };

export default function SearchPage() {
  return <Suspense><SearchPageClient /></Suspense>;
}