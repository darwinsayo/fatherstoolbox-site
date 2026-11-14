// Builds public/parishtimes/prototype/region-map.json from data/dioceses.json and the three live pages.
// Usage: npm i --no-save us-atlas@3.0.1 topojson-client@3.1.0 d3-geo@3.1.1 (or set NODE_PATH), then
//   node build-region-map.cjs <dioceses.json> <out.json> <live page index.html>...
const fs=require("fs"), path=require("path");
const topo=require('topojson-client');
const us=require('us-atlas/counties-albers-10m.json');
const [,, registryPath, outPath, ...parishFiles]=process.argv;
const reg=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const ST={KY:'21',OH:'39',IN:'18',TN:'47',IL:'17',MI:'26',PA:'42',WV:'54',VA:'51',MO:'29',NC:'37',GA:'45'};
const REGION=['KY','OH','IN'];
const counties=us.objects.counties.geometries;
const norm=s=>s.toLowerCase().replace(/[^a-z]/g,'');
const byState={}; for(const g of counties){const s=g.id.slice(0,2); (byState[s]=byState[s]||[]).push(g);}
const assigned={}; const problems=[];
for(const d of reg.dioceses){ if(!d.counties) continue;
  for(const [st,list] of Object.entries(d.counties)){ if(list==='rest-of-state') continue;
    for(const n of list){ const g=byState[ST[st]].find(g=>norm(g.properties.name)===norm(n));
      if(!g){problems.push(`no county ${st}:${n} (${d.id})`);continue;}
      if(assigned[g.id]) problems.push(`${st}:${n} in both ${assigned[g.id]} and ${d.id}`);
      assigned[g.id]=d.id; } } }
for(const d of reg.dioceses){ if(!d.counties) continue;
  for(const [st,list] of Object.entries(d.counties)) if(list==='rest-of-state')
    for(const g of byState[ST[st]]) if(!assigned[g.id]) assigned[g.id]=d.id; }
for(const st of REGION) for(const g of byState[ST[st]]) if(!assigned[g.id]) problems.push('unassigned '+st+':'+g.properties.name);
const tally={}; for(const v of Object.values(assigned)) tally[v]=(tally[v]||0)+1;
// projection frame: bbox of region states
const regionStates=us.objects.states.geometries.filter(g=>REGION.map(s=>ST[s]).includes(g.id));
const feat=topo.feature(us,{type:'GeometryCollection',geometries:regionStates});
let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
const walk=c=>{ if(typeof c[0]==='number'){x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);y0=Math.min(y0,c[1]);y1=Math.max(y1,c[1]);} else c.forEach(walk); };
feat.features.forEach(f=>walk(f.geometry.coordinates));
const pad=8, S=1000/(x1-x0+2*pad);
const P=([x,y])=>[+((x-x0+pad)*S).toFixed(1),+((y-y0+pad)*S).toFixed(1)];
const W=1000, H=+((y1-y0+2*pad)*S).toFixed(1);
const toPath=geom=>{ const polys=geom.type==='Polygon'?[geom.coordinates]:geom.type==='MultiPolygon'?geom.coordinates:[];
  return polys.map(rings=>rings.map(r=>'M'+r.map(P).map(p=>p.join(',')).join('L')+'Z').join('')).join(''); };
const lineToPath=geom=>{ const ls=geom.type==='LineString'?[geom.coordinates]:geom.coordinates; return ls.map(l=>'M'+l.map(P).map(p=>p.join(',')).join('L')).join(''); };
const dioceses={};
for(const d of reg.dioceses){ const gs=counties.filter(g=>assigned[g.id]===d.id); if(!gs.length) continue;
  const m=topo.merge(us,gs); dioceses[d.id]={d:toPath(m), counties:gs.length};
  // label point: area-weighted centroid of member county bboxes (simple)
  let sx=0,sy=0,n=0; for(const g of gs){ const f=topo.feature(us,g); let a=1e9,b=1e9,c=-1e9,e=-1e9; const w=k=>{ if(typeof k[0]==='number'){a=Math.min(a,k[0]);c=Math.max(c,k[0]);b=Math.min(b,k[1]);e=Math.max(e,k[1]);} else k.forEach(w)}; w(f.geometry.coordinates); sx+=(a+c)/2; sy+=(b+e)/2; n++; }
  dioceses[d.id].label=P([sx/n,sy/n]); }
// partial coverage (Cincinnati area) shape
const partial={};
for(const d of reg.dioceses){ const cv=d.coverage&&d.coverage.counties; if(!cv) continue;
  const gs=[]; for(const [st,list] of Object.entries(cv)) for(const n of list){ const g=byState[ST[st]].find(g=>norm(g.properties.name)===norm(n)); if(g) gs.push(g); }
  partial[d.id]=toPath(topo.merge(us,gs)); }
// state outlines: region states, plus neighbours for context
const ctx=['IL','MI','PA','WV','VA','MO','TN'];
const states={}; for(const g of us.objects.states.geometries){ const k=Object.keys(ST).find(k=>ST[k]===g.id); if(k&&(REGION.includes(k)||ctx.includes(k))) states[k]=toPath(topo.feature(us,g).geometry); }
const inner=topo.mesh(us,us.objects.states,(a,b)=>a!==b&&[a,b].some(g=>REGION.map(s=>ST[s]).includes(g.id)));
// parishes: project lat/lng with the same Albers USA used by us-atlas
const geo=require('d3-geo'); const proj=geo.geoAlbersUsa().scale(1300).translate([487.5,305]);
const parishes=[];
for(const f of parishFiles){ const id=path.basename(path.dirname(f)); const html=fs.readFileSync(f,'utf8');
  const line=html.split('\n').find(l=>l.startsWith('const DATA = ')); const data=JSON.parse(line.slice(13).replace(/;\s*$/,''));
  for(const p of data.parishes){ const xy=proj([p.lng,p.lat]); if(!xy) continue; const [x,y]=P(xy);
    parishes.push({d:id,n:p.name,t:p.town,lat:p.lat,lng:p.lng,x,y,v:p.mass.length?1:0}); } }
fs.writeFileSync(outPath, JSON.stringify({w:W,h:H,states,stateLines:lineToPath(inner),dioceses,partial,parishes}));
console.log('W,H',W,H,'tally',tally,'parishes',parishes.length); if(problems.length) console.log('PROBLEMS',problems);
