/* In-memory Firestore mock + data-layer logic verification.
   Validates: create, persistence, edit, publish, unpublish, delete,
   duplicate, search, type-specific fields, sitemap cache. */
const fs = require('fs');

/* ---------- mock Firestore ---------- */
function sanitize(o){ if(Array.isArray(o)) return o.map(sanitize); if(o&&typeof o==='object'){ if(o.__serverTs) return {seconds: Math.floor(Date.now()/1000)}; const out={}; for(const k in o) out[k]=sanitize(o[k]); return out; } return o; }
function makeFirestore(){
  const store={}; let auto=0;
  const coll=name=>{ if(!store[name]) store[name]={}; return store[name]; };
  function snap(id,d){ return {id, exists:d!==undefined, data:()=>d}; }
  function qsnap(docs){ return {empty:docs.length===0, docs, size:docs.length, forEach(cb){docs.forEach(cb);}}; }
  function chain(name){
    let wheres=[],orders=[],lim=null;
    const api={
      where(f,o,v){wheres.push({f,o,v});return api;},
      orderBy(f,dir){orders.push({f,dir:dir||'asc'});return api;},
      limit(n){lim=n;return api;},
      async get(){
        let e=Object.keys(coll(name)).map(id=>({id,...coll(name)[id]}));
        wheres.forEach(w=>{ e = w.o==='==' ? e.filter(x=>x[w.f]===w.v) : e.filter(()=>false); });
        if(orders.length){ const o=orders[0]; e.sort((a,b)=>{ const av=a[o.f],bv=b[o.f]; if(av==null)return 1; if(bv==null)return -1; return o.dir==='desc'?(bv>av?1:-1):(av>bv?1:-1); }); }
        if(lim!=null) e=e.slice(0,lim);
        return qsnap(e.map(x=>snap(x.id,x)));
      }
    };
    return api;
  }
  return {
    store,
    firestore:{
      FieldValue:{ serverTimestamp:()=>({__serverTs:true}) },
      collection(name){
        return {
          add(data){ const id='id'+(++auto); coll(name)[id]=sanitize(data); return Promise.resolve({id}); },
          doc(id){ return {
            async set(data,opts){ const cur=coll(name)[id]||{}; coll(name)[id]= sanitize(opts&&opts.merge?Object.assign({},cur,data):data); return Promise.resolve(); },
            async get(){ const d=coll(name)[id]; return snap(id,d); },
            async delete(){ delete coll(name)[id]; return Promise.resolve(); }
          };},
          where(f,o,v){return chain(name).where(f,o,v);},
          orderBy(f,d){return chain(name).orderBy(f,d);},
          limit(n){return chain(name).limit(n);},
          get(){return chain(name).get();}
        };
      }
    }
  };
}

/* ---------- globals ---------- */
global.window = global;
const mock = makeFirestore();
const fbFirestore = ()=> mock.firestore;
fbFirestore.FieldValue = { serverTimestamp: ()=>({__serverTs:true}) };
global.firebase = { firestore: fbFirestore };

/* ---------- load modules ---------- */
function load(file){ (0,eval)(fs.readFileSync(file,'utf8')); }
load('config/portal-catalog.js');
load('config/portal-data.js');

/* ---------- assertions ---------- */
let pass=0, fail=0; const log=[];
function ok(cond,msg){ if(cond){pass++; log.push('  PASS '+msg);} else {fail++; log.push('  FAIL '+msg);} }

