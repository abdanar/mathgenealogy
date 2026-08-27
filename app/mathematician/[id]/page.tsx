import { GenealogyGraph } from "@/components/GenealogyGraph";
import { MathematicianHeader } from "@/components/MathematicianHeader";
import { SearchBar } from "@/components/SearchBar";
import { getLocalGenealogy } from "@/lib/genealogy";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MathematicianPage({
  params,
}: PageProps<"/mathematician/[id]">) {
  const { id } = await params;
  const genealogy = getLocalGenealogy(id);

  if (!genealogy) notFound();

  return (
    <main className="profile">
      <div className="profile__search">
        <Link className="wordmark" href="/">MathGenealogy</Link>
        <SearchBar compact />
      </div>
      <MathematicianHeader mathematician={genealogy.subject} />
      <GenealogyGraph genealogy={genealogy} />
    </main>
  );
}