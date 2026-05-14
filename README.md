# sylph-web-gut

In-browser gut metagenomic profiling: a WebAssembly build of [sylph](https://github.com/bluenote-1577/sylph) targeted at a gut-only reference database, with a streaming FASTQ importer capped at 3 M reads per sample.

> [!IMPORTANT]
> **Unofficial port.** This is an adapted WebAssembly port of sylph for quick, in-browser sanity checks of gut metagenomic composition. It is **not supported or endorsed by the sylph authors** and does not achieve the reliability of [sylph](https://github.com/bluenote-1577/sylph), [MetaPhlAn4](https://github.com/biobakery/MetaPhlAn), or [Meteor2](https://forgemia.inra.fr/metagenopolis/meteor) run natively — use those for real analyses. If you use the results, please cite the upstream papers below.

## Goals

- **Zero install** — single static site, no server-side compute.
- **Privacy** — FASTQ never leaves the user's machine.
- **Tractable footprint** — gut-only `.syldb` (UHGG species reps) fits within the wasm32 4 GB memory ceiling.

## Layout

| Path | What it holds |
|---|---|
| `web/` | Static site: multi-sample sylph profiler with INRAE-themed UI. |
| `web/sylph-pkg/` | wasm-pack output (committed so the deployed site is self-contained). |
| `scripts/` | Native pipeline to build the gut `.syldb` from UHGG. |
| `sylph-wasm/` | Fork of upstream sylph with a wasm32 target and JS bindings. |
| `sylph-survey/` | Notes and porting plan for the sylph → WASM fork. |
| `docs/` | Design notes, size estimates, deployment notes. |
| `.github/workflows/pages.yml` | GitHub Pages deploy on push to `main`. |

## Database hosting

The 6 MB smoke-test database (`web/db/gut_mini.syldb`) is bundled with the site. The full 433 MB UHGG `gut.syldb` is too large for GitHub Pages and is fetched from a **GitHub Release** at runtime (`releases/download/db-v1/gut.syldb`). To publish a new DB:

```bash
gh release create db-v1 web/db/gut.syldb \
  --title "UHGG gut DB v1" \
  --notes "Full UHGG gut .syldb consumed at runtime by the in-browser sylph profiler."
```

If you use a different tag, update the two `<option value="…">` lines in `web/profile.html` and `web/multi.html`.

## Citations

If you use the results, please cite:

- **sylph** — Shaw, J. & Yu, Y. W. *Rapid species-level metagenome profiling and containment estimation with sylph.* Nature Biotechnology (2024). <https://www.nature.com/articles/s41587-024-02412-y> — upstream repo: <https://github.com/bluenote-1577/sylph>
- **UHGG catalog** — Almeida, A. *et al.* *A unified catalog of 204,938 reference genomes from the human gut microbiome.* Nature Biotechnology 39, 105–114 (2021). <https://www.nature.com/articles/s41587-020-0603-3>

This repository is an unofficial adaptation; the authors of sylph and the UHGG catalog are not responsible for it.
