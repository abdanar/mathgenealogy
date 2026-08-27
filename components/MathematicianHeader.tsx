import Link from "next/link";
import type { Mathematician } from "@/types/genealogy";

export function MathematicianHeader({
  mathematician,
  advisors,
}: {
  mathematician: Mathematician;
  advisors: Mathematician[];
}) {
  const lifespan = [mathematician.birthYear, mathematician.deathYear].filter(Boolean).join("–");
  return (
    <header className="mathematician-header">
      <h1>{mathematician.name}</h1>
      {lifespan && <p className="mathematician-header__lifespan">{lifespan}</p>}
      {(mathematician.university || mathematician.degreeYear) && <p className="mathematician-header__degree">{mathematician.university}{mathematician.university && mathematician.degreeYear ? " · " : ""}{mathematician.degreeYear ? `PhD ${mathematician.degreeYear}` : ""}</p>}
      {advisors.length > 0 && (
        <p className="mathematician-header__advisor">
          Advised by{" "}
          {advisors.map((advisor, index) => (
            <span key={advisor.id}>
              {index > 0 && " · "}
              <Link href={`/mathematician/${advisor.id}`}>{advisor.name}</Link>
            </span>
          ))}
        </p>
      )}
      {mathematician.dissertation && <div className="mathematician-header__dissertation"><p>Dissertation</p><p>{mathematician.dissertation}</p></div>}
      {mathematician.fields && <p className="mathematician-header__fields">{mathematician.fields.join(" · ")}</p>}
    </header>
  );
}