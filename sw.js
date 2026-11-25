/* Service worker: precaches the whole app (all 365 days) for offline use and keeps it up to date automatically. Day icons (img/icons/) are cached on demand and warmed in the background into a separate cache. */
const CACHE='modc2026-2990797975';
const ICONS='modc-icons-v1';
const HASHES={"./": "66040f1cac", "index.html": "66040f1cac", "app.css": "51f203e5bd", "app.js": "bf5583131b", "manifest.webmanifest": "68200f6028", "icons/apple-touch-icon-180.png": "8e53565fb3", "icons/favicon-32.png": "ebead990b5", "icons/icon-192.png": "16b6df5a68", "icons/icon-512.png": "c86e30413a", "icons/icon-maskable-512.png": "4c284952a2", "data/2026-01.json": "a20046322c", "data/2026-02.json": "34c6d97fea", "data/2026-03.json": "22f1a471a7", "data/2026-04.json": "832f2d5b42", "data/2026-05.json": "3e4dd74737", "data/2026-06.json": "cb6a189083", "data/2026-07.json": "23940cfc32", "data/2026-08.json": "f0e5c2cb46", "data/2026-09.json": "a826b64d64", "data/2026-10.json": "4dec1ca717", "data/2026-11.json": "84955f7720", "data/2026-12.json": "5c90e5baa9", "data/about.json": "929fcb81d4", "data/icons.json": "bdcfcc587b", "data/index.json": "1270e176cb", "data/prayers.json": "0db06b7288"};
const IMGS=["img/icons/adrian_natalia-c32f7ce9.webp", "img/icons/akathist-3ef662d2.webp", "img/icons/alexander_nevsky-b0783647.webp", "img/icons/alexis-507882db.webp", "img/icons/alypius-e6e2cafa.webp", "img/icons/anastasia-8a19315c.webp", "img/icons/anastasis-ef7c490e.webp", "img/icons/anastasis2-eb70de5e.webp", "img/icons/andrew-9117bc9d.webp", "img/icons/andrew_crete-829077db.webp", "img/icons/annunciation-57fb94be.webp", "img/icons/anthony-31ee06ff.webp", "img/icons/antony_theodosius-9733263d.webp", "img/icons/artemius-9b3042cd.webp", "img/icons/ascension-21b25a9a.webp", "img/icons/athanasius-ba4cb50a.webp", "img/icons/athanasius_athos-26b7c39f.webp", "img/icons/barbara-8db9560c.webp", "img/icons/bartholomew-3c3ccc20.webp", "img/icons/basil_ostrog-9a86db13.webp", "img/icons/blind-baadd37e.webp", "img/icons/blind2-90aceaf0.webp", "img/icons/boris_gleb-1072211b.webp", "img/icons/bridegroom-76c33089.webp", "img/icons/catherine-ccc3dee0.webp", "img/icons/charalampus-61f6db94.webp", "img/icons/chonae-b02ab203.webp", "img/icons/christ_mk-62a22b90.webp", "img/icons/christ_nerezi-9e6dfdc1.webp", "img/icons/christ_ohrid-90711093.webp", "img/icons/christ_ohrid2-25b854f2.webp", "img/icons/christ_ohrid3-524d226d.webp", "img/icons/chrysostom-63e05a24.webp", "img/icons/circumcision-68589f3f.webp", "img/icons/cleansing-142bfebc.webp", "img/icons/clement-5009c595.webp", "img/icons/clement2-0fde6d0a.webp", "img/icons/communion-6ed1fb80.webp", "img/icons/communion2-8cf85b4b.webp", "img/icons/constantine_helen-17904091.webp", "img/icons/cosmas_damian-7469a7fb.webp", "img/icons/councils-1b3a9b0c.webp", "img/icons/cross-cdc64592.webp", "img/icons/crucifixion-c0c8b6f8.webp", "img/icons/cyprian_justina-1cef78d3.webp", "img/icons/cyril-a810fed4.webp", "img/icons/cyril_alex-57d087f5.webp", "img/icons/cyril_jer-67fdccab.webp", "img/icons/cyril_methodius-dcb0dc5e.webp", "img/icons/daniel_stylite-e9bbc66a.webp", "img/icons/demetrius-b372435a.webp", "img/icons/dionysius_ar-2fd56a96.webp", "img/icons/dormition-468ef117.webp", "img/icons/elijah-89cf126a.webp", "img/icons/elisha-ccb01d57.webp", "img/icons/entry_theotokos-0f8bb956.webp", "img/icons/ephraim-acc1e060.webp", "img/icons/epiphanius-5d39be56.webp", "img/icons/erasmus-f5de02bc.webp", "img/icons/eustathius-66837815.webp", "img/icons/euthymius-b60c7b9d.webp", "img/icons/ezekiel-46934db8.webp", "img/icons/faith_hope-e9458580.webp", "img/icons/feeding-b0f8e290.webp", "img/icons/forgiveness-db2e3f8b.webp", "img/icons/forty-bd59cd07.webp", "img/icons/gabriel-5b696203.webp", "img/icons/gadarene-26fc205f.webp", "img/icons/george-890c0914.webp", "img/icons/george2-113d3c6d.webp", "img/icons/gerasimus-c4c4091d.webp", "img/icons/gethsemane-022ce19f.webp", "img/icons/gregory_illum-74dfbc6b.webp", "img/icons/gregory_nyssa-79e39462.webp", "img/icons/gregory_palamas-dbdc5893.webp", "img/icons/gregory_theol-2f580b81.webp", "img/icons/gregory_wonder-c9db583f.webp", "img/icons/hodegetria-75cfb1eb.webp", "img/icons/ignatius-f1dc6dff.webp", "img/icons/irene-d7b7e253.webp", "img/icons/issue_blood-36b6cde8.webp", "img/icons/jairus-1bde6eea.webp", "img/icons/james_br-9ad41ef0.webp", "img/icons/jeremiah-0c9eab72.webp", "img/icons/joachim_anna-effdcc0d.webp", "img/icons/joannicius-ad73ba6a.webp", "img/icons/john_baptist-d48cfe3a.webp", "img/icons/john_baptist2-ae5b9a24.webp", "img/icons/john_beheading-68c322e6.webp", "img/icons/john_head-fbbcdd9f.webp", "img/icons/john_merciful-3f4b6715.webp", "img/icons/john_nativity-339bde69.webp", "img/icons/john_rila-7ca28be9.webp", "img/icons/john_theol-9e13fd46.webp", "img/icons/john_vladimir-aa808886.webp", "img/icons/joy_sorrow-b57af86e.webp", "img/icons/jude-f8d62206.webp", "img/icons/justin-3e025aaa.webp", "img/icons/kyriake-cd509c81.webp", "img/icons/ladder-2bdf82d5.webp", "img/icons/lamentation-9ff75b1d.webp", "img/icons/last_judgment-3e5652f6.webp", "img/icons/lawrence-03243a7b.webp", "img/icons/lazarus-c67d0ec4.webp", "img/icons/leper-0108156d.webp", "img/icons/luke-b12f8fe3.webp", "img/icons/luke_hellas-9b2f09c9.webp", "img/icons/maccabees-627a33c7.webp", "img/icons/magdalene-71d2eed0.webp", "img/icons/mamas-9d316b78.webp", "img/icons/mandylion-e389e71c.webp", "img/icons/marina-18194685.webp", "img/icons/mark-26148f8d.webp", "img/icons/mary_egypt-19f3c9d8.webp", "img/icons/matthew-f0305118.webp", "img/icons/maximus-3a13227b.webp", "img/icons/meeting-c7f10f4c.webp", "img/icons/menas-bd01fc1b.webp", "img/icons/micah-6c471515.webp", "img/icons/michael-ee582c94.webp", "img/icons/moses-e4f76b96.webp", "img/icons/moses_eth-fa57d8af.webp", "img/icons/myrrhbearers-23e2bb59.webp", "img/icons/nativity-034b894c.webp", "img/icons/nativity2-5f2ad4d4.webp", "img/icons/nativity_theotokos-18b77496.webp", "img/icons/naum-c21c1efe.webp", "img/icons/nestor-9f953a2b.webp", "img/icons/nicholas-c57bd5d5.webp", "img/icons/nicholas2-64fb54f8.webp", "img/icons/nicodemus-05b516e5.webp", "img/icons/onuphrius-acea1a59.webp", "img/icons/orthodoxy-16f0bd93.webp", "img/icons/pachomius-388e749b.webp", "img/icons/palm-2f9eb668.webp", "img/icons/pantocrator-3ded5e5d.webp", "img/icons/paralytic-4cf0243b.webp", "img/icons/paraskevi-f3c3ca77.webp", "img/icons/paul_thebes-16838e32.webp", "img/icons/pelagia-13903b6b.webp", "img/icons/pentecost-93cdb98d.webp", "img/icons/peter-ea62031b.webp", "img/icons/peter_moscow-966ec4ed.webp", "img/icons/peter_paul-610ce4c8.webp", "img/icons/philip-fed50533.webp", "img/icons/photius-6ddca50e.webp", "img/icons/poemen-35368fc7.webp", "img/icons/pokrov-b0979b0d.webp", "img/icons/porphyrius-9f1137ee.webp", "img/icons/prochorus-69828208.webp", "img/icons/procopius-ae2ef0a9.webp", "img/icons/publican-3d04409c.webp", "img/icons/sabbas-0640e7cf.webp", "img/icons/samaritan-514a6885.webp", "img/icons/samaritan_woman-fab0aa12.webp", "img/icons/sava-9d881f1a.webp", "img/icons/seraphim-23de308d.webp", "img/icons/sergius-1e6ca426.webp", "img/icons/sergius_bacchus-fe72ca50.webp", "img/icons/seven-479494b3.webp", "img/icons/seven_sleepers-a20ad1e1.webp", "img/icons/simeon_stylite-986d54f6.webp", "img/icons/simon-93e5bdb6.webp", "img/icons/sisoes-9d223c67.webp", "img/icons/spring-bfeda250.webp", "img/icons/spyridon-72c4c14d.webp", "img/icons/stephen-521c0079.webp", "img/icons/supper-9a7223e8.webp", "img/icons/tarasius-bcfbfd2f.webp", "img/icons/tatiana-73bb528c.webp", "img/icons/thecla-f23ba4d2.webp", "img/icons/theodore_strat-a8706a6b.webp", "img/icons/theodore_sykeon-9e0eec86.webp", "img/icons/theodore_tyron-37a01b98.webp", "img/icons/theodosius-560de845.webp", "img/icons/theophany-e9269662.webp", "img/icons/theotokos_robe-b8ee7bc8.webp", "img/icons/thomas-5057f8c0.webp", "img/icons/thomas_ap-d373265c.webp", "img/icons/three_hierarchs-6ccc6857.webp", "img/icons/timothy-b2578300.webp", "img/icons/transfiguration-aa0ddb73.webp", "img/icons/trinity-5b12c6e9.webp", "img/icons/tryphon-969dcc8e.webp", "img/icons/twelve-336d1bb6.webp", "img/icons/vladimir-1fc1acab.webp", "img/icons/walking_water-8b2dd79d.webp", "img/icons/withered-accaa03e.webp", "img/icons/xenia-efcad462.webp", "img/icons/zlata-f3454d15.webp"];
/* ---- auto-update core (shared by all three apps; generated by mksw — do not edit sw.js by hand) ----
   - A new deploy changes this file (CACHE/HASHES), so the browser installs the new worker on its next check.
   - install: precache every file, re-using unchanged files from the previous version's cache (per-file hash),
     fetching changed ones straight from the network (bypassing the HTTP cache) and verifying their hash;
     then skipWaiting() so the new version takes over at once.
   - activate: delete old version caches, clients.claim(); the page reloads itself on 'controllerchange'.
   - fetch: the page, app.js, app.css, manifest -> network first (3.5 s), cached copy when offline;
     version.json -> network only (no-store); data/fonts/icons -> cache first (versioned, immutable per deploy). */
