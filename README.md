# Agentic Trust Standards Map

An interactive map of trust relationships in agentic systems. It covers the user, resource, agent/workload, organisations and trust anchors, and cross-links each to the standards for every layer: discovery, identification, credentials, authentication, authorisation and delegation, protocols, domain extensions, and compliance.

**Live site:** https://dpostnikov.github.io/agentic-trust/

## What's on the page

- **Trust diagram.** Shows who owns, operates, authorises, endorses and accesses what. A toggle shows *suggested* relationships (dashed). These are the "on behalf of user" chain and each trust anchor federating to the ecosystem anchor.
- **Inspector.** Click any box, arrow, column heading or standard to see what it is, how it relates, and which standards apply.
- **Standards by layer.** A matrix with entities as columns and layers as rows. Hatched cells are gaps with no standard mapped. Dashed chips are concepts rather than specs.
- **Maturity badges.** IETF specs show the RFC number if published, otherwise **WG draft** (working-group Internet-Draft) or ***Indiv. draft*** (individual Internet-Draft). OpenID Foundation specs show **Final** or **ID1**, **ID2**… (Implementer's Draft 1, 2…).
- **Hover cards.** Hover or tab to any block to see what it delivers to the stack. Each standard's card also shows where it sits, which profiles use it, and a clickable link to its spec.
- **Profiles.** A switch above the matrix highlights the standards a given specification uses, with a short summary and what it leaves open. It filters the matrix only; the diagram and inspector are unaffected.

### Profiles

| Profile | Link | Source |
|---|---|---|
| AIMS (Agent Identity Management System) | `#aims` | [draft-ietf-wimse-aims](https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/) |
| Mission-Bound Authorization | `#mission` | Karl McGuinness's individual drafts: [handbook](https://notes.karlmcguinness.com/mission-handbook/), [drafts](https://github.com/mcguinness/mission-bound-authorization). The 16 key drafts of 52 are shown. |
| AAuth (Agent Auth Protocol) | `#aauth` | Dick Hardt's individual draft: [draft-hardt-oauth-aauth-protocol](https://datatracker.ietf.org/doc/draft-hardt-oauth-aauth-protocol/). A new protocol rather than an OAuth extension. |
| Poppy (Personal Agent Protocol) | `#poppy` | Sierra and Meta draft: [personalagentprotocol.org](https://personalagentprotocol.org/) |

Add the link to the site URL to open a profile directly, e.g. https://dpostnikov.github.io/agentic-trust/#mission.

## Run it

Open `index.html` in a browser. There is no build step and no server needed.

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
| `PROFILES` | Named subsets of standards: `name`, `full`, `by`, `u`, `summary`, `open` (gaps it leaves), `std` (ids) |
| `STD` | The standards dictionary (fields below) |

`STD` entry fields:

| Field | Required | Meaning |
|---|---|---|
| `n` | yes | Name |
| `gives` | yes | One line on what it delivers to the stack. Shown on hover |
| `d` | yes | Longer description, shown in the inspector |
| `u` | yes, unless `concept` | `https` link to the spec itself, not a working-group home page |
| `rfc` | if published | RFC number, shown as a badge |
| `track` | for Internet-Drafts | `"wg"` or `"indiv"`. Remove it when the draft becomes an RFC |
| `oidf` | for OpenID Foundation specs | `"Final"`, or `"ID1"`, `"ID2"`… for the latest approved Implementer's Draft |
| `concept` | optional | `true` for ideas with no spec yet (shown dashed) |

### Common changes

- **Add a standard.** Add an entry to `STD`, then reference its id in a `LAYERS[].cells` list and/or an edge's `std` list.
- **A draft becomes an RFC.** Replace `track` with `rfc: <number>` and point `u` at rfc-editor.org.
- **An OpenID spec advances.** Change `oidf` to the new Implementer's Draft number or to `"Final"`.
- **Add a relationship.** Add an entry to `EDGES` with existing node ids. Use `bend` to curve it away from other arrows.
- **Add an entity box.** Add to `NODES` with a free spot on the canvas.
- **Add a profile.** Add an entry to `PROFILES`. Every id in its `std` list must be placed somewhere in the matrix.

### Check your edit

```sh
node scripts/validate.mjs
```

The validator fails on:
- unknown or duplicate ids, and broken node references
- missing matrix cells (use `[]` for a gap)
- a standard without `n`, `d`, `gives`, or an `https` URL
- a `track` value other than `wg` or `indiv`, or a standard with both `rfc` and `track`
- an `oidf` value other than `Final` or `ID<n>`, or one combined with `rfc` or `track`
- a profile that lists a standard not placed in the matrix

It warns about standards that are defined but not used anywhere.

## Publishing

`.github/workflows/pages.yml` runs the validator on every pull request and push. Pushes to `main` are also deployed to GitHub Pages.

- **Turn Pages on** under **Settings → Pages → Source: GitHub Actions**.
- **Pages needs a public repo** on GitHub's free plan. Making the repo private turns Pages off, and switching back to public doesn't turn it on again. Re-select the source, then run the workflow from the Actions tab.
- **Caching.** The deploy step loads `data.js?v=<commit>`, so browsers never pair a new page with a cached old data file.

## Changes

- **Hover cards:** each standard has a `gives` line and a clickable spec link; spec links point to the spec itself.
- **Maturity badges:** RFC numbers, WG and individual draft markers, and OpenID Final / Implementer's Draft (ID1, ID2…) markers.
- **FAPI-CIBA:** the CIBA entry now refers to the FAPI CIBA profile.
- **Profiles:** AIMS, Poppy, Mission-Bound Authorization and AAuth, filtering the standards matrix only.
- **Content fixes:** OAuth removed from user authentication, since it's authorisation, not authentication; Poppy linked to its own draft.
- **Deploy:** cache-busting so the page and its data always match.
- **Rename:** the project is now the Agentic Trust Standards Map.

## Status

The first version of the matrix was transcribed from a low-resolution diagram, so some placements are best-effort and need review. Individual drafts, including the Mission-Bound family, have not had working-group review.
