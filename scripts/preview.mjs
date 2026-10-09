import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs');
const prefix = '/multiscale-landscape-structures';
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml','.pdf':'application/pdf','.csv':'text/csv; charset=utf-8','.md':'text/markdown; charset=utf-8','.png':'image/png' };
const server = http.createServer((req,res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400);res.end();return; }
  if(urlPath===prefix){res.writeHead(302,{Location:prefix+'/'});res.end();return;}
  if(urlPath.startsWith(prefix+'/'))urlPath=urlPath.slice(prefix.length);
  const file = path.resolve(root,'.'+urlPath+(urlPath.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file).pipe(res);
});
server.listen(4173,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:4173${prefix}/`));
