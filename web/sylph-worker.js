// Web Worker that owns the WASM Profiler.
//
// The DB is held in the worker's WASM linear memory so the main thread is free
// to keep painting progress, gunzipping the next FASTQ, etc. while a sample is
// being profiled. Messages are RPC-style: each request has an `id`, the reply
// echoes it.
//
// Protocol (every message has `id` + `type`):
//   in  { id, type: "init" }
//   out { id, ok: true }
//   in  { id, type: "loadDb", bytes: Uint8Array }    // bytes is transferred
//   out { id, ok: true, meta: { database_size, k, c, bytes } }
//   in  { id, type: "profile", fastq: Uint8Array, maxReads: number }   // transferred
//   out { id, ok: true, tsv, elapsedMs }
//   error: { id, ok: false, error: string }

import init, { Profiler } from "./sylph-pkg/sylph_wasm.js";

let profiler = null;
let inited = false;

self.addEventListener("message", async (e) => {
  const { id, type } = e.data;
  try {
    if (type === "init") {
      if (!inited) {
        await init();
        inited = true;
      }
      self.postMessage({ id, ok: true });
    } else if (type === "loadDb") {
      if (!inited) {
        await init();
        inited = true;
      }
      if (profiler) {
        profiler.free();
        profiler = null;
      }
      const { bytes } = e.data;
      profiler = new Profiler(bytes);
      self.postMessage({
        id,
        ok: true,
        meta: {
          database_size: profiler.database_size,
          k: profiler.k,
          c: profiler.c,
          bytes: bytes.length,
        },
      });
    } else if (type === "profile") {
      if (!profiler) throw new Error("database not loaded");
      const { fastq, maxReads } = e.data;
      const t0 = performance.now();
      const tsv = profiler.profile(fastq, maxReads);
      const elapsedMs = performance.now() - t0;
      self.postMessage({ id, ok: true, tsv, elapsedMs });
    } else if (type === "profilePe") {
      if (!profiler) throw new Error("database not loaded");
      const { r1, r2, maxReads } = e.data;
      const t0 = performance.now();
      const tsv = profiler.profile_pe(r1, r2, maxReads);
      const elapsedMs = performance.now() - t0;
      self.postMessage({ id, ok: true, tsv, elapsedMs });
    } else {
      throw new Error(`unknown message type: ${type}`);
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: err?.message ?? String(err) });
  }
});
