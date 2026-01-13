import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("public/data/calles.json"); // ajustá si tu ruta es otra
const outputPath = path.resolve("calles_export.csv");

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const escapeCSV = (v) => {
  const s = String(v ?? "");
  // encerrar en comillas si tiene coma, comillas o salto de línea
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const rows = data.map((seg, idx) => {
  const coordsStr = JSON.stringify(seg.coords); // para conservar todo el tramo
  const first = seg.coords?.[0] ?? [];
  const last = seg.coords?.[seg.coords.length - 1] ?? [];
  return {
    id: idx + 1,
    calle: seg.calle,
    desde: seg.desde,
    hasta: seg.hasta,
    estado: seg.estado,
    puntos: seg.coords?.length ?? 0,
    lat_inicio: first[0] ?? "",
    lng_inicio: first[1] ?? "",
    lat_fin: last[0] ?? "",
    lng_fin: last[1] ?? "",
    coords_json: coordsStr,
  };
});

const headers = Object.keys(rows[0] ?? {
  id: "", calle: "", desde: "", hasta: "", estado: "", puntos: "",
  lat_inicio: "", lng_inicio: "", lat_fin: "", lng_fin: "", coords_json: ""
});

const csv =
  headers.join(",") +
  "\n" +
  rows
    .map((r) => headers.map((h) => escapeCSV(r[h])).join(","))
    .join("\n");

fs.writeFileSync(outputPath, "\ufeff" + csv, "utf8");
console.log(`OK -> ${outputPath} (${rows.length} tramos)`);
