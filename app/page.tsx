import { SearchBar } from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="home">
      <div className="home__search">
        <p className="eyebrow">Academic genealogy of mathematics</p>
        <h1>MathGenealogy</h1>
        <SearchBar autoFocus />
      </div>
    </main>
  );
}
