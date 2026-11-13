# Agentic Trust Map

An interactive map of trust relationships in agentic systems (user, resource, agent/workload, organisations, trust anchors) cross-linked to the standards that cover each layer: discovery, identification, credentials, authentication, authorisation and delegation, protocols, and domain extensions.

Click an entity, a relationship or a standard and the diagram, inspector panel and matrix highlight what's connected.

## Run it

Open `index.html` in a browser. There is no build step and no server needed.

Every push to `main` is validated and published to GitHub Pages (see `.github/workflows/pages.yml`). To turn Pages on: **Settings → Pages → Source: GitHub Actions**.

## Edit the content

All content is in [`data.js`](data.js). You should rarely need to touch `index.html`.

| Block | What it holds |
|---|---|
| `KINDS` | Entity types: display name, colour token, description |
| `COLS` | Which kinds appear as matrix columns, in order |
| `NODES` | Boxes in the diagram: `id`, `kind`, `label`, optional `sub`, and centre `x`/`y` in a 980×510 canvas (optional `w`/`h`) |
| `EDGES` | Arrows: `from`, `to`, `label`, `desc`, `std` (standard ids), optional `bend` (curve, px) and `suggested: true` (dashed, toggleable) |
| `LAYERS` | Matrix rows; `cells` maps each column kind to a list of standard ids. `[]` renders as a gap |
| `COMPLIANCE` | The ecosystem-wide bottom row |
| `PROFILES` | Named subsets of standards (e.g. AIMS, Poppy): `name`, `full`, `by`, `u`, `summary`, `open` (gaps it leaves), `std` (ids) |
| `STD` | Standards dictionary: `n` name, `d` description, `u` URL; `concept: true` for non-spec entries (shown dashed, no URL needed) |

### Common changes

**Add a standard**: add an entry to `STD`, then reference its id in a `LAYERS[].cells` list and/or an edge's `std` list.

**Add a relationship**: add an entry to `EDGES` with existing node ids. Use `bend` to curve it away from other arrows.

**Add an entity box**: add to `NODES` with a free spot on the canvas.

**Add a profile**: add an entry to `PROFILES`. Every id in its `std` list must be placed somewhere in the matrix. Link straight to a profile with `#<profile-id>`, e.g. `index.html#aims`.

### Profiles

| Profile | Source |
|---|---|
| AIMS (Agent Identity Management System) | [draft-ietf-wimse-aims](https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/) |
| Poppy (Personal Agent Protocol) | Sierra and Meta draft, summarised by [Descope](https://www.descope.com/learn/post/personal-agent-protocol) |

### Check your edit

```sh
node scripts/validate.mjs
```

This catches unknown standard ids, missing cells, broken node references and duplicates. It also runs on every pull request.

## Status

The initial matrix was transcribed from a low-resolution diagram. Some spec names and placements are best-effort and need review.
