import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const docs=path.join(root,'docs');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const allFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?allFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
const manifest=JSON.parse(fs.readFileSync(path.join(docs,'data/source-manifest.json'),'utf8'));
const resolutions=[10,9,8,7,6];
const expected=[47117,6854,1029,166,32];
const typeCounts={};
for(let i=0;i<5;i++){
  const bytes=fs.readFileSync(path.join(root,manifest.files[i].output));
  assert(crypto.createHash('sha256').update(bytes).digest('hex')===manifest.files[i].sha256,'Dataset checksum mismatch');
  const data=JSON.parse(bytes);
  assert(data.features.length===expected[i],`Wrong R${resolutions[i]} feature count`);
  assert(!/[åäöÅÄÖ]/.test(bytes.toString()),'Untranslated descriptive dataset string');
  for(const f of data.features){
    assert(f.properties.hex_id&&/^LT0[1-5]$/.test(f.properties.v10_type_id),'Invalid feature identifiers');
    for(const factor of ['F1','F2','F3','F4','F5'])assert(Number.isFinite(f.properties[factor]),'Missing factor value');
    if(i===0)typeCounts[f.properties.v10_type_id]=(typeCounts[f.properties.v10_type_id]||0)+1;
  }
}
const expectedCounts={LT01:2257,LT02:2984,LT03:17073,LT04:5336,LT05:19467};
for(const [id,count] of Object.entries(expectedCounts))assert(typeCounts[id]===count,`${id} counts differ from report`);
let links=0;
for(const file of allFiles(root).filter(f=>!f.includes(path.sep+'.git'+path.sep)&&!f.includes(path.sep+'.artifacts'+path.sep))){
  const rel=path.relative(root,file);
  assert(!/(speedlocal|streamlit|potential_framework|acceptance_framework)/i.test(rel),'Out-of-scope file');
  if(!/\.(html|js|css|md|csv|json|geojson|txt|svg)$/.test(file))continue;
  const text=fs.readFileSync(file,'utf8');
  if(file===fileURLToPath(import.meta.url))continue;
  assert(!/speedlocal|landskapsanalys-potential|gislab-se\.github\.io\/landskapsanalys|apps\/potential_model/i.test(text),`Out-of-scope reference: ${rel}`);
  if(!file.endsWith('.html'))continue;
  assert(/<html lang="en">/.test(text),`Non-English page: ${rel}`);
  assert(!/[åäöÅÄÖ]/.test(text),`Untranslated page: ${rel}`);
  for(const [,raw] of text.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|data:|mailto:)/.test(raw))continue;
    const [url,fragment]=raw.split('#');
    const target=url?path.resolve(path.dirname(file),decodeURIComponent(url)):file;
    const resolved=url.endsWith('/')?path.join(target,'index.html'):target;
    assert(resolved.startsWith(docs+path.sep),`Link outside publication: ${raw}`);
    assert(fs.existsSync(resolved),`Missing link target: ${rel} -> ${raw}`);
    if(fragment&&resolved.endsWith('.html'))assert(fs.readFileSync(resolved,'utf8').includes(`id="${fragment}"`),`Missing anchor: ${raw}`);
    links++;
  }
}
for(const [,url] of fs.readFileSync(path.join(docs,'assets/map.js'),'utf8').matchAll(/"url": "([^"]+)"/g))assert(fs.existsSync(path.resolve(docs,'map',url)),`Missing map dataset: ${url}`);
assert(fs.statSync(path.join(docs,'report/bornholm-landscape-structure-report.pdf')).size>10000,'PDF export missing or empty');
console.log(JSON.stringify({status:'passed',resolutions,featureCounts:expected,typeCounts,checkedInternalLinks:links}));
