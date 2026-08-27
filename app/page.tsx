import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home">
      <div className="home__search">
        <p className="eyebrow">Academic genealogy of mathematics</p>
        <h1>MathGenealogy</h1>
        <SearchBar autoFocus />
        <Link className="home__path" href="/path">Find a genealogy path</Link>
      </div>
    </main>
  );
}
