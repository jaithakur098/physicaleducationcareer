const http=require('http'),fs=require('fs'),path=require('path'),puppeteer=require('puppeteer-core');
const ROOT=process.cwd(),PORT=8089,CHROME='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const MIME={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml'};
const server=http.createServer((req,res)=>{let p=decodeURIComponent(req.url.split('?')[0]);if(p==='/')p='/index.html';const fp=path.join(ROOT,p);if(!fp.startsWith(ROOT)||!fs.existsSync(fp)){res.writeHead(404);res.end('nf');return;}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'text/plain'});fs.createReadStream(fp).pipe(res);});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  await new Promise(r=>server.listen(PORT,r));
  const browser=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:900});
  await page.goto('http://localhost:'+PORT+'/index.html',{waitUntil:'load'});
  await sleep(1500);
  const offenders=await page.evaluate(()=>{
    const w=document.documentElement.clientWidth;const out=[];
    document.querySelectorAll('*').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(r.right>w+1||r.left<-1){
        out.push({tag:el.tagName,id:el.id,cls:(el.className&&el.className.toString().slice(0,60)),left:Math.round(r.left),right:Math.round(r.right),w:Math.round(r.width)});
      }
    });
    return {w,out:out.slice(0,25)};
  });
  console.log('viewport clientWidth=',offenders.w);
  offenders.out.forEach(o=>console.log(`${o.tag} #${o.id} .${o.cls}  left=${o.left} right=${o.right} w=${o.w}`));
  await browser.close();server.close();
})();
