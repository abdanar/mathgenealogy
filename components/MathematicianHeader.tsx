import type { Mathematician } from "@/types/genealogy";

export function MathematicianHeader({ mathematician }: { mathematician: Mathematician }) {
  const lifespan = [mathematician.birthYear, mathematician.deathYear].filter(Boolean).join("–");
  return (
    <header className="mathematician-header">
      <h1>{mathematician.name}</h1>
      {lifespan && <p className="mathematician-header__lifespan">{lifespan}</p>}
      {(mathematician.university || mathematician.degreeYear) && <p className="mathematician-header__degree">{mathematician.university}{mathematician.university && mathematician.degreeYear ? " · " : ""}{mathematician.degreeYear ? `PhD ${mathematician.degreeYear}` : ""}</p>}
      {mathematician.dissertation && <p className="mathematician-header__dissertation">{mathematician.dissertation}</p>}
      {mathematician.fields && <p className="mathematician-header__fields">{mathematician.fields.join(" · ")}</p>}
    </header>
  );
}