import Link from "next/link";
import { HeaderSearch } from "@/components/HeaderSearch";
import { PathFinder } from "@/components/PathFinder";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = { title: "Path | MathGenealogy" };

export default function PathPage() {
  return (
    <main className="path-page">
      <div className="profile__search">
        <Link className="wordmark" href="/">Math<span style={{ color: "var(--accent-fg)" }}>Genealogy</span></Link>
        <div className="profile__tools">
          <Link aria-current="page" href="/path">Path</Link>
          <ThemeToggle />
          <HeaderSearch />
        </div>
      </div>
      <header className="path-page__header">
        <h1>Find a relationship</h1>
      </header>
      <PathFinder />
    </main>
  );
}