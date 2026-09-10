const http=require('http'),fs=require('fs'),path=require('path'),puppeteer=require('puppeteer-core');
const ROOT=process.cwd(),PORT=8091,CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const MIME={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)||!fs.existsSync(fp)){res.writeHead(404);res.end('nf');return;}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'text/plain'});fs.createReadStream(fp).pipe(res);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await new Promise(r=>server.listen(PORT,r));
  const browser=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const pages=['index.html','student-portal.html','govt-jobs.html','admissions.html','portal-category.html?cat=govt-jobs','portal-topic.html?cat=govt-jobs&topic=ssc-jobs'];
  const widths=[1280,1024,768,390];
  let bad=0;
  for(const pg of pages){
    for(const w of widths){
      await page.setViewport({width:w,height:900});
      await page.goto('http://localhost:'+PORT+'/'+pg,{waitUntil:'load'});
      await sleep(900);
      const o=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      const flag=o>1?'  <-- OVERFLOW':'';
      if(o>1)bad++;
      console.log((w+'x900 '+pg+' overflow='+o+flag));
    }
  }
  await browser.close();server.close();
  console.log('\nTOTAL OVERFLOW ISSUES: '+bad);
})();
