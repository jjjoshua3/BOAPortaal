export type PiiHit = {
  soort: "hard" | "zacht";
  label: string;
  index: number;
  length: number;
};

function elfproef(digits: string): boolean {
  if (digits.length !== 9) return false;
  if (/^(\d)\1{8}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 8; i += 1) sum += (9 - i) * Number(digits[i]);
  sum -= Number(digits[8]);
  return sum % 11 === 0;
}

function isBsnDigits(raw: string): boolean {
  if (raw.length === 9) return elfproef(raw);
  if (raw.length === 8) return elfproef(`0${raw}`);
  return false;
}

export function scanPii(text: string): { hard: PiiHit[]; zacht: PiiHit[] } {
  const hard: PiiHit[] = [];
  const zacht: PiiHit[] = [];

  const bsn = /(?<!\d)(?:\d[\s.-]?){7,8}\d(?!\d)/g;
  for (const match of text.matchAll(bsn)) {
    const digits = match[0].replace(/\D/g, "");
    if (!isBsnDigits(digits)) continue;
    hard.push({
      soort: "hard",
      label: "BSN",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const bsnLabel = /\bbsn\b\s*[:#]?\s*\d{8,9}/gi;
  for (const match of text.matchAll(bsnLabel)) {
    hard.push({
      soort: "hard",
      label: "BSN",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const phone = /(?<!\d)(?:(?:\+31|0031)[\s-]?|0)(?:6(?:[\s-]?\d){8}|[1-9]\d(?:[\s-]?\d){7})(?!\d)/g;
  for (const match of text.matchAll(phone)) {
    hard.push({
      soort: "hard",
      label: "telefoonnummer",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  for (const match of text.matchAll(email)) {
    hard.push({
      soort: "hard",
      label: "e-mailadres",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const iban = /\b[A-Z]{2}\d{2}[A-Z]{4}\d{10}\b/gi;
  for (const match of text.matchAll(iban)) {
    hard.push({
      soort: "hard",
      label: "IBAN",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const naam =
    /\b(?:dhr\.?|mevr\.?|mevrouw|de heer|mw\.?)\s+[A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+)?/g;
  for (const match of text.matchAll(naam)) {
    zacht.push({
      soort: "zacht",
      label: "mogelijke naam",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  const verdachteNaam = /\bverdachte\s+(?!\[)[A-Z][a-zà-ÿ]+\s+[A-Z][a-zà-ÿ]+/g;
  for (const match of text.matchAll(verdachteNaam)) {
    zacht.push({
      soort: "zacht",
      label: "mogelijke naam van verdachte",
      index: match.index ?? 0,
      length: match[0].length,
    });
  }

  return { hard: mergeHits(hard), zacht: mergeHits(zacht) };
}

function mergeHits(hits: PiiHit[]): PiiHit[] {
  const sorted = [...hits].sort((a, b) => a.index - b.index || b.length - a.length);
  const merged: PiiHit[] = [];
  for (const hit of sorted) {
    const last = merged[merged.length - 1];
    if (!last || hit.index >= last.index + last.length) {
      merged.push({ ...hit });
      continue;
    }
    const end = Math.max(last.index + last.length, hit.index + hit.length);
    last.length = end - last.index;
    if (hit.label === "BSN") last.label = "BSN";
  }
  return merged;
}

export function maskHardPii(text: string): string {
  const { hard } = scanPii(text);
  if (!hard.length) return text;
  const ordered = [...hard].sort((a, b) => b.index - a.index);
  let next = text;
  for (const hit of ordered) {
    next = `${next.slice(0, hit.index)}[${hit.label.toUpperCase()} VERWIJDERD]${next.slice(hit.index + hit.length)}`;
  }
  return next;
}

export function piiSamenvatting(text: string): string | null {
  const { hard, zacht } = scanPii(text);
  if (!hard.length && !zacht.length) return null;
  const delen: string[] = [];
  if (hard.length) delen.push(`geblokkeerd: ${[...new Set(hard.map((h) => h.label))].join(", ")}`);
  if (zacht.length) delen.push(`controleer: ${[...new Set(zacht.map((h) => h.label))].join(", ")}`);
  return delen.join(" · ");
}
