import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div className="home__search">
        <h1>Math<span style={{ color: "var(--accent)" }}>Genealogy</span></h1>
        <SearchBar autoFocus home />
        <Link className="home__path" href="/path">Find a genealogy path</Link>
      </div>
    </main>
  );
}
