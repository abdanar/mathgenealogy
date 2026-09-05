"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GenealogyList } from "@/components/GenealogyList";
import { HeaderSearch } from "@/components/HeaderSearch";
import { MathematicianHeader } from "@/components/MathematicianHeader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchLocalGenealogy } from "@/lib/api-client";
import type { LocalGenealogy } from "@/types/genealogy";

export function MathematicianPageClient() {
  const id = useSearchParams().get("id");
  const [genealogy, setGenealogy] = useState<LocalGenealogy>();
  const [status, setStatus] = useState<"loading" | "missing" | "error">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }
    let isCurrent = true;
    setStatus("loading");
    setGenealogy(undefined);
    void fetchLocalGenealogy(id)
      .then((response) => { if (isCurrent) { setGenealogy(response); setStatus("loading"); } })
      .catch((error: unknown) => { if (isCurrent) setStatus(error instanceof Error && error.message.includes("404") ? "missing" : "error"); });
    return () => { isCurrent = false; };
  }, [id]);

  return (
    <main className="profile">
      <div className="profile__search">
        <Link className="wordmark" href="/">Math<span style={{ color: "var(--accent-fg)" }}>Genealogy</span></Link>
        <div className="profile__tools"><Link href="/path">Path</Link><ThemeToggle /><HeaderSearch /></div>
      </div>
      {genealogy ? <><MathematicianHeader mathematician={genealogy.subject} advisors={genealogy.advisors} /><GenealogyList students={genealogy.students} /></> : <p className="path-empty" aria-live="polite">{status === "loading" ? "Loading mathematician..." : status === "missing" ? "Mathematician not found." : "Mathematician data is temporarily unavailable."}</p>}
    </main>
  );
}