/** Tekst-PDF in Helvetica. Bedragen schrijven we als EUR, niet als euroteken. */

function pdfEscape(line: string): string {
  const clean = line.replaceAll("€", "EUR ").replace(/[^\u0000-\u00ff]/g, "?");
  return clean.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrap(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const out: string[] = [];
  let rest = line;
  while (rest.length > width) {
    let cut = rest.lastIndexOf(" ", width);
    if (cut < 12) cut = width;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

function paginate(lines: string[]): string[][] {
  const pages: string[][] = [];
  let page: string[] = [];
  for (const line of lines) {
    for (const part of wrap(line, 90)) {
      if (page.length >= 50) {
        pages.push(page);
        page = [];
      }
      page.push(part);
    }
  }
  if (page.length === 0) pages.push([]);
  else if (page.length) pages.push(page);
  return pages;
}

export function downloadTekstPdf(bestandsnaam: string, lines: string[]) {
  const pages = paginate(lines);
  const pageIds = pages.map((_, index) => 3 + index);
  const contentIds = pages.map((_, index) => 3 + pages.length + index);
  const fontId = 3 + pages.length * 2;
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`);
  pages.forEach((_, index) => {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${contentIds[index]} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });
  pages.forEach((page) => {
    const commands = ["BT", "/F1 11 Tf", "14 TL", "1 0 0 1 48 800 Tm"];
    page.forEach((line, lineIndex) => {
      commands.push(`(${pdfEscape(line)}) Tj`);
      if (lineIndex < page.length - 1) commands.push("T*");
    });
    if (page.length === 0) commands.push("( ) Tj");
    commands.push("ET");
    const stream = commands.join("\n");
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

  const file: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(file.join("").length);
    file.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });
  const startxref = file.join("").length;
  const size = objects.length + 1;
  let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
  for (let index = 1; index < size; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  file.push(xref);
  file.push(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF`);
  const blob = new Blob([file.join("")], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = bestandsnaam;
  link.click();
  URL.revokeObjectURL(url);
}
