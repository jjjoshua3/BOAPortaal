import { FEITEN, type Feit } from "@/lib/boa/feitcodes";
import { JARGON, type Woord } from "@/lib/boa/jargon";
import { BOMEN, type Tree } from "@/lib/boa/trees";
import { BEGINSELEN, CASUSSEN, VRAGEN, type Beginsel, type Casus, type Vraag } from "@/lib/boa/trainer";

type Regel = { soort: string; sleutel: string; payload: Record<string, unknown> };

function samen<T extends object>(basis: T, payload: Record<string, unknown>): T {
  const { id: _id, ...rest } = payload;
  return { ...basis, ...rest };
}

function plaats<T extends { id: string }>(lijst: T[], sleutel: string, payload: Record<string, unknown>) {
  if (payload.verwijderd === true) {
    const index = lijst.findIndex((item) => item.id === sleutel);
    if (index >= 0) lijst.splice(index, 1);
    return;
  }
  const index = lijst.findIndex((item) => item.id === sleutel);
  if (index >= 0) lijst[index] = samen(lijst[index], payload);
  else lijst.push({ ...payload, id: sleutel } as T);
}

export async function pasLiveToe(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("https://systeem.boaportaal.nl/.netlify/functions/inhoud");
    const data = (await res.json()) as { regels?: Regel[] };
    for (const regel of data.regels || []) {
      const payload = regel.payload || {};
      if (regel.soort === "feit") plaats(FEITEN as Feit[], regel.sleutel, payload);
      if (regel.soort === "boom") plaats(BOMEN as Tree[], regel.sleutel, payload);
      if (regel.soort === "vraag") plaats(VRAGEN as Vraag[], regel.sleutel, payload);
      if (regel.soort === "casus") plaats(CASUSSEN as Casus[], regel.sleutel, payload);
      if (regel.soort === "beginsel") {
        const index = BEGINSELEN.findIndex((item) => item.titel === regel.sleutel);
        if (payload.verwijderd === true) {
          if (index >= 0) BEGINSELEN.splice(index, 1);
        } else if (index >= 0) BEGINSELEN[index] = samen(BEGINSELEN[index], payload);
        else BEGINSELEN.push(payload as Beginsel);
      }
      if (regel.soort === "jargon") {
        const index = JARGON.findIndex((item) => item.term === regel.sleutel);
        if (payload.verwijderd === true) {
          if (index >= 0) JARGON.splice(index, 1);
        } else if (index >= 0) JARGON[index] = samen(JARGON[index], payload);
        else JARGON.push(payload as Woord);
      }
    }
  } catch {
    /* de vaste tekst blijft staan */
  }
}
