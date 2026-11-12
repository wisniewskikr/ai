const fs=require('fs');const S=fs.readFileSync(__dirname+'/session.txt','utf8').match(/session=(.*)/)[1].trim();
const A='https://hq.mega.dev/challenges/show-me-when/api';let cur=null;
(async()=>{const t0=Date.now();for(let n=0;n<Number(process.argv[2]||20);n++){const u=new URL(A+'/incidents');u.searchParams.set('t',S);if(cur)u.searchParams.set('since',cur);
const p=await (await fetch(u)).json();cur=p.cursor;console.log(((Date.now()-t0)/1000).toFixed(0).padStart(3),p.incidents.length,p.incidents.map(i=>i.id+'@'+i.openedAt.slice(11,19)).join(' '), Object.keys(p).join(','));await new Promise(r=>setTimeout(r,2000));}})();
