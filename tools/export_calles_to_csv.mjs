import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("public/data/calles.json"); // ajustá si cambia
const outputPath = path.resolve("calles_export.csv");

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

/**
 * Haversine distance (metros)
 */
const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // radio tierra en metros
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Longitud total de una polyline
 */
const polylineLengthMeters = (coords = []) => {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lat1, lon1] = coords[i - 1];
    const [lat2, lon2] = coords[i];
    total += haversineMeters(lat1, lon1, lat2, lon2);
  }
  return Math.round(total);
};

const escapeCSV = (v) => {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const rows = data.map((seg, idx) => {
  const coordsStr = JSON.stringify(seg.coords);
  const first = seg.coords?.[0] ?? [];
  const last = seg.coords?.[seg.coords.length - 1] ?? [];
  const lengthMeters = polylineLengthMeters(seg.coords);

  return {
    id: seg.id ?? idx + 1,
    calle: seg.calle,
    desde: seg.desde,
    hasta: seg.hasta,
    estado: seg.estado,
    puntos: seg.coords?.length ?? 0,
    length_meters: lengthMeters,
    lat_inicio: first[0] ?? "",
    lng_inicio: first[1] ?? "",
    lat_fin: last[0] ?? "",
    lng_fin: last[1] ?? "",
    coords_json: coordsStr,
  };
});

const headers = Object.keys(
  rows[0] ?? {
    id: "",
    calle: "",
    desde: "",
    hasta: "",
    estado: "",
    puntos: "",
    length_meters: "",
    lat_inicio: "",
    lng_inicio: "",
    lat_fin: "",
    lng_fin: "",
    coords_json: "",
  }
);

const csv =
  headers.join(",") +
  "\n" +
  rows
    .map((r) => headers.map((h) => escapeCSV(r[h])).join(","))
    .join("\n");

fs.writeFileSync(outputPath, "\ufeff" + csv, "utf8");
console.log(`OK -> ${outputPath} (${rows.length} tramos)`);
