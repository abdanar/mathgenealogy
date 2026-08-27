import Link from "next/link";
import { PathFinder } from "@/components/PathFinder";
import { SearchBar } from "@/components/SearchBar";

export const metadata = { title: "Path | MathGenealogy" };

export default function PathPage() {
  return (
    <main className="path-page">
      <div className="profile__search">
        <Link className="wordmark" href="/">MathGenealogy</Link>
        <div className="profile__tools">
          <SearchBar compact />
          <Link aria-current="page" href="/path">Path</Link>
        </div>
      </div>
      <header className="path-page__header">
        <p className="eyebrow">Academic genealogy</p>
        <h1>Find a relationship</h1>
      </header>
      <PathFinder />
    </main>
  );
}