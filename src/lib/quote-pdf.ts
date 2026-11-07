import type { Patient } from "@/lib/api/types";
import { economics } from "@/lib/economics";

const WIN: Record<string, string> = {
  á: "\\341",
  é: "\\351",
  í: "\\355",
  ó: "\\363",
  ú: "\\372",
  ñ: "\\361",
  Á: "\\301",
  É: "\\311",
  Í: "\\315",
  Ó: "\\323",
  Ú: "\\332",
  Ñ: "\\321",
  ü: "\\374",
  "€": " EUR",
};

function pdfText(value: string) {
  return value
    .split("")
    .map((char) => WIN[char] ?? (char.charCodeAt(0) > 126 ? "?" : char))
    .join("")
    .replace(/\\(?![0-7])/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function money(value: number) {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value)} EUR`;
}

export function downloadQuote(patient: Patient) {
  const figures = economics(patient);
  const lines = [
    "AsexiA Castellana",
    "Presupuesto",
    "",
    patient.fullName,
    patient.treatmentInterest,
    patient.phone,
    "",
    `Total ${money(figures.total)}`,
    `Cobrado ${money(figures.collected)}`,
    `Pendiente ${money(figures.pending)}`,
    "",
    "Validez 15 dias. No incluye lo no descrito en la ficha.",
    "El quirófano requiere consentimiento firmado.",
  ];
  const commands = ["BT", "/F1 18 Tf", "48 780 Td"];
  lines.forEach((line, index) => {
    if (index === 0) {
      commands.push(`(${pdfText(line)}) Tj`);
      return;
    }
    commands.push("0 -22 Td");
    commands.push(`(${pdfText(line)}) Tj`);
  });
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n",
    `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\n`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(body.length);
    body += object;
  }
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const blob = new Blob([body], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `presupuesto-${patient.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
