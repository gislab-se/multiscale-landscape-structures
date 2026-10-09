import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, text) => { const p = path.join(root,file); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,text); };
const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseCsv(text) {
  text=text.replace(/^\uFEFF/,'');
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(c==='"') { if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted; }
    else if(!quoted&&(c===','||c==='\n')){row.push(field.replace(/\r$/,''));field='';if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}
    else field+=c;
  }
  if(field||row.length){row.push(field);rows.push(row);}
  if(quoted)throw new Error('Unterminated CSV quote');
  return rows;
}
const colours=['#5F625C','#E2DB9B','#5B4938','#183D24','#EFE36F'];
const names=['Rocky coastal landscape','Sandy coastal landscape','Agricultural fracture-valley landscape','Forested fracture-valley landscape','Plain and agricultural landscape'];
const factors=['Fracture valleys and steep relief','Aeolian sand and sandy coast','Forest and protected nature','Settlement and built structure','Low-lying open land'];
const counts=parseCsv(read('docs/data/type-counts.csv')).slice(1);
const manifest=JSON.parse(read('docs/data/source-manifest.json'));
const resolutionRows=[['Resolution','Source cells / displayed hexagons','Reading level'],...manifest.files.slice(0,5).map((f,i)=>[`R${[10,9,8,7,6][i]}`,Number(f.feature_count).toLocaleString('en-GB'),['Source detail','Local','Regional','Overview','Whole island'][i]])];
const headerNames={v9_class_k8:'v9 cluster',v9_name:'Structure',v10_type_id:'v10 type',v10_type_name:'Landscape type',interpretation_rule:'Interpretation rule',confidence:'Confidence',n_hex:'R10 cells',pct:'Share (%)',description:'Interpretation',factor:'Factor',variable:'Analytical variable identifier',loading:'Loading',metric:'Metric',value:'Value'};
const tables=new Map();
for(const name of ['landscape-types','crosswalk','type-counts','run-summary','top-factor-loadings'])tables.set(name,parseCsv(read(`docs/data/${name}.csv`)));
tables.set('resolutions',resolutionRows);
const tableHtml = rows => `<div class="table-wrap"><table><thead><tr>${rows[0].map(h=>`<th scope="col">${escape(headerNames[h]||h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('\n')}</tbody></table></div>`;
const tableMarkdown = rows => `\n${rows.map((row,i)=>'| '+row.map(s=>String(s).replace(/\|/g,'\\|')).join(' | ')+' |'+(i===0?'\n| '+row.map(()=>'---').join(' | ')+' |':'')).join('\n')}\n`;
const inline = text => escape(text).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function renderMarkdown(text) {
  const output=[];let list=null;const headings=[];
  const close=()=>{if(list){output.push(`</${list}>`);list=null;}};
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim();
    if(!line){close();continue;}
    if(line.startsWith('# '))continue;
    const h=line.match(/^(#{2,3}) (.+)$/);
    if(h){close();const level=h[1].length,id=slug(h[2]);output.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`);if(level===2)headings.push([id,h[2]]);continue;}
    const table=line.match(/^\{\{table:([\w-]+)\}\}$/);
    if(table){close();output.push(tableHtml(tables.get(table[1])));continue;}
    const item=line.match(/^(?:(-) |(\d+)\. )(.+)$/);
    if(item){const kind=item[1]?'ul':'ol';if(list!==kind){close();list=kind;output.push(`<${kind}>`);}output.push(`<li>${inline(item[3])}</li>`);continue;}
    close();output.push(`<p>${inline(line)}</p>`);
  }
  close();return {html:output.join('\n'),headings};
}
const header = base => `<header class="masthead"><a class="brand" href="${base}">GISLab <span aria-hidden="true">/</span> Multiscale Landscape Structures</a><nav aria-label="Publication"><a href="${base}">Overview</a><a href="${base}report/">Report</a><a href="${base}map/">Map</a><a href="${base}factor-loadings/">Factor loadings</a></nav></header>`;
const footer = base => `<footer class="footer"><span>GISLab · Bornholm, Denmark · English publication updated 9 October 2026</span><span><a href="${base}report/#references-and-attribution">References &amp; attribution</a> · <a href="${base}data/source-manifest.json">Data provenance</a></span></footer>`;
function page(title,body,base='./',description='Bornholm landscape structure analysis: five interpreted landscape types, eight analytical structures and a multiscale H3 map.'){
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#315b48"><title>${escape(title)} | GISLab</title><link rel="stylesheet" href="${base}assets/site.css"><link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml"></head><body><a class="skip" href="#main">Skip to content</a><div class="shell">${header(base)}<main id="main">${body}</main>${footer(base)}</div></body></html>\n`;
}

