/* Macedonian Orthodox Daily Calendar 2026 (4th app; copy of the MPC app with English Scripture from The Orthodox Study Bible) – offline PWA. No tracking. Bible tabs load orthodoxbibleonline.com and biblija.mk in iframes when opened (needs internet; text is not copied or cached). */
'use strict';
(function(){
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const LS={get(k,d){try{const v=localStorage.getItem('modc.'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
          set(k,v){try{localStorage.setItem('modc.'+k,JSON.stringify(v))}catch(e){}}};
const FIRST='2026-01-01', LAST='2026-12-31';
const MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON_MK=['јануари','февруари','март','април','мај','јуни','јули','август','септември','октомври','ноември','декември'];
const WD_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], WD_MK=['Пон','Вто','Сре','Чет','Пет','Саб','Нед'];
const T={
 en:{today:'Today',saints:'Saints and feasts',fasting:'Fasting',readings:'Readings',commentary:'Commentary',notes:'Notes',
     lives:'Saints of the Day — Lives and Lessons',noread:'No readings are given for this day.',search:'Search saints (English or Macedonian)',
     close:'Close',goto:'Go to date',settings:'Settings',font:'Text size',theme:'Appearance',sections:'Sections',openall:'Open all',closeall:'Close all',
     results:n=>n+' day(s) found',nores:'No saints found.',type2:'Type at least 2 letters.',
     legend:'Red = red-letter day · ★ = Great Feast · purple underline = fast day (marked “Пост”) · small number = old-style day',
     outside:d=>'Today ('+d+') is outside 2026 – showing the nearest day in this calendar.',
     offline:'Offline ready: all 365 days are stored on this device.',offlineNo:'Offline storage not available in this browser.',
     listen:'Read aloud',scopeAll:'Whole day',scopeSaints:'Saints only',scopeRead:'Readings only',scopeCom:'Commentary only',
     lEn:'English',lMk:'Macedonian',lBoth:'English, then Macedonian',voice:'Voice',reading:'Reading',paused:'Paused',done:'Finished',
     prayers:'Prayers',back:'Calendar',tapday:'Tap a day to open it.',feasts:'Feasts and red-letter days this month',mlegend:'Red = Sunday / red-letter day · ★ = Great Feast · purple underline = fast day · small number = old-style date · gold ring = today',pAll:'All prayers',pSec:{morning:'Morning prayers',table:'Prayers at table',day:'Prayers during the day',evening:'Evening prayers'},noprayers:'Could not load the prayers.',bible:'Bible',biblija:'Biblija',bibleOpen:'Open in browser',bibleOff:'The Bible needs an internet connection. You can still use the calendar and prayers offline.',bibleFail:'This page could not be shown here. You can open it in your browser.'},
 mk:{today:'Денес',saints:'Светители и празници',fasting:'Пост',readings:'Читања',commentary:'Толкување',notes:'Белешки',
     lives:'Светители на денот — житија и поуки',noread:'За овој ден нема читања.',search:'Пребарај светители (англиски или македонски)',
     close:'Затвори',goto:'Оди на датум',settings:'Поставки',font:'Големина на текст',theme:'Изглед',sections:'Делови',openall:'Отвори ги сите',closeall:'Затвори ги сите',
     results:n=>'Пронајдени денови: '+n,nores:'Нема пронајдени светители.',type2:'Внесете најмалку 2 букви.',
     legend:'Црвено = црвен ден · ★ = Голем празник · виолетова линија = пост („Пост“) · мал број = датум по стар стил',
     outside:d=>'Денешниот датум ('+d+') е надвор од 2026 – прикажан е најблискиот ден.',
     offline:'Подготвено за офлајн: сите 365 дена се зачувани на уредот.',offlineNo:'Офлајн зачувување не е достапно во овој прелистувач.',
     listen:'Читај гласно',scopeAll:'Цел ден',scopeSaints:'Само светители',scopeRead:'Само читања',scopeCom:'Само толкување',
     lEn:'Англиски',lMk:'Македонски',lBoth:'Англиски, па македонски',voice:'Глас',reading:'Се чита',paused:'Паузирано',done:'Готово',
     prayers:'Молитви',back:'Календар',tapday:'Допрете на ден за да го отворите.',feasts:'Празници и црвени денови во овој месец',mlegend:'Црвено = недела / црвен ден · ★ = Голем празник · виолетова линија = пост · мал број = датум по стар стил · златна рамка = денес',pAll:'Сите молитви',pSec:{morning:'Утрински молитви',table:'Молитви при трпеза',day:'Молитви преку денот',evening:'Вечерни молитви'},noprayers:'Молитвите не можат да се вчитаат.',bible:'Библија',biblija:'Библија',bibleOpen:'Отвори во прелистувач',bibleOff:'За Библијата е потребна интернет-врска. Календарот и молитвите и понатаму работат офлајн.',bibleFail:'Страницата не може да се прикаже овде. Можете да ја отворите во прелистувачот.'}};
let lang=LS.get('lang','en'); if(!['en','mk','both'].includes(lang)) lang='en';
const ui=()=>T[lang==='mk'?'mk':'en'];
let cur=null, months={}, index=null, notice='', prayersOpen=false, pvPushed=false, prayersP=null;
let view='day', mvM=1, dayPushed=false, pvFrom='day';
let bibleOpen=false, bibleSrc='bible', bvPushed=false, bvFrom='day', bibleLoadGen=0;
const BIBLES={
  bible:{url:'https://www.orthodoxbibleonline.com/',hash:'#bible',titleEn:'Bible',titleMk:'Библија',titleBoth:'Bible · Библија',frameTitle:'Orthodox Bible Online'},
  biblija:{url:'https://biblija.mk/biblija/',hash:'#biblija',titleEn:'Biblija',titleMk:'Библија',titleBoth:'Biblija · Библија',frameTitle:'Biblija'}
};
const vmonth=h=>/^2026-(0[1-9]|1[0-2])$/.test(h)?+h.slice(5,7):0;
const monthName=(m,mk)=>mk?MON_MK[m-1].replace(/^./,c=>c.toUpperCase()):MON_EN[m-1];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- dates ---------- */
function sydneyToday(){
  try{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Sydney',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
      const g=t=>p.find(x=>x.type===t).value; return g('year')+'-'+g('month')+'-'+g('day');}
  catch(e){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
}
function clamp(d){return d<FIRST?FIRST:d>LAST?LAST:d}
function addDays(iso,n){const t=new Date(iso+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)}
function todayInRange(){const t=sydneyToday();notice=(t<FIRST||t>LAST)?ui().outside(t):'';return clamp(t)}
const valid=d=>/^2026-\d\d-\d\d$/.test(d)&&d>=FIRST&&d<=LAST&&!isNaN(new Date(d+'T00:00:00Z'));

/* ---------- data ---------- */
function loadMonth(m){
  if(!months[m]) months[m]=fetch('data/2026-'+String(m).padStart(2,'0')+'.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(j=>{const map={};j.days.forEach(d=>map[d.date]=d);j.map=map;return j}).catch(e=>{delete months[m];throw e});
  return months[m];
}
function loadPrayers(){ if(!prayersP) prayersP=fetch('data/prayers.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(e=>{prayersP=null;throw e}); return prayersP }
let iconsP=null;
function loadIcons(){ if(!iconsP) iconsP=fetch('data/icons.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(e=>{iconsP=null;throw e}); return iconsP }
function iconBlock(ic,iso){
  const e=ic&&ic.days[iso], I=e&&ic.icons[e.i]; if(!I) return '';
  const gl=[]; if(e.g_en&&lang!=='mk') gl.push('Gospel of the day: '+e.g_en); if(e.g_mk&&lang!=='en') gl.push('Евангелие на денот: '+e.g_mk);
  const lic=I.licurl?`<a href="${esc(I.licurl)}" target="_blank" rel="noopener">${esc(I.lic)}</a>`:esc(I.lic);
  return `<figure class="dayicon"><img src="${esc(I.f)}" width="${I.w}" height="${I.h}" alt="${esc(I.en)}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('noimg')">`+
    `<figcaption><span class="ic-en">${esc(I.en)}</span><span class="ic-mk">${esc(I.mk)}</span>`+gl.map(g=>`<span class="ic-g">${esc(g)}</span>`).join('')+
    `<span class="ic-src">Source / Извор: <a href="${esc(I.src)}" target="_blank" rel="noopener">Wikimedia Commons</a> · ${esc(I.author)}${I.date?', '+esc(I.date):''} · ${lic}</span></figcaption></figure>`;
}
function loadIndex(){ if(!index) index=fetch('data/index.json').then(r=>r.json()); return index }
async function getDay(iso){const j=await loadMonth(+iso.slice(5,7));return {day:j.map[iso],month:j}}

/* ---------- settings ---------- */
const FS=[14,15,16,17,18,19,20,22,24,26,28];
let fs=LS.get('fs',18), theme=LS.get('theme','auto');
const OPEN_DEF={readings:true,commentary:true,notes:false,lives:true};
let open=Object.assign({},OPEN_DEF,LS.get('open',{}));
function applySettings(){
  document.documentElement.style.setProperty('--fs',fs+'px');
  document.documentElement.dataset.theme=theme;
  $$('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.theme===theme));
  $$('#langSeg button').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  document.documentElement.lang=lang==='mk'?'mk':'en';
  const u=ui();
  $('#btnToday').textContent=u.today; $('#btnPrayers').textContent=u.prayers; $('#btnBack').textContent='‹ '+u.back;
  $('#btnBible').textContent=u.bible; $('#btnBiblija').textContent=u.biblija; $('#btnBibleBack').textContent='‹ '+u.back;
  $('#bibleExt').textContent=u.bibleOpen;
  if(bibleOpen){ applyBibleChrome(); syncBibleOfflineMsg() }
  $('#pvTitle').textContent=lang==='both'?'Prayers · Молитви':u.prayers; $('#q').placeholder=u.search;
  $$('[data-close]').forEach(b=>b.textContent=u.close);
  $('#mTitle').textContent=u.settings;$('#mFont').textContent=u.font;$('#mTheme').textContent=u.theme;$('#mExpand').textContent=u.sections;
  $('#openAll').textContent=u.openall;$('#closeAll').textContent=u.closeall;
  TTS.labels();
}

/* ---------- render ---------- */
function det(sec,summary,body,extra){return `<details data-sec="${sec}"${open[sec]?' open':''}${extra||''}><summary>${summary}</summary>${body}</details>`}
function colour(o){return o.red?'redb':o.blue?'blue':''}
function section(L,d,month){
  const u=T[L], E=L==='en', k=x=>` data-k="${L}:${x}"`;
  let h='';
  let head,old;
  if(E){head=d.head_en;old=d.old_en}else{const i=d.head_mk.indexOf(' · по стар стил');head=d.head_mk.slice(0,i);old=d.head_mk.slice(i+3)}
  h+=`<div class="dayhead-row"><h1 class="dayhead${d.red?' red':''}"${k('hd')}>${esc(head)}</h1>${(lang!=='both'||E)&&TTS.ok?`<button type="button" class="speak" aria-label="${esc(u.listen)}" title="${esc(u.listen)}">🔊&#xFE0E;</button>`:''}</div>`;
  h+=`<p class="oldstyle"${k('old')}>${esc(old)}</p>`;
  if(d.date.slice(8)==='01'&&month.sub_en) h+=`<p class="monthsub">${esc(E?month.sub_en:month.sub_mk)}</p>`;
  if(d.gf) h+=`<p class="star"${k('star')}>${esc(E?d.star_en:d.star_mk)}</p>`;
  if(E?d.week_en:d.week_mk) h+=`<p class="week"${k('week')}>${esc(E?d.week_en:d.week_mk)}</p>`;
  h+=`<h2 class="sec">${u.saints}</h2><ul class="items">`;
  d.items.forEach((it,i)=>{h+=`<li class="${colour(it)}"${k('it'+i)}>${esc((it.plus?'+ ':'')+(E?it.en:it.mk))}${E?` <span class="mk">(${esc(it.mk)})</span>`:''}</li>`});
  h+='</ul>';
  let rb='';
  (E?d.rnotes_en:d.rnotes_mk).forEach(n=>rb+=`<p class="note">${esc(n)}</p>`);
  if(!d.readings.length) rb+=`<p class="note">${esc(u.noread)}</p>`;
  d.readings.forEach((r,i)=>{
    rb+=`<div class="reading"><h3${k('r'+i+'h')}>${esc(E?r.h_en:r.h_mk)}</h3>`;
    rb+=`<p class="text"${k('r'+i+'t')}>${esc(E?r.en:r.mk)}</p>`;
    rb+=det('commentary',u.commentary,`<p class="text"${k('r'+i+'c')}>${esc(E?r.com_en:r.com_mk)}</p>`);
    rb+='</div>';
  });
  h+=det('readings',u.readings+(d.readings.length?` <span class="small">(${d.readings.length})</span>`:''),rb);
  if(d.saints.length){
    let sb='';
    d.saints.forEach((s,i)=>{
      const nm=E?s.name_en:s.name_mk, c=colour(s);
      if(s.kind==='P'){
        sb+=`<div class="saint"><div class="nm ${c}"${k('s'+i+'n')}>${esc(nm)}</div>`;
        s.parts.forEach((p,j)=>sb+=`<p class="text"${k('s'+i+'p'+j)}><span class="lab">${esc(E?p.lab_en:p.lab_mk)}. </span>${esc(E?p.en:p.mk)}</p>`);
        sb+='</div>';
      } else sb+=`<div class="saint"><p class="text"${k('s'+i+'p0')}><span class="nm ${c}">${esc(nm)}. </span>${esc(E?s.parts[0].en:s.parts[0].mk)}</p></div>`;
    });
    h+=det('lives',u.lives,sb);
  }
  return h;
}
async function show(iso,opts){
  if(prayersOpen) closePrayers();
  if(bibleOpen) closeBible();
  iso=clamp(iso); cur=iso;
  if(view!=='day'){ view='day'; document.body.classList.remove('mv'); $('#month').hidden=true; $('.mvnav').hidden=true; window.scrollTo(0,0) }
  $('#day').hidden=false; $('#month').hidden=true;
  if(location.hash!=='#'+iso) history.replaceState(null,'','#'+iso);
  updateNav();
  let r;
  let ic=null;
  try{[r,ic]=await Promise.all([getDay(iso),loadIcons().catch(()=>null)])}catch(e){$('#day').innerHTML='<p class="loading">Could not load data. '+esc(e.message)+'</p>';return}
  if(cur!==iso) return;
  const d=r.day, langs=lang==='both'?['en','mk']:[lang];
  let h=notice?`<p class="note">${esc(notice)}</p>`:'';
  langs.forEach((L,i)=>{ if(i) h+='<div class="lang-div">Превод на македонски / Macedonian translation</div>'; h+=section(L,d,r.month)});
  h+=iconBlock(ic,iso);
  const m=$('#day'); m.innerHTML=h; m.dataset.date=iso;
  m.querySelectorAll('details').forEach(x=>x.addEventListener('toggle',()=>{ if(x.dataset.prog) return; open[x.dataset.sec]=x.open;LS.set('open',open)}));
  m.querySelectorAll('.speak').forEach(b=>b.addEventListener('click',()=>TTS.fromDay()));
  TTS.refreshDay();
  if(!opts||!opts.keepScroll) window.scrollTo(0,0);
  const mo=+iso.slice(5,7); [mo-1,mo+1].filter(x=>x>=1&&x<=12).forEach(x=>loadMonth(x).catch(()=>{}));
}
function updateNav(){
  const d=new Date(cur+'T00:00:00Z'), M=d.getUTCMonth(), D=d.getUTCDate(), wd=(d.getUTCDay()+6)%7;
  $('#navDate').textContent=lang==='mk'?`${WD_MK[wd]}, ${D} ${MON_MK[M]} 2026`:`${WD_EN[wd]}, ${D} ${MON_EN[M]} 2026`;
  const o=new Date(Date.UTC(2026,M,D-13)); const oy=o.getUTCFullYear()!==2026?' '+o.getUTCFullYear():'';
  $('#navOld').textContent=lang==='mk'?`по стар стил: ${o.getUTCDate()} ${MON_MK[o.getUTCMonth()]}${oy}`:`Old style: ${o.getUTCDate()} ${MON_EN[o.getUTCMonth()]}${oy}`;
  $('#btnPrev').disabled=cur<=FIRST; $('#btnNext').disabled=cur>=LAST;
  $('#btnMonthLbl').textContent=monthName(M+1,lang==='mk')+' 2026';
  $('#btnToday').classList.toggle('on',cur===clamp(sydneyToday()));
}
const step=n=>{const t=addDays(cur,n); if(t>=FIRST&&t<=LAST) show(t)};

/* ---------- prayers (morning, day, evening) ---------- */
function defaultPOpen(){
  let h=12; try{h=+new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',hour:'numeric',hourCycle:'h23'}).format(new Date())%24}catch(e){h=new Date().getHours()}
  return {morning:h>=3&&h<12, table:false, day:h>=12&&h<17, evening:h>=17||h<3};
}
let popen=Object.assign(defaultPOpen(),LS.get('popen',{}));
const ptext=t=>esc(t).replace(/~([^~]+)~/g,'<span class="rub">$1</span>').replace(/\(([^)]+)\)/g,'<span class="rub">($1)</span>');
function prayerBlock(p,L,si,pi){
  const g=f=>p[f+'_'+L]||'', k=x=>` data-k="${L}:p${si}.${pi}.${x}"`; let h='';
  if(g('title')) h+=`<h3 class="ptitle"${k('t')}>${esc(g('title'))}${g('sub')?`<span class="psub">${esc(g('sub'))}</span>`:''}</h3>`;
  if(g('rubric')) h+=`<p class="rubric"${k('r')}>${esc(g('rubric'))}</p>`;
  g('text').split('\n\n').filter(Boolean).forEach((t,j)=>h+=`<p class="${/^~[^~]+~$/.test(t)?'rubric':'text ptext'}"${k('x'+j)}>${ptext(t)}</p>`);
  if(g('after')) h+=`<p class="rubric"${k('a')}>${esc(g('after'))}</p>`;
  return h;
}
async function renderPrayers(){
  const box=$('#prayers'); let d;
  try{d=await loadPrayers()}catch(e){ if(prayersOpen) box.innerHTML=`<p class="loading">${esc(ui().noprayers)} ${esc(e.message)}</p>`; return }
  if(!prayersOpen) return;
  const u=ui(), langs=lang==='both'?['en','mk']:[lang], L0=langs[0];
  let h=`<div class="dayhead-row"><h1 class="dayhead">${esc(lang==='both'?'Prayers · Молитви':u.prayers)}</h1>${TTS.ok?`<button type="button" class="speak" aria-label="${esc(u.listen)}" title="${esc(u.listen)}">🔊&#xFE0E;</button>`:''}</div>`;
  d.sections.forEach((s,si)=>{
    const title=langs.map(L=>esc(s['title_'+L])).join(' · '), sub=langs.map(L=>s['sub_'+L]).filter(Boolean).map(esc).join(' · ');
    let b=sub?`<p class="psecsub">${sub}</p>`:'';
    s.prayers.forEach((p,pi)=>{ b+='<div class="prayer">'+langs.map((L,li)=>(li?'<div class="pmk">':'')+prayerBlock(p,L,si,pi)+(li?'</div>':'')).join('')+'</div>' });
    h+=`<details class="psec" data-psec="${s.id}"${popen[s.id]?' open':''}><summary data-k="${L0}:s${si}">${title} <span class="small">(${s.prayers.length})</span></summary>${b}</details>`;
  });
  h+=`<p class="pcredit">${esc(d.credit_en)}</p>`; if(lang!=='en') h+=`<p class="pcredit">${esc(d.credit_mk)}</p>`;
  box.innerHTML=h; box.dataset.date='prayers';
  box.querySelectorAll('details.psec').forEach(x=>x.addEventListener('toggle',()=>{ if(x.dataset.prog) return; popen[x.dataset.psec]=x.open; LS.set('popen',popen)}));
  box.querySelectorAll('.speak').forEach(b=>b.addEventListener('click',()=>TTS.fromDay()));
  TTS.refreshDay();
}
function openPrayers(push){
  closePanels();
  if(bibleOpen) closeBible();
  if(!prayersOpen){
    pvFrom=view; prayersOpen=true; document.body.classList.add('pv'); $('#day').hidden=true; $('#month').hidden=true; $('#prayers').hidden=false; $('.pvnav').hidden=false;
    $('#btnPrayers').classList.add('on'); $('#btnToday').classList.remove('on');
    if(push){ history.pushState(null,'','#prayers'); pvPushed=true } else if(location.hash!=='#prayers') history.replaceState(null,'','#prayers');
    window.scrollTo(0,0); TTS.labels();
  }
  return renderPrayers();
}
function closePrayers(){
  if(!prayersOpen) return; prayersOpen=false; pvPushed=false;
  document.body.classList.remove('pv'); $('#day').hidden=false; $('#prayers').hidden=true; $('#prayers').innerHTML=''; $('.pvnav').hidden=true;
  $('#btnPrayers').classList.remove('on'); TTS.labels();
}
function backToCalendar(){ if(pvPushed){ history.back(); return } if(pvFrom==='month') showMonth(mvM); else show(cur) }

/* ---------- Bible tabs (embed sites in an iframe; text is not copied or cached) ---------- */
function bibleSpec(src){ return BIBLES[src==='biblija'?'biblija':'bible'] }
function applyBibleChrome(){
  const b=bibleSpec(bibleSrc), u=ui();
  $('#bvTitle').textContent=lang==='both'?b.titleBoth:(lang==='mk'?b.titleMk:b.titleEn);
  $('#bibleExt').setAttribute('href',b.url); $('#bibleExt').textContent=u.bibleOpen;
  $('#bibleFrame').title=b.frameTitle;
  $('#btnBible').classList.toggle('on',!!(bibleOpen&&bibleSrc==='bible'));
  $('#btnBiblija').classList.toggle('on',!!(bibleOpen&&bibleSrc==='biblija'));
}
function syncBibleOfflineMsg(){
  const box=$('#bibleOffline'), u=ui();
  box.innerHTML=lang==='both'?`<p>${esc(T.en.bibleOff)}</p><p>${esc(T.mk.bibleOff)}</p>`:`<p>${esc(u.bibleOff)}</p>`;
}
function showBibleFallback(){
  const b=bibleSpec(bibleSrc), u=ui(), box=$('#bibleFallback'), fr=$('#bibleFrame');
  const msg=lang==='both'?`<p>${esc(T.en.bibleFail)}</p><p>${esc(T.mk.bibleFail)}</p>`:`<p>${esc(u.bibleFail)}</p>`;
  box.innerHTML=msg+`<p><a id="bibleFallbackOpen" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(u.bibleOpen)}</a></p>`;
  box.hidden=false; if(fr) fr.hidden=true;
}
function resetBibleFrame(){
  const old=$('#bibleFrame'); if(!old) return null;
  const fr=old.cloneNode(false);
  fr.removeAttribute('src'); fr.hidden=old.hidden;
  old.replaceWith(fr);
  return fr;
}
function frameLooksBlank(fr){
  try{
    const href=fr.contentWindow&&fr.contentWindow.location&&String(fr.contentWindow.location.href||'');
    return !href||href==='about:blank'||href.startsWith('chrome-error')||href.startsWith('chrome://');
  }catch(e){ return false } // SecurityError: a cross-origin page loaded
}
function syncBibleFrame(){
  const online=navigator.onLine!==false, off=$('#bibleOffline'), fall=$('#bibleFallback'), b=bibleSpec(bibleSrc);
  let fr=$('#bibleFrame');
  syncBibleOfflineMsg(); applyBibleChrome();
  if(!online){ off.hidden=false; fall.hidden=true; fr=resetBibleFrame()||fr; fr.hidden=true; return }
  off.hidden=true;
  if(fr.getAttribute('src')!==b.url){
    const gen=++bibleLoadGen;
    fall.hidden=true;
    fr=resetBibleFrame(); fr.hidden=false;
    fr.onload=()=>{ if(gen!==bibleLoadGen) return; if(frameLooksBlank(fr)) showBibleFallback() };
    fr.onerror=()=>{ if(gen!==bibleLoadGen) return; showBibleFallback() };
    fr.setAttribute('src',b.url);
    setTimeout(()=>{ if(gen!==bibleLoadGen||!bibleOpen||navigator.onLine===false||!fall.hidden) return;
      if(frameLooksBlank($('#bibleFrame'))) showBibleFallback();
    }, 8000);
  } else { fall.hidden=true; fr.hidden=false }
}
function openBible(src, push){
  if(push===undefined && (src===true||src===false||src==null)){ push=!!src; src='bible' }
  src=src==='biblija'?'biblija':'bible';
  closePanels();
  if(prayersOpen) closePrayers();
  const want=bibleSpec(src).hash, switching=bibleOpen&&bibleSrc!==src;
  if(!bibleOpen){
    bvFrom=view; bibleOpen=true; bibleSrc=src; document.body.classList.add('bv');
    $('#day').hidden=true; $('#month').hidden=true; $('#prayers').hidden=true; $('#bible').hidden=false; $('.bvnav').hidden=false;
    $('#btnToday').classList.remove('on'); $('#btnPrayers').classList.remove('on');
    if(push){ history.pushState(null,'',want); bvPushed=true } else if(location.hash!==want) history.replaceState(null,'',want);
    window.scrollTo(0,0);
  } else if(switching){
    bibleSrc=src; bibleLoadGen++; $('#bibleFrame').removeAttribute('src'); $('#bibleFallback').hidden=true;
    if(push){ history.pushState(null,'',want); bvPushed=true } else if(location.hash!==want) history.replaceState(null,'',want);
  }
  applyBibleChrome();
  syncBibleFrame();
}
function closeBible(){
  if(!bibleOpen) return; bibleOpen=false; bvPushed=false; bibleLoadGen++;
  document.body.classList.remove('bv'); $('#bible').hidden=true; $('.bvnav').hidden=true;
  $('#btnBible').classList.remove('on'); $('#btnBiblija').classList.remove('on');
  $('#bibleFallback').hidden=true;
}
function backFromBible(){ if(bvPushed){ history.back(); return } if(bvFrom==='month') showMonth(mvM); else show(cur) }
function openBiblija(push){ return openBible('biblija', push) }

/* ---------- month view (opens on launch) ---------- */
const shortName=(n,mk)=>{let t=String(n||'').replace(/\s*[–(\[].*$/,'');
  const re=mk?/^(Светите|Светиот|Светата|Света|Свети|Преподобномаченик|Преподобномаченица|Преподобната|маченички|маченица|свештеномаченица|Св\.|Преподобните|Преподобниот|Преподобна|Преподобен|маченици|маченик|маченичка|свештеномаченици|свештеномаченик|великомаченик|великомаченица|апостоли|апостол|пророк|праведните|праведниот|праведна|блажена|блажени|рамноапостолниот|рамноапостолна|светител|отец|наш)\s+/i
                :/^(Holy|Saints?|Sts?\.|Venerable(-martyrs?)?|Great-?martyrs?|Hieromartyrs?|Martyrs?|Apostles?|Prophets?|Righteous|Blessed|Equal-to-the-Apostles|Holy-martyrs?|the|Our|Father)\s+/i;
  for(let i=0;i<6;i++){const u=t.replace(re,'');if(u===t)break;t=u}
  return t.charAt(0).toUpperCase()+t.slice(1)};
function showMonth(m,opts){
  opts=opts||{}; m=Math.min(12,Math.max(1,m||1));
  if(prayersOpen) closePrayers();
  if(bibleOpen) closeBible();
  const was=view; view='month'; mvM=m; dayPushed=false;
  document.body.classList.add('mv'); $('#day').hidden=true; $('#month').hidden=false; $('.mvnav').hidden=false;
  const h='#2026-'+String(m).padStart(2,'0');
  if(!opts.noHash&&location.hash!==h) history.replaceState(null,'',h);
  $('#btnToday').classList.remove('on');
  if(was!=='month'||!opts.keepScroll) window.scrollTo(0,0);
  return renderMonth();
}
async function renderMonth(){
  const m=mvM, mk=lang==='mk', u=ui(), today=sydneyToday();
  $('#mvTitle').textContent=monthName(m,mk)+' 2026';
  $('#mvPrev').disabled=m<=1; $('#mvNext').disabled=m>=12;
  let idx, mj=null;
  try{[idx,mj]=await Promise.all([loadIndex(),loadMonth(m).catch(()=>null)])}catch(e){$('#month').innerHTML='<p class="loading">Could not load data. '+esc(e.message)+'</p>';return}
  if(view!=='month'||mvM!==m) return;
  $('#mvSub').textContent=mj?(mk?(mj.sub_mk||''):(mj.sub_en||'')):'';
  const byD={}; idx.forEach(e=>byD[e.d]=e);
  const first=new Date(Date.UTC(2026,m-1,1)), lead=(first.getUTCDay()+6)%7, n=new Date(Date.UTC(2026,m,0)).getUTCDate();
  let g=(mk?WD_MK:WD_EN).map((w,i)=>`<div class="wd${i===6?' sun':''}">${w}</div>`).join('');
  for(let i=0;i<lead;i++) g+='<div class="blank"></div>';
  const feasts=[];
  for(let dd=1;dd<=n;dd++){
    const iso=`2026-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`, e=byD[iso]||{n:[]}, wd=(lead+dd-1)%7;
    const main=e.n.find(x=>x[2]===1)||e.n[0], nm=main?shortName(mk?main[1]:main[0],mk):'';
    if(e.g||(e.r&&wd!==6&&main&&main[2]===1)) feasts.push([iso,dd,e,main]);
    const cls=['day',e.r||wd===6?'r':'',e.g?'g':'',e.f?'f':'',wd===6?'sun':'',iso===today?'t':'',iso===cur&&iso!==today?'sel':''].filter(Boolean).join(' ');
    const lab=`${dd} ${mk?MON_MK[m-1]:MON_EN[m-1]} 2026${main?' – '+(mk?main[1]:main[0]):''}`;
    g+=`<button type="button" class="${cls}" data-d="${iso}" aria-label="${esc(lab)}"${iso===today?' aria-current="date"':''}><span class="dn">${dd}</span><span class="o">${esc((e.o||'').split(' ')[0])}</span><span class="nm">${esc(nm)}</span></button>`;
  }
  let h=notice?`<p class="note">${esc(notice)}</p>`:'';
  h+=`<div class="mgrid" id="mvGrid" role="grid">${g}</div><p class="mhint">${esc(u.tapday)}</p>`;
  if(feasts.length){
    h+=`<h2 class="sec">${esc(u.feasts)}</h2><div class="mfeasts">`+feasts.map(([iso,dd,e,main])=>{
      const wd=(new Date(iso+'T00:00:00Z').getUTCDay()+6)%7;
      const t=lang==='both'?`${esc(main[0])} <span class="small">· ${esc(main[1])}</span>`:esc(mk?main[1]:main[0]);
      return `<button type="button" class="mf${e.g?' g':''}" data-d="${iso}"><span class="mfd">${dd}<small>${(mk?WD_MK:WD_EN)[wd]}</small></span><span class="mft">${e.g?'★ ':''}${t}</span></button>`}).join('')+'</div>';
  }
  h+=`<div class="mfoot"><label><span>${esc(u.goto)}</span> <input type="date" id="mvPick" min="${FIRST}" max="${LAST}" value="${cur}"></label></div>`;
  h+=`<p class="legend">${esc(u.mlegend)}</p>`;
  const box=$('#month'); box.innerHTML=h; box.dataset.month=m;
  $('#mvPick').onchange=e=>{if(valid(e.target.value)) openDay(e.target.value)};
}
function openDay(iso){ iso=clamp(iso); if(view==='month'){ history.pushState(null,'','#'+iso); dayPushed=true } show(iso) }
function stepMonth(n){ const t=mvM+n; if(t>=1&&t<=12) showMonth(t,{keepScroll:false}) }
function backToMonth(){ const m=+cur.slice(5,7); if(dayPushed){ history.back(); return } showMonth(m) }
function openPanel(id){$$('.panel').forEach(p=>p.hidden=true);$(id).hidden=false}
function closePanels(){$$('.panel').forEach(p=>p.hidden=true)}

/* ---------- search ---------- */
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[ѓ]/g,'г').replace(/[ќ]/g,'к').replace(/ѐ/g,'е').replace(/ѝ/g,'и');
async function doSearch(){
  const q=norm($('#q').value.trim()), u=ui(), out=$('#results');
  if(q.length<2){out.innerHTML=`<div class="cnt">${u.type2}</div>`;return}
  const idx=await loadIndex(), words=q.split(/\s+/); let res=[];
  for(const e of idx){
    const hits=e.n.filter(n=>{const s=norm(n[0]+' '+n[1]);return words.every(w=>s.includes(w))});
    if(hits.length) res.push([e,hits]);
  }
  if(!res.length){out.innerHTML=`<div class="cnt">${u.nores}</div>`;return}
  out.innerHTML=`<div class="cnt">${u.results(res.length)}</div>`+res.slice(0,300).map(([e,hits])=>{
    const d=new Date(e.d+'T00:00:00Z'), lab=lang==='mk'?`${d.getUTCDate()} ${MON_MK[d.getUTCMonth()]}`:`${d.getUTCDate()} ${MON_EN[d.getUTCMonth()]}`;
    return `<button type="button" class="res" data-d="${e.d}"><div class="d">${lab} 2026 · ${lang==='mk'?'стар стил':'old style'} ${esc(e.o)}${e.g?' ★':''}</div>`+
      hits.map(n=>{const c=n[2]===1?'redb':n[2]===2?'blue':'';return `<div class="${c}">${esc(lang==='mk'?n[1]:n[0])} <span class="small">· ${esc(lang==='mk'?n[0]:n[1])}</span></div>`}).join('')+'</button>';
  }).join('');
}

/* ---------- read aloud (Web Speech API) ---------- */
const TTS=(function(){
  const S=window.speechSynthesis, ok=!!(S&&window.SpeechSynthesisUtterance);
  const st={q:[],i:0,playing:false,paused:false,date:null,key:'',token:0,hl:null};

  /* ---- keep the screen on while reading aloud.
     Screen Wake Lock API (Safari 16.4+, home-screen apps from iOS 18.4, Chrome/Android); on older iOS a tiny silent,
     muted, looping inline video (bundled below, 2 s, 16x16) is played instead, the NoSleep technique. Held only while
     speech is actually playing: released on finish, pause, stop, error-stop and when the app goes to the background;
     taken again when the app comes back while still reading. The phone's Auto-Lock setting is not changed. */
  const Awake=(function(){
    const ua=navigator.userAgent||'';
    const iosV=(()=>{let m=/(?:iPhone|iPad|iPod)[^)]*? OS (\d+)_(\d+)/.exec(ua); if(!m&&/Macintosh/.test(ua)&&navigator.maxTouchPoints>1) m=/Version\/(\d+)\.(\d+)/.exec(ua); return m?(+m[1])+(+m[2])/100:0})();
    const standalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
    // Home-screen apps before iOS 18.4 expose navigator.wakeLock but it does not keep the screen on, so use the video there.
    const wlUsable=()=>!!(navigator.wakeLock&&navigator.wakeLock.request)&&!(iosV&&iosV<18.04&&standalone());
    const MP4='data:video/mp4;base64,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';
    let want=false, lock=null, pending=null, vid=null;
    function video(){
      if(!vid){ vid=document.createElement('video'); vid.muted=true; vid.defaultMuted=true; vid.loop=true; vid.playsInline=true;
        ['muted','playsinline','webkit-playsinline','loop'].forEach(a=>vid.setAttribute(a,'')); vid.setAttribute('aria-hidden','true'); vid.setAttribute('tabindex','-1'); vid.preload='auto';
        vid.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1';
        vid.src=MP4; document.body.appendChild(vid) }
      return vid;
    }
    function playVideo(){ try{ const v=video(); if(!v.paused) return; const p=v.play(); if(p&&p.catch) p.catch(()=>{}) }catch(e){} }
    function stopVideo(){ if(vid&&!vid.paused){ try{vid.pause()}catch(e){} } }
    function acquire(){
      if(!want||document.visibilityState==='hidden') return;
      if(!wlUsable()){ playVideo(); return }
      if(lock&&!lock.released) return; if(pending) return;
      try{
        pending=navigator.wakeLock.request('screen').then(l=>{ pending=null;
          if(!want||document.visibilityState==='hidden'){ try{l.release()}catch(e){} return }
          lock=l; stopVideo(); try{ l.addEventListener('release',()=>{ if(lock===l) lock=null }) }catch(e){}
        },()=>{ pending=null; if(want) playVideo() });
      }catch(e){ pending=null; playVideo() }
    }
    function drop(){ const l=lock; lock=null; if(l){ try{ const p=l.release(); if(p&&p.catch) p.catch(()=>{}) }catch(e){} } stopVideo() }
    function on(){ want=true; acquire() }
    function off(){ want=false; drop() }
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') drop(); else if(want) acquire() });
    window.addEventListener('pagehide',drop);
    window.addEventListener('pageshow',()=>{ if(want) acquire() });
    return {on,off,get held(){return !!((lock&&!lock.released)||(vid&&!vid.paused))},get wanted(){return want},get mode(){return wlUsable()?'wakelock':'video'}};
  })();
  let scope=LS.get('tts.scope','all'), pscope=LS.get('tts.pscope','all'), tlang=LS.get('tts.lang',null), rate=+LS.get('tts.rate',1);
  const MKPREF=['mk','sr','bg','ru'], LNAME={mk:'Macedonian',sr:'Serbian',bg:'Bulgarian',ru:'Russian'}, LNAME_MK={mk:'македонски',sr:'српски',bg:'бугарски',ru:'руски'};
  const vl=v=>(v.lang||'').replace('_','-').toLowerCase();
  function voices(){try{return ok?(S.getVoices()||[]).filter(v=>!NOVELTY.test(v.name||'')):[]}catch(e){return []}}

  /* ---- voice quality (most natural first). iPhone/iPad/Mac: downloaded "Premium" and "Enhanced" voices are Apple's
     neural voices and sound far less robotic than the default "compact" ones; Android/Chrome/Edge: network/"Natural" voices.
     Novelty voices (Bells, Bubbles, Zarvox ...) are hidden; old formant voices (Eloquence: Eddy, Flo, Grandma ...; Fred, Kathy ...) go last. */
  const NOVELTY=/^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Pipe Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
  const LEGACY=/^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Fred|Junior|Kathy|Ralph|Princess|Agnes|Bruce|Vicki|Victoria)\b/i;
  const GOODV=/^(Karen|Lee|Catherine|Matilda|Gordon|Daniel|Serena|Kate|Stephanie|Arthur|Martha|Jamie|Oliver|Samantha|Ava|Zoe|Evan|Nathan|Allison|Susan|Tom|Joelle|Noelle|Nicky|Majed|Maged|Tarik|Laila|Hamed|Mariam|Milena|Daria|Katya|Yuri|Google|Microsoft)/i;
  const vtier=v=>{const n=(v.name||'')+' '+(v.voiceURI||''); return /premium/i.test(n)?2:/enhanced|neural|natural|network|wavenet/i.test(n)?1:0};
  function vq(v){
    const nm=v.name||'', n=nm+' '+(v.voiceURI||''); let s=[0,200,300][vtier(v)];
    if(LEGACY.test(nm)||/eloquence|speech\.synthesis/i.test(n)) s-=150;
    if(GOODV.test(nm)) s+=40;
    if(/compact/i.test(n)) s-=5;
    return s;
  }
  const isApple=/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent||'');
  const byQ=(pr)=>(a,b)=>{const r=x=>{const i=pr.indexOf(vl(x));return i<0?pr.length:i}; return (vq(b)-r(b)*15)-(vq(a)-r(a)*15)};
  function listFor(L){
    const vs=voices();
    if(L==='en') return vs.filter(v=>vl(v).startsWith('en')).sort(byQ(['en-au','en-gb','en-us']));
    const out=[]; MKPREF.forEach(p=>vs.filter(v=>vl(v).split('-')[0]===p&&!/latn/.test(vl(v))).sort(byQ([])).forEach(v=>out.push(v))); return out;
  }
  function voiceFor(L){const l=listFor(L), saved=LS.get('tts.voice.'+L,null); return l.find(v=>v.voiceURI===saved)||l[0]||null}
  function effLang(){return tlang||(lang==='both'?'both':lang)}
  // Macedonian letters a Serbian / Bulgarian / Russian voice may not know
  function translit(t,base){
    if(base==='sr') return t.replace(/ќ/g,'ћ').replace(/Ќ/g,'Ћ').replace(/ѓ/g,'ђ').replace(/Ѓ/g,'Ђ').replace(/ѕ/g,'дз').replace(/Ѕ/g,'Дз');
    if(base==='bg'||base==='ru'){const m={'ј':'й','Ј':'Й','љ':'ль','Љ':'Ль','њ':'нь','Њ':'Нь','ќ':'кь','Ќ':'Кь','ѓ':'гь','Ѓ':'Гь','џ':'дж','Џ':'Дж','ѕ':'дз','Ѕ':'Дз'};return t.replace(/[јЈљЉњЊќЌѓЃџЏѕЅ]/g,c=>m[c]).replace(/йа/g,'я').replace(/Йа/g,'Я').replace(/йу/g,'ю').replace(/Йу/g,'Ю')}
    return t;
  }
  function note(){
    const L=effLang(); if(L==='en') return '';
    const v=voiceFor('mk'), mkUi=lang==='mk';
    if(!v) return mkUi?'На овој телефон нема македонски, српски, бугарски или руски глас – македонскиот текст не може да се чита гласно. Додајте глас во поставките на телефонот (Пристапност → Изговорена содржина / Text-to-speech).'
                      :'No Macedonian, Serbian, Bulgarian or Russian voice on this phone, so the Macedonian text cannot be read aloud. Add a voice in the phone settings (Accessibility → Spoken Content / Text-to-speech).';
    const b=vl(v).split('-')[0]; if(b==='mk') return '';
    return mkUi?`На овој телефон нема македонски глас – се користи ${LNAME_MK[b]} (${v.lang}). Изговорот ќе биде приближен.`
               :`No Macedonian voice on this phone – using ${LNAME[b]} (${v.lang}). Pronunciation will be approximate.`;
  }
  // ---- spoken text helpers
  const clean=t=>String(t||'').replace(/★/g,'').replace(/(^|\s)\+\s*/g,'$1').replace(/[\[\]“”„"«»]/g,'').replace(/\s+[–—]\s+/g,', ').replace(/\s*·\s*/g,', ').replace(/\s+/g,' ').trim();
  const BK_EN={'Matt.':'the Gospel of Matthew','Mark':'the Gospel of Mark','Luke':'the Gospel of Luke','John':'the Gospel of John','Acts':'the Acts of the Apostles','Rom.':'Romans','1 Cor.':'First Corinthians','2 Cor.':'Second Corinthians','Gal.':'Galatians','Eph.':'Ephesians','Phil.':'Philippians','Col.':'Colossians','1 Thess.':'First Thessalonians','2 Thess.':'Second Thessalonians','1 Tim.':'First Timothy','2 Tim.':'Second Timothy','Titus':'Titus','Heb.':'Hebrews','James':'James','1 Pet.':'First Peter','2 Pet.':'Second Peter','1 John':'First John','2 John':'Second John','3 John':'Third John','Jude':'Jude','Gen.':'Genesis','Prov.':'Proverbs','Isa.':'Isaiah','Joel':'Joel','Zech.':'Zechariah'};
  const BK_MK={'Мат.':'Евангелието според Матеј','Марко':'Евангелието според Марко','Лука':'Евангелието според Лука','Јован':'Евангелието според Јован','Дела':'Делата на апостолите','Рим.':'Посланието до Римјаните','1. Кор.':'Првото послание до Коринтјаните','2. Кор.':'Второто послание до Коринтјаните','Гал.':'Посланието до Галатјаните','Ефес.':'Посланието до Ефесците','Филип.':'Посланието до Филипјаните','Кол.':'Посланието до Колошаните','1. Сол.':'Првото послание до Солуњаните','2. Сол.':'Второто послание до Солуњаните','1. Тим.':'Првото послание до Тимотеј','2. Тим.':'Второто послание до Тимотеј','Тит':'Посланието до Тит','Евр.':'Посланието до Евреите','Јак.':'Посланието на Јаков','1. Пет.':'Првото послание на Петар','2. Пет.':'Второто послание на Петар','1. Јов.':'Првото послание на Јован','2. Јов.':'Второто послание на Јован','3. Јов.':'Третото послание на Јован','Јуда':'Посланието на Јуда','Битие':'книгата Битие','Изреки':'книгата Изреки','Исаија':'книгата на пророкот Исаија','Јоил':'книгата на пророкот Јоил','Захарија':'книгата на пророкот Захарија'};
  const KIND_EN={'Apostle':'Apostle reading','Gospel':'Gospel reading','Old Testament':'Old Testament reading'};
  function chap(seg,E){
    const sep=E?':':',', w=E?{c:'chapter',v:'verse',vs:'verses',to:'to'}:{c:'глава',v:'стих',vs:'стихови',to:'до'};
    const re=new RegExp('^(\\d+)\\'+sep+'(\\d+)(?:\\s*[-–]\\s*(?:(\\d+)\\'+sep+')?(\\d+))?$'); const m=seg.trim().match(re);
    if(!m) return seg.replace(new RegExp('\\'+sep,'g'),' '+w.v+' ');
    if(!m[4]) return `${w.c} ${m[1]}, ${w.v} ${m[2]}`;
    if(m[3]) return `${w.c} ${m[1]}, ${w.v} ${m[2]}, ${w.to} ${w.c} ${m[3]}, ${w.v} ${m[4]}`;
    return `${w.c} ${m[1]}, ${w.vs} ${m[2]} ${w.to} ${m[4]}`;
  }
  function heading(h,E){
    const m=h.match(/^(.+?)(?: \((.+?)\))?: (.+?) – (.+)$/); if(!m) return clean(h);
    const BK=E?BK_EN:BK_MK, keys=Object.keys(BK).sort((a,b)=>b.length-a.length);
    let book=null, parts=[];
    for(const seg of m[3].split(/;\s*/)){
      let s=seg.trim(); const kb=keys.find(k=>s.startsWith(k+' '));
      if(kb){ if(kb!==book){book=kb; parts.push((E?'from ':'од ')+BK[kb]+', '+chap(s.slice(kb.length+1),E)); continue} s=s.slice(kb.length+1)}
      parts.push(chap(s,E));
    }
    const kind=E?(KIND_EN[m[1]]||m[1]):m[1];
    return `${kind}${m[2]?', '+m[2]:''}: ${parts.join('; ')}. ${clean(m[4])}.`;
  }
  const ABBR=/(?:^|\s)(St|Sts|Ss|Ven|Matt|Rom|Gal|Heb|Eph|Phil|Col|Gen|Isa|Prov|Zech|Cor|Thess|Tim|Pet|Mr|Mrs|Dr|cf|ch|vv?|Св|св|Свв|свв|ст|гл|сп|Мат|Рим|Гал|Евр|Ефес|Кол|Јак|Кор|Тим|Пет|Сол|Јов|Филип|[A-ZА-Ш])\.$/;
  /* ---- spoken-text clean-up, so the voice reads in a natural flow (display text is never changed):
     Bible references in full ("Gal. 5:22" -> "Galatians, chapter 5, verse 22"), abbreviations (St. -> Saint, св. -> свети,
     d. -> died, поч. -> починал ...), Roman numerals (Leo III -> Leo the Third, во IV век -> во четвртиот век), number ranges
     and slashes, brackets turned into short pauses, words in another script dropped (an English voice cannot read Cyrillic). */
  const SAY=(function(){
    const ORD_EN=['','First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth','Thirteenth','Fourteenth','Fifteenth','Sixteenth','Seventeenth','Eighteenth','Nineteenth','Twentieth','Twenty-first'];
    const ORD_MK=['','први','втори','трети','четврти','петти','шести','седми','осми','деветти','десетти','единаесетти','дванаесетти','тринаесетти','четиринаесетти','петнаесетти','шеснаесетти','седумнаесетти','осумнаесетти','деветнаесетти','дваесетти','дваесет и први'];
    const rom=s=>{const V={I:1,V:5,X:10,L:50,C:100};let n=0;for(let i=0;i<s.length;i++){const a=V[s[i]],b=V[s[i+1]]||0;n+=a<b?-a:a}return n};
    const EN_B={Matt:'Matthew',Mat:'Matthew',Mt:'Matthew',Matthew:'Matthew',Mk:'Mark',Mark:'Mark',Lk:'Luke',Luke:'Luke',Jn:'John',John:'John',Acts:'Acts',
      Rom:'Romans',Romans:'Romans',Cor:'Corinthians',Corinthians:'Corinthians',Gal:'Galatians',Galatians:'Galatians',Eph:'Ephesians',Ephesians:'Ephesians',
      Phil:'Philippians',Philippians:'Philippians',Col:'Colossians',Colossians:'Colossians',Thess:'Thessalonians',Thessalonians:'Thessalonians',
      Tim:'Timothy',Timothy:'Timothy',Tit:'Titus',Titus:'Titus',Philem:'Philemon',Philemon:'Philemon',Heb:'Hebrews',Hebrews:'Hebrews',Jas:'James',James:'James',
      Pet:'Peter',Peter:'Peter',Jude:'Jude',Rev:'Revelation',Revelation:'Revelation',Apoc:'Revelation',Gen:'Genesis',Genesis:'Genesis',Exod:'Exodus',Ex:'Exodus',Exodus:'Exodus',
      Lev:'Leviticus',Leviticus:'Leviticus',Num:'Numbers',Numbers:'Numbers',Deut:'Deuteronomy',Deuteronomy:'Deuteronomy',Josh:'Joshua',Joshua:'Joshua',Judg:'Judges',Judges:'Judges',
      Ruth:'Ruth',Sam:'Samuel',Samuel:'Samuel',Kgs:'Kings',Kings:'Kings',Kingdoms:'Kingdoms',Chr:'Chronicles',Chronicles:'Chronicles',Neh:'Nehemiah',Nehemiah:'Nehemiah',Job:'Job',
      Ps:'Psalm',Psa:'Psalm',Psalm:'Psalm',Psalms:'Psalm',Prov:'Proverbs',Proverbs:'Proverbs',Eccl:'Ecclesiastes',Ecclesiastes:'Ecclesiastes',Song:'Song of Songs',
      Wis:'Wisdom',Wisdom:'Wisdom',Sir:'Sirach',Sirach:'Sirach',Isa:'Isaiah',Is:'Isaiah',Isaiah:'Isaiah',Jer:'Jeremiah',Jeremiah:'Jeremiah',Lam:'Lamentations',Bar:'Baruch',Baruch:'Baruch',
      Ezek:'Ezekiel',Ezekiel:'Ezekiel',Dan:'Daniel',Daniel:'Daniel',Hos:'Hosea',Hosea:'Hosea',Joel:'Joel',Amos:'Amos',Obad:'Obadiah',Jonah:'Jonah',Mic:'Micah',Micah:'Micah',
      Nah:'Nahum',Nahum:'Nahum',Hab:'Habakkuk',Habakkuk:'Habakkuk',Zeph:'Zephaniah',Zephaniah:'Zephaniah',Hag:'Haggai',Haggai:'Haggai',Zech:'Zechariah',Zechariah:'Zechariah',Mal:'Malachi',Malachi:'Malachi',Macc:'Maccabees',Maccabees:'Maccabees',
      Obadiah:'Obadiah',Lamentations:'Lamentations',Esther:'Esther',Esth:'Esther',Ezra:'Ezra',Tobit:'Tobit',Tob:'Tobit',Judith:'Judith',Jdt:'Judith',Ecclus:'Sirach',Canticles:'Song of Songs',Apocalypse:'Revelation',Lk_:'Luke'};
    const MK_B={'Мат':'Евангелието според Матеј','Матеј':'Евангелието според Матеј','Мар':'Евангелието според Марко','Марко':'Евангелието според Марко','Лук':'Евангелието според Лука','Лука':'Евангелието според Лука',
      'Јов':'Евангелието според Јован','Јован':'Евангелието според Јован','Дела':'Делата на апостолите','Рим':'Посланието до Римјаните','Кор':'Посланието до Коринтјаните','Гал':'Посланието до Галатјаните',
      'Ефес':'Посланието до Ефесците','Еф':'Посланието до Ефесците','Филип':'Посланието до Филипјаните','Фил':'Посланието до Филипјаните','Кол':'Посланието до Колошаните','Сол':'Посланието до Солуњаните',
      'Тим':'Посланието до Тимотеј','Тит':'Посланието до Тит','Филим':'Посланието до Филимон','Евр':'Посланието до Евреите','Јак':'Посланието на Јаков','Пет':'Посланието на Петар','Јуда':'Посланието на Јуда',
      'Откр':'Откровението','Бит':'книгата Битие','Битие':'книгата Битие','Изл':'книгата Излез','Излез':'книгата Излез','Лев':'книгата Левит','Бр':'книгата Броеви','Број':'книгата Броеви','Пов':'книгата Второзаконие','Второзак':'книгата Второзаконие',
      'Ис':'книгата на пророкот Исаија','Суд':'книгата Судии','Цар':'книгата Царства','Пс':'Псалм','Псалм':'Псалм','Псалми':'Псалм','Изр':'книгата Изреки','Изреки':'книгата Изреки','Проп':'книгата Проповедник','Мудр':'книгата Премудрост',
      'Иса':'книгата на пророкот Исаија','Исаија':'книгата на пророкот Исаија','Ер':'книгата на пророкот Еремија','Еремија':'книгата на пророкот Еремија','Јер':'книгата на пророкот Еремија','Езек':'книгата на пророкот Езекиел','Езекиел':'книгата на пророкот Езекиел',
      'Дан':'книгата на пророкот Даниил','Даниил':'книгата на пророкот Даниил','Ос':'книгата на пророкот Осија','Јоил':'книгата на пророкот Јоил','Ам':'книгата на пророкот Амос','Јона':'книгата на пророкот Јона','Мих':'книгата на пророкот Михеј','Михеј':'книгата на пророкот Михеј',
      'Ав':'книгата на пророкот Авакум','Соф':'книгата на пророкот Софонија','Аг':'книгата на пророкот Агеј','Зах':'книгата на пророкот Захарија','Захарија':'книгата на пророкот Захарија','Мал':'книгата на пророкот Малахија','Малахија':'книгата на пророкот Малахија','Јов_':'книгата Јов'};
    const AR_B={'مت':'إنجيل متّى','متى':'إنجيل متّى','متّى':'إنجيل متّى','مر':'إنجيل مرقس','مرقس':'إنجيل مرقس','لو':'إنجيل لوقا','لوقا':'إنجيل لوقا','يو':'إنجيل يوحنّا','يوحنا':'إنجيل يوحنّا','يوحنّا':'إنجيل يوحنّا',
      'أع':'سفر أعمال الرسل','أعمال':'سفر أعمال الرسل','رو':'الرسالة إلى أهل رومية','رومية':'الرسالة إلى أهل رومية','كو':'الرسالة إلى أهل كورنثوس','كورنثوس':'الرسالة إلى أهل كورنثوس','غل':'الرسالة إلى أهل غلاطية','غلاطية':'الرسالة إلى أهل غلاطية',
      'أف':'الرسالة إلى أهل أفسس','أفسس':'الرسالة إلى أهل أفسس','في':'الرسالة إلى أهل فيلبّي','فيلبي':'الرسالة إلى أهل فيلبّي','كول':'الرسالة إلى أهل كولوسّي','كولوسي':'الرسالة إلى أهل كولوسّي','تس':'الرسالة إلى أهل تسالونيكي',
      'تي':'الرسالة إلى تيموثاوس','تيموثاوس':'الرسالة إلى تيموثاوس','تيطس':'الرسالة إلى تيطس','فل':'الرسالة إلى فيلمون','عب':'الرسالة إلى العبرانيّين','عبرانيين':'الرسالة إلى العبرانيّين','يع':'رسالة يعقوب','يعقوب':'رسالة يعقوب',
      'بط':'رسالة بطرس','بطرس':'رسالة بطرس','يه':'رسالة يهوذا','يهوذا':'رسالة يهوذا','رؤ':'سفر الرؤيا','رؤيا':'سفر الرؤيا','تك':'سفر التكوين','تكوين':'سفر التكوين','خر':'سفر الخروج','خروج':'سفر الخروج','لا':'سفر اللاويّين','لاويين':'سفر اللاويّين',
      'عد':'سفر العدد','عدد':'سفر العدد','تث':'سفر التثنية','تثنية':'سفر التثنية','يش':'سفر يشوع','يشوع':'سفر يشوع','قض':'سفر القضاة','قضاة':'سفر القضاة','صم':'سفر صموئيل','مل':'سفر الملوك','ملوك':'سفر الملوك','أي':'سفر أيّوب','أيوب':'سفر أيّوب',
      'مز':'المزمور','مزمور':'المزمور','مزامير':'المزمور','أم':'سفر الأمثال','أمثال':'سفر الأمثال','جا':'سفر الجامعة','حك':'سفر الحكمة','سي':'سفر يشوع بن سيراخ','إش':'نبوءة إشعياء','إشعياء':'نبوءة إشعياء','أش':'نبوءة إشعياء',
      'إر':'نبوءة إرميا','إرميا':'نبوءة إرميا','حز':'نبوءة حزقيال','حزقيال':'نبوءة حزقيال','دا':'نبوءة دانيال','دانيال':'نبوءة دانيال','هو':'نبوءة هوشع','يوء':'نبوءة يوئيل','يوئيل':'نبوءة يوئيل','عا':'نبوءة عاموس',
      'اشعياء':'نبوءة إشعياء','ايوب':'سفر أيّوب','امثال':'سفر الأمثال','الأمثال':'سفر الأمثال','صموئيل':'سفر صموئيل','ارميا':'نبوءة إرميا','زكريا':'نبوءة زكريّا','دانيال':'نبوءة دانيال','ميخا':'نبوءة ميخا','يوئيل':'نبوءة يوئيل','عاموس':'نبوءة عاموس','هوشع':'نبوءة هوشع','حبقوق':'نبوءة حبقوق','صفنيا':'نبوءة صفنيا','حجي':'نبوءة حجّي','ملاخي':'نبوءة ملاخي','التكوين':'سفر التكوين','الخروج':'سفر الخروج','التثنية':'سفر التثنية','العدد':'سفر العدد','اللاويين':'سفر اللاويّين','الجامعة':'سفر الجامعة','الحكمة':'سفر الحكمة','رؤيا':'سفر الرؤيا','الرؤيا':'سفر الرؤيا','أعمال':'سفر أعمال الرسل','يون':'نبوءة يونان','يونان':'نبوءة يونان','مي':'نبوءة ميخا','ميخا':'نبوءة ميخا','صف':'نبوءة صفنيا','حج':'نبوءة حجّي','زك':'نبوءة زكريّا','زكريا':'نبوءة زكريّا','ملا':'نبوءة ملاخي','ملاخي':'نبوءة ملاخي','با':'نبوءة باروخ'};
    const NUM_EN=['','First','Second','Third'], NUM_MK=['','Првото','Второто','Третото'], NUM_AR=['','الأولى','الثانية','الثالثة'];
    const W={en:{c:'chapter',v:'verse',vs:'verses',to:'to',and:'and',or:'or',cm:', '},mk:{c:'глава',v:'стих',vs:'стихови',to:'до',and:'и',or:'или',cm:', '},ar:{c:'الإصحاح',v:'الآية',vs:'الآيات',to:'إلى',and:'و',or:'أو',cm:'، '}};
    // "5:22" "5:22–26" "26–8:2" "23, 24, 28" -> words
    function verses(L,ch,rest,ps){
      const w=W[L], items=rest.split(/\s*[,،]\s*/).filter(Boolean); let many=items.length>1;
      const sp=items.map(r=>{const m=r.match(/^(\d+)\s*[-–]\s*(?:(\d+)\s*[:,]\s*)?(\d+)$/); if(!m) return r; many=true;
        return m[2]?`${m[1]} ${w.to} ${w.c} ${m[2]}${w.cm}${w.v} ${m[3]}`:`${m[1]} ${w.to} ${m[3]}`});
      const vs=sp.length>1?sp.slice(0,-1).join(w.cm)+(L==='ar'?' و':' '+w.and+' ')+sp[sp.length-1]:sp[0];
      return `${ps?'':w.c+' '}${ch}${w.cm}${many?w.vs:w.v} ${vs}`;
    }
    const VS=String.raw`(\d+(?:\s*[-–]\s*\d+(?:\s*[:,]\s*\d+)?)?(?:\s*[,،]\s*\d+(?:\s*[-–]\s*\d+)?)*)`;
    function refs(t,L){
      if(L==='en'){
        const re=new RegExp(String.raw`\b(?:([1-4])\s?)?([A-Z][a-z]{1,13})\.?\s(\d+)(?:/(\d+))?:\s?`+VS+String.raw`((?:\s*[;,]\s*\d+:\s?\d+(?:\s*[-–]\s*\d+)?)*)`,'g');
        return t.replace(re,(all,n,b,ch,ch2,vv,more)=>{ const B=EN_B[b]; if(!B) return all;
          const ps=B==='Psalm'; let s=(n?NUM_EN[+n]+' ':'')+B+(ps?' ':', ')+verses('en',ch+(ch2?' or '+ch2:''),vv,ps);
          (more||'').replace(/(\d+):\s?(\d+(?:\s*[-–]\s*\d+)?)/g,(x,c,v)=>{ s+='; '+(ps?'Psalm ':'')+verses('en',c,v,ps) }); return s });
      }
      if(L==='mk'){
        const re=new RegExp(String.raw`(?:([1-4])\.?\s?)?(?<![А-Шa-шЀ-ӿ])([А-ШЃЌЉЊЏЅЈ][а-шѓќљњџѕј]{0,9})\.?\s(\d+)(?:/(\d+))?(?:,\s?|:\s?)`+VS+String.raw`((?:\s*;\s*\d+,\s?\d+(?:\s*[-–]\s*\d+)?)*)`,'g');
        return t.replace(re,(all,n,b,ch,ch2,vv,more)=>{ let B=MK_B[b]; if(!B) return all;
          if(n){ B=B.replace(/^(Посланието|книгата|Евангелието)/,m=>m==='Посланието'?NUM_MK[+n]+' послание':m==='книгата'?NUM_MK[+n]==='Првото'?'првата книга':NUM_MK[+n]==='Второто'?'втората книга':'третата книга':m); if(b==='Цар') B=B.replace('книгата Царства','книга Царства'); if(b==='Јов') B=NUM_MK[+n]+' послание на Јован' }
          const ps=B==='Псалм'; let s=B+(ps?' ':', ')+verses('mk',ch+(ch2?' или '+ch2:''),vv,ps);
          (more||'').replace(/(\d+),\s?(\d+(?:\s*[-–]\s*\d+)?)/g,(x,c,v)=>{ s+='; '+(ps?'Псалм ':'')+verses('mk',c,v,ps) }); return s });
      }
      const re=new RegExp(String.raw`(?:([1-4])\s?)?([\u0621-\u064A\u0651]{1,9})\s(\d+)\s?:\s?`+VS+String.raw`((?:\s*[;؛،,]\s*\d+\s?:\s?\d+(?:\s*[-–]\s*\d+)?)*)`,'g');
      return t.replace(re,(all,n,b,ch,vv,more)=>{ let B=b==='كو'&&!n?'الرسالة إلى أهل كولوسّي':AR_B[b]; if(!B) return all;
        if(n) B=B.startsWith('الرسالة')?B.replace('الرسالة','الرسالة '+NUM_AR[+n]):B+' '+(['','الأوّل','الثاني','الثالث','الرابع'][+n]||n);
        const ps=B==='المزمور'; let s=B+(ps?' ':'، ')+verses('ar',ch,vv,ps);
        (more||'').replace(/(\d+)\s?:\s?(\d+(?:\s*[-–]\s*\d+)?)/g,(x,c,v)=>{ s+='؛ '+(ps?'المزمور ':'')+verses('ar',c,v,ps) }); return s });
    }
    const MALE_A=/^(Лука|Сава|Никита|Фома|Тома|Јона|Кузма|Јуда|Акила|Варнава|Сила|Илија|Јеремија|Еремија|Исаија|Захарија|Софонија|Авдија|Неемија|Матија|Варахија|Михеја|Јосија|Езекија|Анания|Агапија|Никола|Ѓорѓија|Андреја|Матеја|Зосима|Мина|Пимена|Онисифора|Ахила)$/;
    const sv=(cap,nx)=>{ const w=(nx||'').replace(/[^А-Шa-шЀ-ӿ]/g,''); const fem=/[аa]$/.test(w)&&!MALE_A.test(w.replace(/^./,c=>c.toUpperCase())); return (cap?'С':'с')+(fem?'вета':'вети') };
    function mkRoman(t){
      // "во IV век" -> "во четвртиот век"; "IV–V век" -> "четвртиот и петтиот век"; "Лав I" -> "Лав Први"
      t=t.replace(/(^|[\s(])(во|на|од|до|по|за|кон|околу|пред|после|меѓу|почетокот на|крајот на|средината на)\s([IVXL]+)(?:\s*[-–]\s*([IVXL]+))?(?=\s+(?:век|вселенски|собор))/g,(a,p,pre,r1,r2)=>{const o=x=>{const n=rom(x);return ORD_MK[n]?ORD_MK[n]+'от':x}; return `${p}${pre} ${o(r1)}${r2?' и '+o(r2):''}`});
      t=t.replace(/(^|[\s(])([IVXL]+)(?:\s*[-–]\s*([IVXL]+))?(?=\s+(?:век|вселенски|собор))/g,(a,p,r1,r2)=>{const o=x=>ORD_MK[rom(x)]||x; return `${p}${o(r1)}${r2?' и '+o(r2):''}`});
      t=t.replace(/([А-ШЃЌЉЊЏЅЈ][а-шѓќљњџѕј]+)\s([IVX]{1,5})(?![A-Za-z])/g,(a,nm,r)=>{const o=ORD_MK[rom(r)]; return o?nm+' '+o.charAt(0).toUpperCase()+o.slice(1):a});
      return t;
    }
    function enRoman(t){
      t=t.replace(/\b([IVX]{1,5})(?:\s*[-–]\s*([IVX]{1,5}))?(?=\s+centur)/g,(a,r1,r2)=>{const o=x=>(ORD_EN[rom(x)]||x).toLowerCase(); return o(r1)+(r2?' and '+o(r2):'')});
      t=t.replace(/\b(Book|Part|Chapter|Volume|Canon)\s([IVX]{1,5})\b/g,(a,w,r)=>w+' '+rom(r));
      // Leo III, Justin II, Theodosius I (only before a pause for the single "I", which is otherwise the pronoun)
      t=t.replace(/\b([A-Z][a-z]{2,})\s((?:[IVX]{2,5})|V|X)(?![A-Za-z])/g,(a,nm,r)=>{const o=ORD_EN[rom(r)]; return o&&!/^(Book|Part|Chapter|Volume|Canon)$/.test(nm)?nm+' the '+o:a});
      t=t.replace(/\b([A-Z][a-z]{2,})\sI(?=\s*[(,;)]|'s\b)/g,(a,nm)=>/^(Then|And|But|So|Lord|Yes|Now|Here|There|Today|What|Where|Truly|Behold|Therefore|For|If|When|As|That|Which|Whom|Father|Brothers|Sir|Master|Teacher|God|Jesus|Christ)$/.test(nm)?a:nm+' the First');
      return t;
    }
    function go(t,L){
      t=String(t||'');
      if(!t) return t;
      t=t.replace(/https?:\/\/\S+/g,'');
      // words in another script: an English voice spells Cyrillic/Arabic letter by letter, so leave them out
      if(L==='en') t=t.replace(/\(\s*[^()A-Za-z]*[\u0400-\u04FF\u0600-\u06FF][^()]*\)/g,'').replace(/[„“"«]?[\u0400-\u04FF\u0600-\u06FF][\u0400-\u04FF\u0600-\u06FF\u064B-\u0652\-]*[“”"»]?/g,'');
      else t=t.replace(/\(\s*[A-Za-z][A-Za-z .,'’\-]*\)/g,'');
      // "(+1096)" = died
      t=t.replace(/\(\s*\+\s*(\d)/g,(a,d)=>'('+(L==='en'?'died ':L==='mk'?'починал ':'توفّي ')+d).replace(/(^|[\s(;,„“"])\++\s*/g,'$1');
      t=refs(t,L);
      // any "16:10" left (book named earlier in the sentence) -> chapter 16, verse 10
      if(L!=='mk'){ const w=W[L]; t=t.replace(/\b[Cc]h\.\s?(?=\d+:\d)/g,'').replace(/(\d+)\s?:\s?(\d+)(?:\s*[-–]\s*(?:(\d+)\s?:\s?)?(\d+))?/g,(a,c,v,c2,v2)=>
        `${w.c} ${c}${w.cm}${v2?w.vs:w.v} ${v}${v2?' '+w.to+' '+(c2?w.c+' '+c2+w.cm+w.v+' ':'')+v2:''}`).replace(/(\d)\s*[–-]\s*(?=chapter|الإصحاح)/g,'$1 '+w.to+' ') }
      if(L==='en') t=t.replace(/\bPss?\.?\s(?=\d)/g,'Psalm ');
      if(L==='en'){
        t=t.replace(/\bSts?\.?(?=\s+[A-Z])/g,m=>/^Sts/.test(m)?'Saints':'Saint').replace(/\bSs\.(?=\s+[A-Z])/g,'Saints')
           .replace(/\bVen\.\s/g,'Venerable ').replace(/\bFr\.\s(?=[A-Z])/g,'Father ').replace(/\bAbp\.\s/g,'Archbishop ').replace(/\bBp\.\s/g,'Bishop ').replace(/\bMt\.?\s(?=[A-Z][a-z])/g,'Mount ')
           .replace(/\bd\.\s(?=(?:about|c\.|ca\.|in\s)?\s*\d)/g,'died ').replace(/\bb\.\s(?=(?:about\s)?\d)/g,'born ').replace(/\b(?:c|ca|circa)\.\s?(?=\d)/g,'about ').replace(/\bfl\.\s(?=\d)/g,'flourished ')
           .replace(/\be\.g\.,?/g,'for example,').replace(/\bi\.e\.,?/g,'that is,').replace(/\bcf\.\s/g,'compare ').replace(/\betc\./g,'et cetera.').replace(/\bvv\.\s(?=\d)/g,'verses ').replace(/\bv\.\s(?=\d)/g,'verse ').replace(/\bch\.\s(?=\d)/g,'chapter ')
           .replace(/\b(\d{1,4})\s?A\.D\.(?=\s+[A-Z]|\s*$)/g,'$1 AD.').replace(/\b(\d{1,4})\s?A\.D\./g,'$1 AD').replace(/\b(\d{1,4})\s?B\.C\.(?=\s+[A-Z]|\s*$)/g,'$1 BC.').replace(/\b(\d{1,4})\s?B\.C\./g,'$1 BC');
        t=enRoman(t);
      } else if(L==='mk'){
        t=t.replace(/(^|[\s(„“])(С|с)вв\.\s?/g,(a,p,c)=>p+(c==='С'?'Светите ':'светите ')).replace(/(^|[\s(„“])(С|с)в\.\s?(\S*)/g,(a,p,c,nx)=>p+sv(c==='С',nx)+' '+nx)
           .replace(/(?<![\u0400-\u04FF])поч\.\s?/g,'починал ').replace(/(^|\s)сп\.\s/g,'$1спореди ').replace(/(^|\s)гл\.\s(?=\d)/g,'$1глава ').replace(/(^|\s)ст\.\s(?=\d)/g,'$1стих ').replace(/(^|\s)стр\.\s(?=\d)/g,'$1страница ')
           .replace(/(^|\s)итн\./g,'$1и така натаму.').replace(/(^|\s)т\.е\.,?/g,'$1тоа е,').replace(/(^|\s)т\.н\.\s/g,'$1таканаречен ').replace(/(^|\s)(?:околу|ок\.)\s?(?=\d)/g,'$1околу ')
           .replace(/(\d)\s?г\.(?=\s|$)/g,'$1 година').replace(/(\d)\s?в\.(?=\s|$)/g,'$1 век').replace(/(^|\s)пр\.\s?Хр\./g,'$1пред Христа').replace(/(^|\s)н\.\s?е\./g,'$1од нашата ера');
        t=mkRoman(t);
      } else {
        t=t.replace(/(\d)\s?ق\.\s?م\.?/g,'$1 قبل الميلاد').replace(/(\d)\s?م(?=[\s).,،؛]|$)/g,'$1 للميلاد').replace(/(\d)\s?هـ(?=[\s).,،؛]|$)/g,'$1 للهجرة');
      }
      const w=W[L];
      // 482–565 -> 482 to 565;  1754/1759 -> 1754 or 1759;  Wednesday/Friday -> Wednesday or Friday
      t=t.replace(/(\d)\s*[–-]\s*(\d)/g,`$1 ${w.to} $2`).replace(/(\d)\s*\/\s*(\d)/g,`$1 ${w.or} $2`)
         .replace(/([A-Za-z\u0400-\u04FF\u0600-\u06FF])\/([A-Za-z\u0400-\u04FF\u0600-\u06FF])/g,`$1 ${w.or} $2`);
      // brackets and parentheses: a short pause instead of silence-less run-on;  [Translation of the relics of] -> plain words
      const cm=L==='ar'?'،':',';
      t=t.replace(/[\[\]]/g,'').replace(/\s*\(\s*([^()]*?)\s*\)/g,(a,x)=>x?`${cm} ${x}${cm}`:'');
      t=t.replace(/[“”„"«»]/g,'').replace(/\s+[–—]\s+/g,cm+' ').replace(/\s*·\s*/g,cm+' ').replace(/\s*\/\s*/g,' ').replace(/\s*&\s*/g,L==='en'?' and ':L==='mk'?' и ':' و ')
         .replace(/\s+([,،;؛:.!?…])/g,'$1').replace(/([,،])(?:\s*[,،])+/g,'$1').replace(/[,،]\s*([:;؛])/g,'$1').replace(/([!?؟…])\s*\./g,'$1').replace(/([,،;؛:])\s*(?=[.!?…؟]|$)/g,'').replace(/([.!?…؟:;؛])\s*[,،]/g,'$1').replace(/^\s*[,،]\s*/,'')
         .replace(/\s+/g,' ').trim();
      return t;
    }
    return go;
  })();
  function chunks(t,L){
    t=clean(SAY(t,L==='mk'?'mk':'en')); if(!t) return [];
    let s=t.split(/(?<=[.!?…])\s+/), out=[];
    for(const p of s){ if(out.length&&ABBR.test(out[out.length-1])) out[out.length-1]+=' '+p; else out.push(p) }
    const fin=[];
    for(let p of out){
      while(p.length>220){
        let cut=-1; for(const re of [/[,;:]\s/g,/\s/g]){re.lastIndex=0;let m;while((m=re.exec(p))&&m.index<200) cut=m.index+1; if(cut>60) break}
        if(cut<=0) cut=200; fin.push(p.slice(0,cut).trim()); p=p.slice(cut).trim();
      }
      if(p) fin.push(p);
    }
    return fin;
  }
  function build(d,sc,L){
    const q=[], E=L==='en', u=T[L], add=(k,t,hdr)=>chunks(t,L).forEach(c=>q.push({k:L+':'+k,t:c,L,d:d.date}));
    const saints=()=>{ add('it0',u.saints+'.'); d.items.forEach((it,i)=>add('it'+i,(E?it.en:it.mk)+'.')) };
    const lives=()=>{ if(!d.saints.length) return; add('s0n',u.lives+'.');
      d.saints.forEach((s,i)=>{ add(s.kind==='P'?'s'+i+'n':'s'+i+'p0',(E?s.name_en:s.name_mk)+'.');
        s.parts.forEach((p,j)=>add('s'+i+'p'+j,(p.lab_en?(E?p.lab_en:p.lab_mk)+'. ':'')+(E?p.en:p.mk)))})};
    const head=()=>{ const hm=d.head_mk.split(' · по стар стил'); add('hd',E?d.head_en+'.':hm[0]+'.'); add('old',E?d.old_en+'.':'По стар стил'+hm[1]+'.');
      if(d.gf) add('star',E?d.star_en:d.star_mk); if(E?d.week_en:d.week_mk) add('week',E?d.week_en:d.week_mk) };
    if(sc==='all'){
      head(); saints();
      d.readings.forEach((r,i)=>{ add('r'+i+'h',heading(E?r.h_en:r.h_mk,E)); add('r'+i+'t',E?r.en:r.mk);
        add('r'+i+'c',u.commentary+'. '+(E?r.com_en:r.com_mk)); });
      lives();
    } else if(sc==='saints'){ head(); saints(); lives() }
    else if(sc==='readings'){ head(); if(!d.readings.length) add('hd',u.noread); d.readings.forEach((r,i)=>{ add('r'+i+'h',heading(E?r.h_en:r.h_mk,E)); add('r'+i+'t',E?r.en:r.mk)}) }
    else if(sc==='commentary'){ head(); if(!d.readings.length) add('hd',u.noread); d.readings.forEach((r,i)=>{ add('r'+i+'h',heading(E?r.h_en:r.h_mk,E)); add('r'+i+'c',u.commentary+'. '+(E?r.com_en:r.com_mk))}) }
    return q;
  }
  function buildPrayers(d,sc,L){
    const q=[], langs=L==='both'?['en','mk']:[L], add=(Lx,k,t)=>chunks(t,Lx).forEach(c=>q.push({k:Lx+':'+k,t:c,L:Lx,d:'prayers'}));
    const sp=t=>String(t||'').replace(/~(R\.|Одг\.)~\s*/g,'').replace(/~/g,'').replace(/\s+[NН]\.:/g,':');
    const dot=t=>/[.!?:…]$/.test(t)?t:t+'.';
    d.sections.forEach((s,si)=>{ if(sc!=='all'&&sc!==s.id) return;
      langs.forEach(Lx=>add(Lx,'s'+si,dot(s['title_'+Lx])));
      s.prayers.forEach((p,pi)=>langs.forEach(Lx=>{ const g=f=>p[f+'_'+Lx]||'', b='p'+si+'.'+pi+'.';
        if(g('title')) add(Lx,b+'t',dot(g('title'))+(g('sub')?' '+dot(g('sub')):''));
        if(g('rubric')) add(Lx,b+'r',g('rubric'));
        g('text').split('\n\n').filter(Boolean).forEach((t,j)=>add(Lx,b+'x'+j,sp(t)));
        if(g('after')) add(Lx,b+'a',g('after'));
      }));
    });
    return q;
  }
  const ctx=()=>prayersOpen?'prayers':cur;
  // ---- playback
  function clearHl(){ if(st.hl){st.hl.classList.remove('speaking');st.hl=null} }
  function highlight(it){
    clearHl(); if(!it) return; const m=it.d==='prayers'?$('#prayers'):$('#day'); if(m.hidden||m.dataset.date!==it.d) return;
    const el=m.querySelector(`[data-k="${it.k}"]`); if(!el) return;
    let p=el.parentElement; while(p&&p!==m){ if(p.tagName==='DETAILS'&&!p.open){p.dataset.prog='1';p.open=true;setTimeout(()=>delete p.dataset.prog,0)} p=p.parentElement }
    el.classList.add('speaking'); st.hl=el;
    const r=el.getBoundingClientRect(), top=$('#top').offsetHeight, bot=window.innerHeight-$('#ttsBar').offsetHeight;
    if(r.top<top||r.top>bot-40) window.scrollTo({top:window.scrollY+r.top-top-20,behavior:'smooth'});
  }
  /* Natural flow: consecutive sentences of the same paragraph are spoken as ONE utterance (up to ~600 characters,
     always cut at a sentence end), so there is no gap and no intonation reset between sentences. Voices that stream
     from the network (Chrome's "Google ..." voices) stop after ~15 s, so they keep short pieces. Word-boundary events
     move the counter on sentence by sentence, so pause/resume restarts at the current sentence, not the paragraph. */
  function group(i,v){
    const it=st.q[i], lim=v&&v.localService===false?220:600, g=[i]; let n=it.t.length;
    for(let j=i+1;j<st.q.length;j++){ const x=st.q[j]; if(x.k!==it.k||x.L!==it.L||x.d!==it.d||n+1+x.t.length>lim) break; g.push(j); n+=1+x.t.length }
    return g;
  }
  function speakNext(){
    const my=st.token;
    if(st.i>=st.q.length){ stop(true); return }
    const it=st.q[st.i], v=it.L==='en'?voiceFor('en'):voiceFor('mk');
    if(it.L==='mk'&&!v){ st.i++; return speakNext() }   // no usable Cyrillic voice: skip MK text (note is shown)
    const base=v?vl(v).split('-')[0]:'en';
    const g=group(st.i,v), last=g[g.length-1], tx=t=>it.L==='mk'?translit(t,base):t, parts=g.map(j=>tx(st.q[j].t)), offs=[]; let o=0;
    parts.forEach(p=>{ offs.push(o); o+=p.length+1 });
    const u=new SpeechSynthesisUtterance(parts.join(' ')); st.u=u;   // keep a reference: Chrome drops events of collected utterances
    if(v){u.voice=v;u.lang=v.lang} else u.lang=it.L==='en'?'en-AU':'mk-MK';
    u.rate=rate; u.pitch=1;
    u.onboundary=e=>{ if(my!==st.token||!e||typeof e.charIndex!=='number') return; let j=0; while(j+1<offs.length&&e.charIndex>=offs[j+1]) j++; if(st.i!==g[j]){ st.i=g[j]; status() } };
    u.onend=()=>{ if(my!==st.token) return; st.i=last+1; speakNext() };
    u.onerror=e=>{ if(my!==st.token) return; if(e&&(e.error==='interrupted'||e.error==='canceled')) return; st.i=last+1; speakNext() };
    highlight(it); status();
    try{ S.speak(u) }catch(e){ st.i=last+1; setTimeout(speakNext,0) }
  }
  function status(){
    const u=ui(); $('#ttsPlay').textContent=st.playing&&!st.paused?'❚❚':'▶'; $('#ttsPlay').setAttribute('aria-label',st.playing&&!st.paused?'Pause':'Play');
    let s=''; if(st.playing){ let lab; if(st.date==='prayers') lab=u.prayers; else { const d=new Date(st.date+'T00:00:00Z'); lab=`${d.getUTCDate()} ${(lang==='mk'?MON_MK:MON_EN)[d.getUTCMonth()]}` } s=(st.paused?u.paused:u.reading)+` · ${lab} · ${Math.min(st.i+1,st.q.length)}/${st.q.length}` }
    $('#ttsNow').textContent=s; $$('.speak').forEach(b=>b.classList.toggle('on',st.playing&&st.date===ctx()));
    $('#ttsNote').textContent=note(); $('#ttsTip').textContent=tip(); $('#ttsTip').hidden=!$('#ttsTip').textContent;
    if(!$('#ttsBar').hidden) document.body.style.paddingBottom=$('#ttsBar').offsetHeight+'px';
  }
  // Wake lock is asked for synchronously inside the tap, before any await (keeps the user gesture for the iOS video fallback).
  function start(){ Awake.on(); return start0().catch(e=>{ if(!st.playing||st.paused) Awake.off(); throw e }) }
  async function start0(){
    const c=ctx(), L=effLang();
    if(c==='prayers'){ const d=await loadPrayers(); st.q=buildPrayers(d,pscope,L); st.key=c+pscope+L }
    else { const r=await getDay(c); st.q=(L==='both'?['en','mk']:[L]).flatMap(x=>build(r.day,scope,x)); st.key=c+scope+L }
    st.i=0; st.date=c;
    st.token++; try{S.cancel()}catch(e){}
    st.playing=true; st.paused=false; speakNext();
  }
  function pause(){ st.token++; st.paused=true; Awake.off(); try{S.cancel()}catch(e){} status() }   // cancel+restart chunk: reliable on iOS and Android
  function resume(){ st.paused=false; st.token++; Awake.on(); speakNext() }
  function stop(finished){ st.token++; Awake.off(); try{S.cancel()}catch(e){} st.playing=false; st.paused=false; st.i=0; clearHl(); status(); if(finished===true) $('#ttsNow').textContent=ui().done }
  function restartChunk(){ if(st.playing&&!st.paused){ st.token++; try{S.cancel()}catch(e){} speakNext() } }

  // Tip shown under the voice pickers when only the standard (robotic-sounding) voices are in use on an Apple device.
  function tip(){
    if(!isApple) return ''; const L=effLang(), need=(L==='both'?['en','mk']:[L]).filter(x=>{const v=voiceFor(x); return v&&!vtier(v)});
    if(!need.length) return ''; const mkUi=lang==='mk';
    return mkUi?'Совет за поприроден глас: на iPhone отворете Settings → Accessibility → Read & Speak (на iOS 18 и постари: Spoken Content) → Voices → English (или Bulgarian за македонскиот текст – iPhone нема македонски глас), допрете глас и преземете ја верзијата „Enhanced“ или „Premium“, па повторно отворете ја апликацијата и изберете го гласот тука.'
               :'Tip for a more natural voice: on your iPhone open Settings → Accessibility → Read & Speak (on iOS 18 and earlier: Spoken Content) → Voices → English (or Bulgarian for the Macedonian text – iPhone has no Macedonian voice), tap a voice and download its Enhanced or Premium version, then reopen the app and pick it here.';
  }
  const SAMPLE={en:'Glory to God for all things. Today we remember the saints of the day.',mk:'Слава на Бога за сè. Денес ги славиме светителите на денот.'};
  function preview(L){
    if(st.playing&&!st.paused){ restartChunk(); return }
    const v=voiceFor(L); if(!v) return; try{S.cancel()}catch(e){}
    const u=new SpeechSynthesisUtterance(L==='mk'?translit(SAMPLE.mk,vl(v).split('-')[0]):SAMPLE.en); u.voice=v; u.lang=v.lang; u.rate=rate; u.pitch=1;
    try{ S.speak(u) }catch(e){}
  }
  function fillVoices(){
    [['en','#ttsVoiceEn'],['mk','#ttsVoiceMk']].forEach(([L,id])=>{
      const l=listFor(L), sel=$(id), cv=voiceFor(L);
      sel.innerHTML=l.length?l.map(v=>`<option value="${esc(v.voiceURI)}"${cv&&v.voiceURI===cv.voiceURI?' selected':''}>${esc(v.name)} (${esc(v.lang)})${vtier(v)&&!/premium|enhanced/i.test(v.name||'')?' ★':''}</option>`).join('')
                            :`<option value="">${L==='en'?'—':(lang==='mk'?'нема кирилски глас':'no Cyrillic voice available')}</option>`;
    });
    const L=effLang(); $('#rowVEn').hidden=L==='mk'; $('#rowVMk').hidden=L==='en';
    status();
  }
  function labels(){
    if(!ok) return; const u=ui();
    const opts=prayersOpen?[['all',u.pAll],...['morning','table','day','evening'].map(x=>[x,u.pSec[x]])]:[['all',u.scopeAll],['saints',u.scopeSaints],['readings',u.scopeRead],['commentary',u.scopeCom]], cs=prayersOpen?pscope:scope;
    $('#ttsScope').innerHTML=opts.map(([v,t])=>`<option value="${v}"${v===cs?' selected':''}>${t}</option>`).join('');
    const L=effLang(); $('#ttsLang').innerHTML=[['en','EN – '+u.lEn],['mk','МК – '+u.lMk],['both','EN+МК – '+u.lBoth]].map(([v,t])=>`<option value="${v}"${v===L?' selected':''}>${t}</option>`).join('');
    $('#ttsRate').value=String(rate); fillVoices();
  }
  function init(){
    if(!ok) return;
    try{ S.addEventListener?S.addEventListener('voiceschanged',fillVoices):(S.onvoiceschanged=fillVoices) }catch(e){}
    $('#ttsPlay').onclick=()=>{ if(!st.playing) start(); else if(st.paused) resume(); else pause() };
    $('#ttsStop').onclick=()=>stop();
    $('#ttsClose').onclick=()=>{ stop(); $('#ttsBar').hidden=true; document.body.style.paddingBottom='' };
    $('#ttsScope').onchange=e=>{ if(prayersOpen){ pscope=e.target.value; LS.set('tts.pscope',pscope) } else { scope=e.target.value; LS.set('tts.scope',scope) } if(st.playing) start() };
    $('#ttsLang').onchange=e=>{ tlang=e.target.value; LS.set('tts.lang',tlang); fillVoices(); if(st.playing) start() };
    $('#ttsRate').onchange=e=>{ rate=+e.target.value; LS.set('tts.rate',rate); restartChunk() };
    $('#ttsPrevEn').onclick=()=>preview('en'); $('#ttsPrevMk').onclick=()=>preview('mk');
    $('#ttsVoiceEn').onchange=e=>{ LS.set('tts.voice.en',e.target.value); restartChunk() };
    $('#ttsVoiceMk').onchange=e=>{ LS.set('tts.voice.mk',e.target.value); status(); restartChunk() };
    labels();
  }
  function fromDay(){
    $('#ttsBar').hidden=false; document.body.style.paddingBottom=$('#ttsBar').offsetHeight+'px'; fillVoices();
    if(st.playing&&st.date===ctx()){ if(st.paused) resume(); return }
    start();
  }
  function refreshDay(){ if(st.playing&&!st.paused) highlight(st.q[st.i]); status() }
  return {ok,init,labels,_awake:Awake,fromDay,refreshDay,_state:st,_build:build,_buildPrayers:buildPrayers,_heading:heading,_chunks:chunks,_say:SAY,_group:group,_note:note,_voiceFor:voiceFor,_listFor:listFor,_vq:vq,_tip:tip};
})();
window.MPC_TTS=TTS;

/* ---------- auto-update: the same link / home-screen icon always runs the newest version ----------
   Checks for a new version on start, whenever the app comes back to the foreground (iPhone home-screen apps resume
   instead of reloading), when the connection returns and every 30 min while open. The new service worker takes over
   at once; the page then reloads itself quietly (same day, same scroll position) - but never in the middle of
   read-aloud: it waits until the reader is stopped or finished. version.json (no-store) is a backstop check. */
const Updater=(function(){
  const SWC='serviceWorker' in navigator?navigator.serviceWorker:null;
  let had=!!(SWC&&SWC.controller);   // a first-ever install takes control once: nothing to refresh then
  let reg=null, pending=false, reloading=false, last=0, timer=null;
  const busy=()=>{ try{ return !!(TTS._state&&TTS._state.playing) }catch(e){ return false } };
  function reload(){
    if(reloading) return;
    try{ const t=+sessionStorage.getItem('modc.upd.at')||0, w=20000-(Date.now()-t); if(w>0&&w<=20000){ setTimeout(reload,w); return } sessionStorage.setItem('modc.upd.at',Date.now());
         sessionStorage.setItem('modc.upd.pos',JSON.stringify({h:location.hash,y:window.scrollY,t:Date.now()})) }catch(e){}
    reloading=true; location.reload();
  }
  function apply(){ pending=true; if(!busy()) reload(); else if(!timer) timer=setInterval(()=>{ if(!busy()){ clearInterval(timer); timer=null; reload() } },1500) }
  function swVersion(){
    return new Promise(res=>{ const c=SWC&&SWC.controller; if(!c) return res(null);
      const ch=new MessageChannel(); const t=setTimeout(()=>res(null),3000); ch.port1.onmessage=e=>{clearTimeout(t);res(e.data)}; c.postMessage('version',[ch.port2]) });
  }
  async function check(force){
    const now=Date.now(); if(!reg||(!force&&now-last<15000)) return; last=now;
    try{ await reg.update() }catch(e){}
    try{
      const v=(await (await fetch('version.json?t='+now,{cache:'no-store'})).json()).v, cur=await swVersion();
      if(v&&cur&&v!==cur){ if(reg.waiting) reg.waiting.postMessage('skip-waiting'); else { try{ await reg.update() }catch(e){} } }
    }catch(e){}
  }
  function register(onReady,onFail){
    if(!SWC){ onFail(); return }
    SWC.addEventListener('controllerchange',()=>{ if(had) apply(); else had=true });
    SWC.register('sw.js',{updateViaCache:'none'}).then(r=>{ reg=r;
      r.addEventListener('updatefound',()=>{ const w=r.installing; if(w) w.addEventListener('statechange',()=>{ if(w.state==='installed'&&r.waiting) r.waiting.postMessage('skip-waiting') }) });
      if(r.waiting) r.waiting.postMessage('skip-waiting');
      check(true); return SWC.ready }).then(onReady).catch(onFail);
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) check() });
    window.addEventListener('pageshow',e=>{ if(e.persisted) check(true) });
    window.addEventListener('focus',()=>check());
    window.addEventListener('online',()=>check(true));
    setInterval(()=>{ if(!document.hidden) check(true) },30*60*1000);
  }
  function restore(){   // after an automatic update reload: back to the same place
    try{ const p=JSON.parse(sessionStorage.getItem('modc.upd.pos')||'null'); sessionStorage.removeItem('modc.upd.pos');
      if(!p||Date.now()-p.t>30000||p.h!==location.hash||!p.y) return;
      [150,500,1200].forEach(ms=>setTimeout(()=>{ if(Math.abs(window.scrollY-p.y)>4) window.scrollTo(0,p.y) },ms)) }catch(e){}
  }
  return {register,check,restore,get pending(){return pending},_apply:apply};
})();
window.MPC_UPD=Updater;

/* ---------- wiring ---------- */
function init(){
  TTS.init(); applySettings();
  $('#btnPrev').onclick=()=>step(-1); $('#btnNext').onclick=()=>step(1);
  $('#btnToday').onclick=()=>openDay(todayInRange());
  $('#btnMonth').onclick=backToMonth;
  $('#mvPrev').onclick=()=>stepMonth(-1); $('#mvNext').onclick=()=>stepMonth(1);
  $('#month').addEventListener('click',e=>{const b=e.target.closest('button[data-d]'); if(b) openDay(b.dataset.d)});
  $('#btnPrayers').onclick=()=>prayersOpen?backToCalendar():openPrayers(true);
  $('#btnBack').onclick=backToCalendar;
  $('#btnBible').onclick=()=>bibleOpen&&bibleSrc==='bible'?backFromBible():openBible('bible',true);
  $('#btnBiblija').onclick=()=>bibleOpen&&bibleSrc==='biblija'?backFromBible():openBible('biblija',true);
  $('#btnBibleBack').onclick=backFromBible;
  window.addEventListener('online',()=>{if(bibleOpen)syncBibleFrame()});
  window.addEventListener('offline',()=>{if(bibleOpen)syncBibleFrame()});
  $$('#langSeg button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;LS.set('lang',lang);applySettings();updateNav();if(bibleOpen)syncBibleFrame();else if(prayersOpen)renderPrayers();else if(view==='month')renderMonth();else show(cur,{keepScroll:true})});
  $('#btnCal').onclick=backToMonth;
  $('#btnSearch').onclick=()=>{openPanel('#searchPanel');setTimeout(()=>$('#q').focus(),50);doSearch()};
  let qt; $('#q').oninput=()=>{clearTimeout(qt);qt=setTimeout(doSearch,150)};
  $('#results').onclick=e=>{const b=e.target.closest('[data-d]');if(b){closePanels();openDay(b.dataset.d)}};
  $('#btnMenu').onclick=()=>{openPanel('#menuPanel');loadAbout()};
  $$('[data-close]').forEach(b=>b.onclick=closePanels);
  $$('.panel').forEach(p=>p.addEventListener('click',e=>{if(e.target===p)closePanels()}));
  $('#fsDown').onclick=()=>{fs=FS[Math.max(0,FS.indexOf(fs)-1)]||18;LS.set('fs',fs);applySettings()};
  $('#fsUp').onclick=()=>{fs=FS[Math.min(FS.length-1,FS.indexOf(fs)+1)]||18;LS.set('fs',fs);applySettings()};
  $('#fsReset').onclick=()=>{fs=18;LS.set('fs',fs);applySettings()};
  $$('#themeSeg button').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;LS.set('theme',theme);applySettings()});
  const setAll=v=>{Object.keys(open).forEach(k=>open[k]=v);LS.set('open',open);$$('#day details').forEach(d=>d.open=v);
    if(prayersOpen){Object.keys(popen).forEach(k=>popen[k]=v);LS.set('popen',popen);$$('#prayers details').forEach(d=>d.open=v)}};
  $('#openAll').onclick=()=>setAll(true); $('#closeAll').onclick=()=>setAll(false);
  document.addEventListener('keydown',e=>{ if(e.target.matches('input,select,textarea'))return;
    if(e.key==='Escape')closePanels(); else if(prayersOpen||bibleOpen) return; else if(view==='month'){ if(e.key==='ArrowLeft')stepMonth(-1); else if(e.key==='ArrowRight')stepMonth(1) } else if(e.key==='ArrowLeft')step(-1); else if(e.key==='ArrowRight')step(1) });
  // swipe
  let sx=0,sy=0,st0=0,ok=false; const main=$('#day');
  main.addEventListener('touchstart',e=>{if(e.touches.length!==1){ok=false;return}sx=e.touches[0].clientX;sy=e.touches[0].clientY;st0=Date.now();ok=true},{passive:true});
  main.addEventListener('touchend',e=>{ if(!ok)return; ok=false; const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>60&&Math.abs(dx)>1.8*Math.abs(dy)&&Date.now()-st0<800&&!String(window.getSelection()||'')) step(dx<0?1:-1) },{passive:true});
  const mv=$('#month'); let mx=0,my=0,mt=0,mok=false;
  mv.addEventListener('touchstart',e=>{if(e.touches.length!==1){mok=false;return}mx=e.touches[0].clientX;my=e.touches[0].clientY;mt=Date.now();mok=true},{passive:true});
  mv.addEventListener('touchend',e=>{ if(!mok)return; mok=false; const t=e.changedTouches[0],dx=t.clientX-mx,dy=t.clientY-my;
    if(Math.abs(dx)>60&&Math.abs(dx)>1.8*Math.abs(dy)&&Date.now()-mt<800) stepMonth(dx<0?1:-1) },{passive:true});
  window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);
    if(h==='bible'||h==='biblija'){ if(prayersOpen) closePrayers(); openBible(h,false); return }
    if(h==='prayers'){ if(bibleOpen) closeBible(); if(!prayersOpen) openPrayers(false); return }
    const mm=vmonth(h);
    if(mm){ const t=view==='day'?+cur.slice(5,7):mm; if(bibleOpen||prayersOpen||view!=='month'||mvM!==t) showMonth(t,{noHash:t===mm}); return }
    if(valid(h)){ if(view!=='day'||prayersOpen||bibleOpen||h!==cur) show(h); return }
    if(!h) showMonth(+cur.slice(5,7),{noHash:true}) });
  $('#foot').innerHTML='<p class="copy">Copyright © 2026 ZB</p><p>Sources: mpc.org.mk (calendar) · m-p-c.org (Macedonian Bible) · English Scripture: The Orthodox Study Bible (NKJV New Testament, Septuagint Old Testament), used by permission · official MPC calendar app “Православен календар” (Monastery Eleusa, Veljusa) for weekday readings · day icons from Wikimedia Commons (public domain / free licences, credited under each icon). Works offline. No tracking.</p>';
  // On launch the app opens on the current month; deep links (#YYYY-MM-DD, #YYYY-MM, #prayers, #bible, #biblija) still work.
  const h=location.hash.slice(1); cur=todayInRange(); updateNav();
  if(valid(h)) show(h); else { showMonth(vmonth(h)||+cur.slice(5,7)); if(h==='prayers') openPrayers(false); else if(h==='bible'||h==='biblija') openBible(h,false) }
  loadIndex().catch(()=>{});
  if('serviceWorker' in navigator){
    Updater.register(()=>{window.MPC_SW='ready';navigator.serviceWorker.ready.then(reg=>{if(reg.active)reg.active.postMessage('warm-icons')}).catch(()=>{});$('#swStatus').textContent=ui().offline},e=>{e=e||{message:'unsupported'};window.MPC_SW='error: '+e.message;$('#swStatus').textContent=ui().offlineNo});
    Updater.restore();
  } else $('#swStatus').textContent=ui().offlineNo;
}
let aboutDone=false;
async function loadAbout(){
  if(aboutDone) return; aboutDone=true;
  try{const a=await (await fetch('data/about.json')).json();
    $('#aboutBody').innerHTML=a.cover.map(c=>`<p class="small">${esc(c).replace(/\n/g,'<br>')}</p>`).join('')+'<ul>'+a.howto.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>';}catch(e){aboutDone=false}
}
window.MPC={show,step,showMonth,openDay,backToMonth,stepMonth,get view(){return bibleOpen?(bibleSrc==='biblija'?'biblija':'bible'):prayersOpen?'prayers':view},get month(){return mvM},get cur(){return cur},loadMonth,sydneyToday,openPrayers,closePrayers:backToCalendar,openBible:(push)=>openBible('bible',push),openBiblija,closeBible:backFromBible,get prayersOpen(){return prayersOpen},get bibleOpen(){return !!(bibleOpen&&bibleSrc==='bible')},get biblijaOpen(){return !!(bibleOpen&&bibleSrc==='biblija')}};
init();
})();
