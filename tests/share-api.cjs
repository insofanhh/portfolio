const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const base = process.argv[2] || "http://127.0.0.1:3000";
const moduleData = { exports: {} };
const code = ts.transpileModule(fs.readFileSync("lib/profile.ts","utf8"), { compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022} }).outputText;
new Function("module","exports",code)(moduleData,moduleData.exports);
const profile = { ...moduleData.exports.initial, name: "API test — Tiếng Việt", intro: "Synthetic test snapshot." };
const post = body => fetch(base + "/api/shares", {
  method:"POST", headers:{"Content-Type":"application/json",Origin:new URL(base).origin}, body:JSON.stringify(body)
});
(async()=>{
 const created=await post(profile);
 assert.equal(created.status,201,await created.clone().text());
 const first=await created.json();
 assert.match(first.id,/^[A-Za-z0-9_-]{22}$/);
 assert.equal(first.path,"/?s="+first.id);
 const another=await post(profile);
 assert.equal((await another.json()).id,first.id);
 const read=await fetch(base+"/api/shares/"+first.id);
 assert.equal(read.status,200);
 assert.deepEqual((await read.json()).profile,profile);
 const updated=await post({...profile,name:"Changed snapshot"});
 assert.notEqual((await updated.json()).id,first.id);
 assert.equal((await (await fetch(base+"/api/shares/"+first.id)).json()).profile.name,profile.name);
 assert.equal((await post({...profile,email:"invalid"})).status,400);
 assert.equal((await fetch(base+"/api/shares/"+"a".repeat(22))).status,404);
 assert.equal((await fetch(base+"/api/shares/bad-id")).status,400);
 assert.equal((await fetch(base+"/api/shares",{method:"POST",headers:{"Content-Type":"application/json",Origin:"https://unrelated.example"},body:JSON.stringify(profile)})).status,403);
 assert.equal((await fetch(base+"/api/shares",{method:"POST",headers:{"Content-Type":"text/plain"},body:"{}"})).status,415);
 assert.equal((await fetch(base+"/api/shares",{method:"POST",headers:{"Content-Type":"application/json"},body:"not json"})).status,400);
 assert.equal((await post({...profile,about:"x".repeat(170000)})).status,413);
 console.log("HTTP checks passed: creation, short ID, deduplication, independent read, immutable versions, invalid/missing IDs, invalid input, origin, content type, body size.");
 console.log("Synthetic example: "+base+first.path);
})().catch(error=>{console.error(error);process.exitCode=1});
