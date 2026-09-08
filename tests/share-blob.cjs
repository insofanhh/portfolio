const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, overrides = {}) {
 const code = ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const m={exports:{}};
 new Function("require","module","exports",code)(name=>overrides[name]||require(name),m,m.exports);
 return m.exports;
}
const profile=load("lib/profile.ts");
const sharing=load("lib/sharing.ts",{"./profile":profile});
const records=new Map();
const operations=[];
let failure=false, race=false;
const blob={
 async get(path,options){
  operations.push({method:"get",path,options});
  if(failure)throw new Error("Mock blob unavailable");
  const text=records.get(path);
  return text===undefined?null:{statusCode:200,stream:new Response(text).body};
 },
 async put(path,text,options){
  operations.push({method:"put",path,options});
  if(failure)throw new Error("Mock blob unavailable");
  if(records.has(path))throw new Error("Already exists");
  records.set(path,text);
  if(race){race=false;throw new Error("Concurrent creation");}
 }
};
const forbidDisk=new Proxy({}, {get:()=>()=>{throw new Error("Blob operations must not use local disk");}});
const overrides={"./sharing":sharing,"@vercel/blob":blob,"node:fs/promises":forbidDisk};
const store=load("lib/share-store.ts",overrides);
(async()=>{
 const env={...process.env};
 try{
  process.env.NODE_ENV="production";process.env.VERCEL="1";
  delete process.env.BLOB_READ_WRITE_TOKEN;delete process.env.BLOB_STORE_ID;
  process.env.SHARE_STORAGE_DIR="/tmp/incorrect";
  await assert.rejects(store.saveShare(profile.initial),store.ShareStorageUnavailable);
  process.env.BLOB_STORE_ID="mock-store-no-network";
  const p={...profile.initial,name:"Vercel test — Tiếng Việt"};
  const id=await store.saveShare(p);
  assert.deepEqual(await store.readShare(id),p);
  assert.equal(await store.saveShare(p),id);
  assert.equal(operations.filter(o=>o.method==="put").length,1);
  const restarted=load("lib/share-store.ts",overrides);
  assert.deepEqual(await restarted.readShare(id),p);
  const updated=await store.saveShare({...p,name:"New profile"});
  assert.notEqual(updated,id);
  assert.deepEqual(await store.readShare(id),p);
  assert.equal(await store.readShare("a".repeat(22)),null);
  const count=operations.length;
  assert.equal(await store.readShare("../outside"),null);
  assert.equal(operations.length,count);
  race=true;
  const raceId=await store.saveShare({...p,intro:"Concurrent request"});
  assert.equal((await store.readShare(raceId)).intro,"Concurrent request");
  delete process.env.BLOB_STORE_ID;
  process.env.BLOB_READ_WRITE_TOKEN="mock-token-no-network";
  assert.deepEqual(await store.readShare(id),p);
  for(const op of operations){
   assert.equal(op.options.access,"private");assert.equal(op.options.token,undefined);
   if(op.method==="get")assert.equal(op.options.useCache,false);
   if(op.method==="put"){assert.equal(op.options.allowOverwrite,false);assert.equal(op.options.addRandomSuffix,false);}
  }
  failure=true;
  await assert.rejects(store.saveShare(p),/Mock blob unavailable/);
  await assert.rejects(store.readShare(id),/Mock blob unavailable/);
  console.log("Mock Blob checks passed: configuration, OIDC/token selection, private access, stable IDs, immutable snapshots, independent instance, concurrency, no disk fallback.");
 }finally{
  for(const key of ["NODE_ENV","VERCEL","SHARE_STORAGE_DIR","BLOB_STORE_ID","BLOB_READ_WRITE_TOKEN"]){
   if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];
  }
 }
})().catch(error=>{console.error(error);process.exitCode=1});