(async()=>{
  const C = global.PORTAL_CATALOG, D = global.PortalData;

  // catalog integrity
  ok(C.CATEGORIES.length===12, 'catalog has 12 categories');
  ok(C.CONTENT_TYPES.some(t=>t.id==='form'), 'content type "form" present');

  // TEST 1: create article (draft) -> persists
  const aId = await D.createContent({ type:'article', category:'career-guidance', topic:'career-after-12th', title:'How to Choose a Career After 12th', shortDescription:'Guide', fullContent:'<p>Content</p>', status:'draft' });
  ok(!!aId, 'createContent returns id');
  let all = await D.listAll();
  ok(all.length===1 && all[0].status==='draft', 'article persisted as draft (refresh simulation)');
  let slugA = all[0].slug;

  // TEST 2: edit -> persists
  await D.updateContent(aId, { title:'How to Choose a Career After 12th (Updated)', shortDescription:'Updated guide' });
  let edited = await D.getById(aId);
  ok(edited.title.indexOf('Updated')>=0 && edited.shortDescription==='Updated guide', 'edit persisted');
  slugA = edited.slug; // slug regenerated because no slug passed on edit

  // TEST 3: publish -> appears publicly
  await D.setStatus(aId,'published');
  let pub = await D.listByTopic('career-guidance','career-after-12th');
  ok(pub.length===1 && pub[0].status==='published', 'published article appears in topic listing');
  let bySlug = await D.getBySlug(slugA);
  ok(bySlug && bySlug.id===aId, 'getBySlug resolves published article');

  // TEST 4: unpublish -> disappears from public
  await D.setStatus(aId,'unpublished');
  let hidden = await D.listByTopic('career-guidance','career-after-12th');
  ok(hidden.length===0, 'unpublished article removed from public listing');

  // TEST 5: Government Job
  const jId = await D.createContent({
    type:'govt-job', category:'govt-jobs', topic:'ssc-jobs',
    title:'SSC CGL 2026', org:'Staff Selection Commission',
    postName:'Combined Graduate Level', vacancies:17727,
    qualification:'Bachelor Degree', ageLimit:'18-32 Years',
    fee:'₹100', selection:'Tier 1, Tier 2, Tier 3',
    importantDates:{ 'Application Begin':'21/05/2026', 'Last Date':'12/06/2026', 'Exam Date':'August 2026' },
    howToApply:['Visit ssc.nic.in','Fill form'],
    faq:[{q:'Is there negative marking?',a:'Yes 0.50 marks'}],
    officialUrl:'https://ssc.nic.in', applyUrl:'https://ssc.nic.in/apply',
    notificationLink:'https://ssc.nic.in', resultUrl:'', admitUrl:'',
    publishDate:'2026-05-21', status:'published'
  });
  let job = await D.getBySlug('ssc-cgl-2026');
  ok(job && job.id===jId, 'govt job created & fetched by slug');
  ok(job.vacancies===17727 && job.importantDates['Last Date']==='12/06/2026', 'govt job type-specific fields stored');
  ok(job.howToApply.length===2 && job.faq[0].a==='Yes 0.50 marks', 'govt job arrays stored');
  let govList = await D.listByCategory('govt-jobs');
  ok(govList.length===1 && govList[0].topic==='ssc-jobs', 'govt job appears under Government Jobs category');

  // TEST 6: Admit Card
  const adId = await D.createContent({
    type:'admit-card', category:'admit-card', topic:'ssc-admit-card',
    title:'SSC CGL 2026 Admit Card', exam:'SSC CGL 2026', releaseDate:'July 2026',
    howToDownload:'Login to ssc.nic.in', officialDownloadLink:'https://ssc.nic.in/admit',
    status:'published'
  });
  let ad = await D.listByTopic('admit-card','ssc-admit-card');
  ok(ad.length===1 && ad[0].officialDownloadLink==='https://ssc.nic.in/admit', 'admit card appears under Admit Card topic');

  // search
  let s1 = await D.search({ q:'SSC' });
  ok(s1.length>=2, 'search by keyword "SSC" returns job+admit');
  let s2 = await D.search({ category:'govt-jobs', type:'govt-job' });
  ok(s2.length===1, 'search filtered by category+type');

  // duplicate
  const dupId = await D.duplicateContent(jId);
  let dup = await D.getById(dupId);
  ok(dup && dup.status==='draft' && dup.title.indexOf('Copy')>=0, 'duplicate creates draft copy');

  // delete
  await D.deleteContent(adId);
  let afterDel = await D.listByCategory('admit-card');
  ok(afterDel.length===0, 'delete removes content');

  // sitemap cache
  let entries = await D.refreshSitemapCache();
  ok(entries.length > 12, 'sitemap cache includes categories+topics+published content');

  console.log(log.join('\n'));
  console.log('\nRESULT: '+pass+' passed, '+fail+' failed');
  process.exit(fail?1:0);
})().catch(e=>{ console.error('TEST ERROR', e); process.exit(2); });
