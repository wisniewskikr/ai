const path=require('path');const {pathToFileURL}=require('url');const {chromium}=require(path.join(__dirname,'repo','node_modules','playwright'));
const [, , video, ...times]=process.argv;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto(pathToFileURL(video).href);
await p.waitForFunction(()=>document.querySelector('video')&&document.querySelector('video').readyState>=1);
const dur=await p.evaluate(()=>{const v=document.querySelector('video');v.pause();v.controls=false;v.style.width='1280px';return v.duration;});console.log('duration',dur);
for(const t of times){await p.evaluate(t=>new Promise(r=>{const v=document.querySelector('video');v.onseeked=r;v.currentTime=t;}),Number(t));await p.screenshot({path:path.join(__dirname,`frame-${t}.png`)});}
await b.close();})().catch(e=>{console.error(e.message);process.exit(1)});
