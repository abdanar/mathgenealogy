"use server";

import { searchMathematicians } from "@/lib/genealogy";
import type { Mathematician } from "@/types/genealogy";

export async function searchMathematiciansAction(query: string): Promise<Mathematician[]> {
  return searchMathematicians(query);
}