const PREFIX=CACHE.slice(0,CACHE.lastIndexOf('-')+1);
const SHELL=new Set(['./','index.html','app.js','app.css','manifest.webmanifest']);
const scopeURL=p=>new URL(p,self.registration.scope).href;
const relOf=u=>{const s=self.registration.scope; return u.startsWith(s)?(u.slice(s.length).split(/[?#]/)[0]||'./'):null};
async function sha10(buf){const d=await crypto.subtle.digest('SHA-256',buf);return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,10)}
async function oldEntry(p,want){
  for(const k of await caches.keys()){
    if(k===CACHE||!k.startsWith(PREFIX)) continue;
    const c=await caches.open(k), m=await c.match(scopeURL('__hashes__'));
    if(!m) continue; let h; try{h=await m.json()}catch(e){continue}
    if(h[p]===want){const r=await c.match(scopeURL(p)); if(r) return r}
  }
  return null;
}
async function precache(){
  const c=await caches.open(CACHE);
  let have={}; try{const m=await c.match(scopeURL('__hashes__')); if(m) have=await m.json()}catch(e){}
  const todo=Object.keys(HASHES); let i=0;
  async function one(){
    while(i<todo.length){
      const p=todo[i++], want=HASHES[p];
      if(have[p]===want&&await c.match(scopeURL(p))) continue;
      let r=await oldEntry(p,want);
      if(!r){
        let ok=false;
        for(let a=0;a<3&&!ok;a++){
          if(a) await new Promise(res=>setTimeout(res,1500*a));
          r=await fetch(new Request(scopeURL(p),{cache:'reload'}));
          if(!r.ok) throw new Error('precache '+p+' '+r.status);
          const b=await r.clone().arrayBuffer(); ok=(await sha10(b))===want;   // the CDN may still be rolling out the deploy
        }
        if(!ok) throw new Error('precache '+p+': content does not match this version yet');
      }
      await c.put(scopeURL(p),r);
    }
  }
  await Promise.all([one(),one(),one(),one()]);
  await c.put(scopeURL('__hashes__'),new Response(JSON.stringify(HASHES),{headers:{'Content-Type':'application/json'}}));
}
let warming=null;
function warm(){
  if(warming) return warming;
  warming=caches.open(ICONS).then(async c=>{
    const want=new Set(IMGS.map(u=>scopeURL(u)));
    for(const req of await c.keys()) if(!want.has(req.url)) await c.delete(req);
    for(const u of IMGS){ if(!(await c.match(scopeURL(u)))){ try{ const r=await fetch(u); if(r.ok) await c.put(scopeURL(u),r) }catch(e){ break } } }
  }).finally(()=>{warming=null});
  return warming;
}
self.addEventListener('install',e=>{e.waitUntil(precache().then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==CACHE&&k!==ICONS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{
  if(e.data==='warm-icons') e.waitUntil(warm());
  else if(e.data==='skip-waiting') self.skipWaiting();
  else if(e.data==='version'&&e.ports&&e.ports[0]) e.ports[0].postMessage(CACHE);
});
const BLANK='<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
function fromCache(r,rel){return caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(m=>m||(rel?c.match(scopeURL(rel)):null)))}
function networkFirst(r,rel){
  return new Promise(resolve=>{
    let done=false; const fall=()=>fromCache(r,rel).then(m=>{ if(m&&!done){done=true;resolve(m)} return m });
    const t=setTimeout(fall,3500);
    fetch(r.mode==='navigate'?scopeURL(rel):r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{
      clearTimeout(t);
      if(res.ok){ if(!done){done=true;resolve(res)} }
      else fall().then(m=>{ if(!done){done=true;resolve(m||res)} });
    }).catch(()=>{ clearTimeout(t); fall().then(m=>{ if(!done){done=true;resolve(m||Response.error())} }) });
  });
}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  let rel=relOf(r.url); if(rel===null) return;
  if(r.mode==='navigate') rel='index.html';
  if(rel==='version.json'){ e.respondWith(fetch(r.url,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}}))); return }
  if(rel==='sw.js') return;
  if(SHELL.has(rel)){ e.respondWith(networkFirst(r,rel==='./'?'index.html':rel)); return }
  const isImg=rel.startsWith('img/icons/');
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{
    if(res.ok&&isImg){const cp=res.clone();caches.open(ICONS).then(c=>c.put(r,cp))} return res;
  }).catch(()=>r.mode==='navigate'?fromCache(r,'index.html'):isImg?new Response(BLANK,{headers:{'Content-Type':'image/svg+xml'}}):Response.error())));
});