// This geographic preview is drawn directly from the distributed R8 geometry.
// The simple latitude-adjusted projection is visual only; it is not an area calculation.
const geo=JSON.parse(read('docs/data/landscape-r8.geojson'));
const rings=geo.features.flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates:f.geometry.coordinates.flat());
const points=rings.flat();const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
const minX=Math.min(...xs),maxY=Math.max(...ys),cos=Math.cos(55.14*Math.PI/180);
const paths=geo.features.map(f=>{
  const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  const d=polygons.map(poly=>poly.map(ring=>ring.map((p,i)=>`${i?'L':'M'}${((p[0]-minX)*cos*1000).toFixed(2)},${((maxY-p[1])*1000).toFixed(2)}`).join(' ')+'Z').join(' ')).join(' ');
  return `<path d="${d}" fill="${colours[Number(f.properties.v10_type_id.slice(-2))-1]}"/>`;
});
const width=(Math.max(...xs)-minX)*cos*1000,height=(maxY-Math.min(...ys))*1000;
write('docs/assets/bornholm-preview.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 ${width+28} ${height+28}" role="img" aria-labelledby="title"><title id="title">Bornholm landscape types at H3 R8</title><g stroke="#f7f4ed" stroke-width=".13" fill-rule="evenodd">${paths.join('')}</g></svg>`);
write('docs/assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 3 57 17v30L32 61 7 47V17Z" fill="#315b48"/><path d="m18 39 10-20 9 13 9-9v22H18Z" fill="#efe36f"/></svg>');
const typesHtml=counts.map((row,i)=>`<article class="type" style="--type:${colours[i]}"><span class="id">${escape(row[0])}</span><h3>${escape(names[i])}</h3><strong>${escape(row[3])}%</strong><p>${Number(row[2]).toLocaleString('en-GB')} source cells</p></article>`).join('');
const buttons=`<div class="actions"><a class="button primary" href="report/">Report</a><a class="button" href="map/">Map</a><a class="button" href="report/bornholm-landscape-structure-report.pdf" download>Download report</a><a class="button" href="factor-loadings/">Factor loadings</a></div>`;
const landing=`<section class="hero" aria-labelledby="publication-title"><div><span class="eyebrow">Integrated report · Bornholm</span><h1 id="publication-title">Landscape Structure Analysis</h1><p class="lead">From local terrain to regional patterns. Explore how landscape metrics, five factors and eight clusters become five interpreted landscape types.</p>${buttons}<details class="technical"><summary>Technical material v10</summary><ul><li><a href="data/crosswalk.csv" download>Cluster-to-type crosswalk</a></li><li><a href="data/factor-loadings.csv" download>Complete factor-loading matrix</a></li><li><a href="data/type-counts.csv" download>Landscape-type counts</a></li><li><a href="report/bornholm-landscape-structure-report.md" download>Report source (Markdown)</a></li><li><a href="data/source-manifest.json">Source and adaptation manifest</a></li></ul></details></div><figure class="hero-art"><a href="map/" aria-label="Open the interactive Bornholm landscape map"><img src="assets/bornholm-preview.svg" alt="Bornholm mapped in the five landscape-type colours at resolution R8" width="420" height="360"></a><figcaption>Bornholm · Five landscape types · R8 overview<br><a href="map/">Explore the interactive map →</a></figcaption></figure></section>
<div class="facts" aria-label="Analysis at a glance"><div class="fact"><strong>47,117</strong><span>Source cells at H3 R10</span></div><div class="fact"><strong>5 factors</strong><span>Continuous landscape signals</span></div><div class="fact"><strong>8 → 5</strong><span>Clusters to interpreted types</span></div><div class="fact"><strong>R10–R6</strong><span>Detail to whole-island views</span></div></div>
<section class="section" aria-labelledby="method"><h2 id="method">How the landscape is read</h2><p class="section-intro">The analysis connects the character of individual places with their surrounding landscape. v10 interprets the existing v9 results through a documented crosswalk.</p><div class="steps"><article class="step"><span class="step-num">01 / CONTEXT</span><h3>Landscape measures</h3><p>GIS layers describe relief, coast and sand, forest, protected nature, settlement and open agricultural land. Contextual measures capture patterns across neighbourhood scales.</p></article><article class="step"><span class="step-num">02 / STRUCTURE</span><h3>Factors and clusters</h3><p>Five factors summarize the main landscape signals. Eight clusters distinguish cells with similar combinations of those signals.</p></article><article class="step"><span class="step-num">03 / INTERPRETATION</span><h3>Landscape types</h3><p>An explicit crosswalk translates the clusters into five communicable types, with a factor-based split of the mixed agricultural landscape.</p></article></div></section>
<section class="section" aria-labelledby="types"><h2 id="types">Five landscape types</h2><p class="section-intro">Open agricultural settings dominate the source-cell distribution. Coastal and forested types reveal distinct structural contexts within that broader landscape.</p><div class="distribution" aria-hidden="true">${counts.map((row,i)=>`<span style="--type:${colours[i]};--share:${row[3]}%"></span>`).join('')}</div><div class="type-grid">${typesHtml}</div><p class="subtle">Shares of R10 source-cell counts, rounded to one decimal place. These are not exact area-weighted land-cover statistics.</p></section>
<section class="section two-column"><div><h2>One landscape, several scales</h2><p>Start with the whole island, then zoom into local structure. Auto adjusts the displayed resolution, or choose R10–R6 manually. Switch between landscape types, original structures and continuous factor scores.</p><p>Coarser views summarize the source cells; they do not fit a new model. Analytical neighbourhood scales and map display resolutions serve different purposes.</p><a class="button primary" href="map/">Open the map →</a></div><div><h3>The five factor signals</h3><ul class="factor-list">${factors.map((f,i)=>`<li><b>F${i+1}</b> ${escape(f)}</li>`).join('')}</ul><p><a href="factor-loadings/">Inspect the factor loadings →</a></p></div></section>
<section class="section"><h2>Interpretation and further use</h2><p class="section-intro">Use the types to compare landscape contexts, discuss regional patterns and guide further landscape research or planning. Read them together with the factor scores and surrounding geography.</p><div class="note">v10 is an interpreted synthesis of the existing eight-cluster solution. The classification has not been field-verified. Local decisions require additional evidence and review.</div><p><a href="report/">Read the full method, crosswalk and limitations →</a></p></section>`;
write('docs/index.html',page('Multiscale Landscape Structures',landing));
const markdown=read('content/report.md');
const rendered=renderMarkdown(markdown);
const reportBody=`<div class="page-title"><span class="eyebrow">Integrated report · v10</span><h1>Bornholm Landscape Structure Analysis</h1><p class="lead">Method, factors, structures and interpreted landscape types.</p><div class="actions"><a class="button primary" href="../map/">Interactive map</a><a class="button" href="bornholm-landscape-structure-report.pdf" download>Download PDF</a><a class="button" href="bornholm-landscape-structure-report.md" download>Download Markdown</a><a class="button" href="../factor-loadings/">Factor loadings</a></div></div><div class="report-layout"><nav class="toc" aria-label="Report contents">${rendered.headings.map(([id,title])=>`<a href="#${id}">${escape(title)}</a>`).join('')}</nav><article class="report">${rendered.html}</article></div>`;
write('docs/report/index.html',page('Bornholm Landscape Structure Analysis',reportBody,'../'));
write('docs/report/bornholm-landscape-structure-report.md',markdown.replace(/\{\{table:([\w-]+)\}\}/g,(_,name)=>tableMarkdown(tables.get(name))));
const loadingRows=parseCsv(read('docs/data/factor-loadings.csv'));
const loadingBody=`<div class="page-title"><span class="eyebrow">Supporting model table</span><h1>Factor loadings</h1><p class="lead">${loadingRows.length-1} contextual variables × five factors. The complete source matrix is preserved.</p><div class="actions"><a class="button primary" href="../data/factor-loadings.csv" download>Download CSV</a><a class="button" href="../report/#factors">Read the factor interpretation</a></div></div><p>Loadings show the relationship between an analytical input variable and a factor. Use the original variable identifiers to trace the model inputs. They retain source dataset names and neighbourhood suffixes.</p><ul class="factor-list">${factors.map((f,i)=>`<li><b>F${i+1}</b> ${escape(f)}</li>`).join('')}</ul><p class="subtle">Cell colour indicates the sign and magnitude of the loading. Negative values are blue and positive values are red. Colour intensity uses a display range of −1 to +1.</p><div class="table-wrap"><table class="loading-table"><thead><tr>${loadingRows[0].map(h=>`<th scope="col">${h==='variable'?'Analytical variable identifier':escape(h)}</th>`).join('')}</tr></thead><tbody>${loadingRows.slice(1).map(row=>`<tr><td>${escape(row[0])}</td>${row.slice(1).map(value=>{const v=Number(value);return `<td style="background:${v<0?'rgba(79,109,154,':'rgba(182,95,87,'}${(Math.min(Math.abs(v),1)*.3).toFixed(3)})">${v.toFixed(4)}</td>`;}).join('')}</tr>`).join('\n')}</tbody></table></div>`;
write('docs/factor-loadings/index.html',page('Factor loadings',loadingBody,'../'));
console.log(JSON.stringify({pages:3,sourceCells:47117,factorVariables:loadingRows.length-1,reportSections:rendered.headings.length}));
