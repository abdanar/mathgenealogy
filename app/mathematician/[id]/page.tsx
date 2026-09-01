import { GenealogyList } from "@/components/GenealogyList";
import { HeaderSearch } from "@/components/HeaderSearch";
import { MathematicianHeader } from "@/components/MathematicianHeader";
import { getLocalGenealogy } from "@/lib/genealogy";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MathematicianPage({
  params,
}: PageProps<"/mathematician/[id]">) {
  const { id } = await params;
  const genealogy = await getLocalGenealogy(id);

  if (!genealogy) notFound();

  return (
    <main className="profile">
      <div className="profile__search">
        <Link className="wordmark" href="/">Math<span style={{ color: "var(--accent)" }}>Genealogy</span></Link>
        <div className="profile__tools">
          <Link href="/path">Path</Link>
          <HeaderSearch />
        </div>
      </div>
      <MathematicianHeader mathematician={genealogy.subject} advisors={genealogy.advisors} />
      <GenealogyList students={genealogy.students} />
    </main>
  );
}