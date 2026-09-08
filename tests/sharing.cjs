const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
function load(file, overrides={}) {
 const source = ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const module={exports:{}};
 new Function("require","module","exports",source)(name=>overrides[name]||require(name),module,module.exports);
 return module.exports;
}
const profile=load("lib/profile.ts");
const sharing=load("lib/sharing.ts",{"./profile":profile});
const p=structuredClone(profile.initial);
p.name="Trần Ánh 🌱";p.about="Kỹ sư phần mềm\nTôi yêu TypeScript & thiết kế.";
const encoded=sharing.encodeProfile(p);
assert.deepEqual(sharing.decodeProfile(encoded),p);
assert.equal(profile.safeUrl("javascript:alert(1)"),"");
assert.throws(()=>sharing.validateProfile({...p,email:"wrong"}));
assert.throws(()=>sharing.validateProfile({...p,cv:"data:text/html,hello"}));
assert.throws(()=>sharing.validateProfile({...p,projects:[{...p.projects[0],url:"javascript:alert(1)"}]}));
assert.throws(()=>sharing.decodeProfile("broken-data"));
assert.throws(()=>sharing.decodeProfile("a".repeat(55001)));
assert.throws(()=>sharing.validateProfile({...p,experience:Array(13).fill(p.experience[0])}));
assert.throws(()=>sharing.validateProfile({...p,skills:42}));
const oldLink=sharing.encodeProfile(p);p.name="Đã chỉnh sửa";assert.notEqual(sharing.decodeProfile(oldLink).name,p.name);
assert.deepEqual(sharing.validateProfile({...p,projects:[],experience:[]}).projects,[]);
console.log("11 checks passed: Unicode round trip, URL/email validation, malformed payloads, list limits, immutable shares, empty lists.");
