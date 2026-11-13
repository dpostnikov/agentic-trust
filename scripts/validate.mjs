// Checks data.js for broken references. Run: node scripts/validate.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../data.js", import.meta.url), "utf8");
const { KINDS, COLS, NODES, EDGES, LAYERS, COMPLIANCE, STD, PROFILES } =
  new Function(`${src}; return { KINDS, COLS, NODES, EDGES, LAYERS, COMPLIANCE, STD, PROFILES };`)();

const errors = [];
const nodeIds = new Set(NODES.map(n => n.id));
const seen = (arr, what) => {
  const s = new Set();
  arr.forEach(x => { if (s.has(x.id)) errors.push(`Duplicate ${what} id "${x.id}"`); s.add(x.id); });
};
seen(NODES, "node"); seen(EDGES, "edge"); seen(LAYERS, "layer");

const used = new Set();
const checkStd = (id, where) => {
  used.add(id);
  if (!STD[id]) errors.push(`${where}: unknown standard "${id}" (add it to STD)`);
};

NODES.forEach(n => { if (!KINDS[n.kind]) errors.push(`Node "${n.id}": unknown kind "${n.kind}"`); });
COLS.forEach(c => { if (!KINDS[c]) errors.push(`COLS: unknown kind "${c}"`); });
EDGES.forEach(e => {
  if (!nodeIds.has(e.from)) errors.push(`Edge "${e.id}": unknown from node "${e.from}"`);
  if (!nodeIds.has(e.to)) errors.push(`Edge "${e.id}": unknown to node "${e.to}"`);
  (e.std || []).forEach(s => checkStd(s, `Edge "${e.id}"`));
});
LAYERS.forEach(L => COLS.forEach(c => {
  if (!Array.isArray(L.cells[c])) errors.push(`Layer "${L.id}": missing cell for "${c}" (use [] for a gap)`);
  else L.cells[c].forEach(s => checkStd(s, `Layer "${L.id}" / ${c}`));
}));
COMPLIANCE.std.forEach(s => checkStd(s, "Compliance row"));
const placed = new Set([...LAYERS.flatMap(L => COLS.flatMap(c => L.cells[c] || [])), ...COMPLIANCE.std]);
Object.entries(PROFILES || {}).forEach(([pid, P]) => {
  if (!P.name || !P.u || !Array.isArray(P.std)) errors.push(`Profile "${pid}": needs name, u and std`);
  (P.std || []).forEach(s => {
    if (!STD[s]) errors.push(`Profile "${pid}": unknown standard "${s}"`);
    else if (!placed.has(s)) errors.push(`Profile "${pid}": "${s}" is not placed in the matrix, so it can't be shown`);
  });
});
Object.entries(STD).forEach(([id, s]) => {
  if (!s.n || !s.d) errors.push(`Standard "${id}": needs n (name) and d (description)`);
  if (!s.concept && !s.u) errors.push(`Standard "${id}": needs u (URL) unless concept: true`);
});

const unused = Object.keys(STD).filter(id => !used.has(id));
if (unused.length) console.warn(`Warning: standards defined but not used: ${unused.join(", ")}`);

if (errors.length) { console.error(errors.map(e => `✗ ${e}`).join("\n")); process.exit(1); }
console.log(`✓ data.js OK — ${NODES.length} nodes, ${EDGES.length} edges, ${LAYERS.length} layers, ${Object.keys(STD).length} standards, ${Object.keys(PROFILES || {}).length} profiles`);
