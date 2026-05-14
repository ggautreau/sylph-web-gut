# nano_gut_sylph

In-browser metagenomic profiling: a WebAssembly build of [sylph](https://github.com/bluenote-1577/sylph) targeted at a gut-only reference database, with a streaming FASTQ importer that caps analysis at the first N reads.

## Goals

- **Zero install** — single static site, no server-side compute.
- **Privacy** — FASTQ never leaves the user's machine.
- **Tractable footprint** — gut-only `.syldb` (UHGG species reps) fits within the wasm32 4 GB memory ceiling.

## Layout

| Path | What it holds |
|---|---|
| `web/` | Static site: FASTQ downsampler today, full sylph profiler later. |
| `scripts/` | Native pipeline to build the gut `.syldb` from UHGG. |
| `sylph-survey/` | Notes and porting plan for the sylph → WASM fork. |
| `docs/` | Design notes, size estimates, deployment notes. |

## Status

Built so far:
- `web/` — FASTQ downsampler (drag-and-drop, streaming, 5M-read cap, gzipped input).

Pending:
- Sylph WASM fork (needs `rustup` + wasm-pack on the dev machine).
- UHGG `.syldb` build (script ready; run on a host with native sylph and ~50 GB scratch).
