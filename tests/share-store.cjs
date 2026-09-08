const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { spawnSync } = require("node:child_process");
function load(file, overrides = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(name => overrides[name] || require(name), module, module.exports);
  return module.exports;
}
const profile = load("lib/profile.ts");
const sharing = load("lib/sharing.ts", { "./profile": profile });
const store = load("lib/share-store.ts", { "./sharing": sharing });
(async () => {
  if (process.argv[2] === "read") {
    const value = await store.readShare(process.argv[3]);
    assert.equal(value.name, "Kiểm thử hồ sơ 🌱");
    process.stdout.write("persisted");
    return;
  }
  const root = path.resolve(".data");
  fs.mkdirSync(root, { recursive: true });
  const dir = fs.mkdtempSync(path.join(root, "share-store-test-"));
  process.env.SHARE_STORAGE_DIR = dir;
  const p = { ...structuredClone(profile.initial), name: "Kiểm thử hồ sơ 🌱" };
  try {
    const id = await store.saveShare(p);
    assert.match(id, /^[A-Za-z0-9_-]{22}$/);
    assert.deepEqual(await store.readShare(id), p);
    assert.equal(await store.saveShare(p), id);
    const changed = await store.saveShare({ ...p, role: "Vai trò mới" });
    assert.notEqual(changed, id);
    assert.deepEqual(await store.readShare(id), p);
    assert.equal(await store.readShare("../secret"), null);
    assert.equal(await store.readShare("a".repeat(22)), null);
    await assert.rejects(store.saveShare({ ...p, email: "bad" }));
    const fresh = { ...p, intro: "Concurrent save" };
    const concurrent = await Promise.all(Array.from({ length: 4 }, () => store.saveShare(fresh)));
    assert.equal(new Set(concurrent).size, 1);
    assert.deepEqual(await store.readShare(concurrent[0]), fresh);
    const restarted = spawnSync(process.execPath, [__filename, "read", id], { env: process.env, encoding: "utf8" });
    assert.equal(restarted.status, 0, restarted.stderr);
    assert.equal(restarted.stdout, "persisted");
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.SHARE_STORAGE_DIR;
    await assert.rejects(store.saveShare(p), store.ShareStorageUnavailable);
    if (oldEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldEnv;
    console.log("Share storage checks passed: Unicode, stable IDs, immutable snapshots, missing IDs, validation, concurrent writes, process restart, production configuration.");
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), root);
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
