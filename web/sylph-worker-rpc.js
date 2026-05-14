// Tiny promise-RPC wrapper around the WASM worker.
// Use:
//   const rpc = sylphWorkerRpc();
//   await rpc.init();
//   const meta = await rpc.loadDb(uint8);          // transfers ownership of `uint8.buffer`
//   const { tsv, elapsedMs } = await rpc.profile(fastq, 1_000_000);

export function sylphWorkerRpc() {
  const worker = new Worker(new URL("./sylph-worker.js", import.meta.url), { type: "module" });
  const pending = new Map();
  let nextId = 1;

  worker.addEventListener("message", (e) => {
    const { id } = e.data;
    const resolver = pending.get(id);
    if (!resolver) return;
    pending.delete(id);
    if (e.data.ok) resolver.resolve(e.data);
    else resolver.reject(new Error(e.data.error));
  });
  worker.addEventListener("error", (e) => {
    for (const { reject } of pending.values()) reject(new Error(e.message ?? "worker error"));
    pending.clear();
  });

  function call(type, payload, transfer) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, type, ...payload }, transfer ?? []);
    });
  }

  return {
    worker,
    async init() {
      await call("init");
    },
    async loadDb(bytes) {
      const { meta } = await call("loadDb", { bytes }, [bytes.buffer]);
      return meta;
    },
    async profile(fastq, maxReads) {
      const { tsv, elapsedMs } = await call("profile", { fastq, maxReads }, [fastq.buffer]);
      return { tsv, elapsedMs };
    },
    async profilePe(r1, r2, maxReads) {
      const { tsv, elapsedMs } = await call(
        "profilePe", { r1, r2, maxReads }, [r1.buffer, r2.buffer]
      );
      return { tsv, elapsedMs };
    },
    terminate() {
      worker.terminate();
      for (const { reject } of pending.values()) reject(new Error("worker terminated"));
      pending.clear();
    },
  };
}
