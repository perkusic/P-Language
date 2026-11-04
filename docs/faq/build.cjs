// Node >=20; renderer pinned to marked 17.0.5 (see package.json and README.md).
// Usage: node docs/faq/build.cjs [path-to-marked-package]
const fs=require('fs'),path=require('path');
const rendererPath=process.argv[2]||'marked';
const rendererVersion=JSON.parse(fs.readFileSync(path.resolve(path.dirname(require.resolve(rendererPath)),'../package.json'),'utf8')).version;
if(rendererVersion!=='17.0.5')throw Error('Use marked 17.0.5 to reproduce the FAQ HTML.');
const {marked}=require(rendererPath);
function build(sourceFile,outputFile,pageTitle){
let article=marked.parse(fs.readFileSync(path.join(__dirname,sourceFile),'utf8'));
const slug=s=>s.replace(/<[^>]*>/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
const topics=[];
article=article.replace(/<h2>(.*?)<\/h2>/g,(_,title)=>{const id=slug(title);topics.push({id,title});return `<h2 id="${id}">${title}</h2>`;});
let count=0;
article=article.replace(/<h3>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h[23]\b|$)/g,(_,question,answer)=>{
count++;const id='question-'+slug(question.replace(/^\d+\.\s*/,''));
return `<details class="qa" id="${id}"><summary>${question}</summary><div class="answer">${answer}</div></details>\n`;
});
article=article.replace(/<table>/g,'<div class="table-wrap"><table>').replace(/<\/table>/g,'</table></div>');
const placeholder=sourceFile==='manufacturing-cell.md'?'Try: technician, commit, S4…':'Try: parking, fairness, commit…';
const controls=`<div class="controls"><label for="search">Find a question</label><input type="search" id="search" placeholder="${placeholder}" autocomplete="off"><div class="tools"><span id="count" role="status">${count} questions</span><button type="button" id="expand">Open all answers</button><button type="button" id="collapse">Close all answers</button></div></div><nav aria-label="FAQ topics">${topics.map(t=>`<a href="#${t.id}">${t.title}</a>`).join('')}</nav><p id="empty" hidden>No matching questions. Try another word.</p>`;
if(count>0){
const chunks=article.split(/(?=<h2\b)/);
article=chunks[0]+controls+chunks.slice(1).map(c=>`<section class="faq-section">${c}</section>`).join('');
}
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${pageTitle}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#182c3a;--muted:#526371;--line:#d5dfe5;--soft:#f3f7fa;--accent:#1763aa}
@media(prefers-color-scheme:dark){:root{--bg:#191d22;--fg:#e7edf3;--muted:#b2bfca;--line:#45515c;--soft:#242c34;--accent:#89c4ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:940px;margin:auto;padding:32px 24px 72px}h1{font-size:clamp(1.8rem,5vw,2.65rem);line-height:1.18;letter-spacing:-.025em}h2{font-size:1.35rem;line-height:1.3;margin:42px 0 15px;scroll-margin-top:24px}p,li{max-width:80ch}a{color:var(--accent);text-underline-offset:3px}code{background:var(--soft);padding:.1em .3em;border-radius:4px;font-size:.9em;overflow-wrap:anywhere}summary{padding:18px 20px;font-weight:650;cursor:pointer;line-height:1.45}details{border:1px solid var(--line);border-radius:10px;margin:12px 0;background:var(--bg)}details[open] summary{border-bottom:1px solid var(--line);background:var(--soft);border-radius:10px 10px 0 0}.answer{padding:2px 20px 12px}.controls{padding:20px;background:var(--soft);border:1px solid var(--line);border-radius:12px;margin-top:30px}label{display:block;font-weight:650;margin-bottom:8px}input{width:100%;font:inherit;color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:10px 12px}.tools{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px}#count{color:var(--muted);margin-right:auto}button{font:inherit;font-size:.88rem;color:var(--accent);border:1px solid var(--line);border-radius:6px;background:var(--bg);padding:7px 10px;cursor:pointer}nav{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:.9rem;margin-top:18px}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid var(--accent);outline-offset:3px}table{border-collapse:collapse;width:100%;font-size:.9rem}th,td{text-align:left;vertical-align:top;border:1px solid var(--line);padding:10px}th{background:var(--soft)}.table-wrap{overflow:auto}footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem}[hidden]{display:none!important}@media print{.controls,nav{display:none}.answer{display:block!important}details{break-inside:avoid}}@media(max-width:500px){main{padding:24px 16px 48px}summary{padding:16px}.answer{padding:2px 16px 10px}}
</style></head><body><main>${article}<footer><a href="${sourceFile}">Read the Markdown source</a> · <a href="../index.html">Back to the P tutorial and projects</a></footer></main>
<script>
if(document.querySelector('#search')){
const questions=[...document.querySelectorAll('.qa')],search=document.querySelector('#search'),count=document.querySelector('#count');
const clean=s=>s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');
const sections=[...document.querySelectorAll('.faq-section')];
let preSearch=null;
search.addEventListener('input',()=>{
const term=clean(search.value.trim());
if(term&&!preSearch)preSearch=new Map(questions.map(q=>[q.id,q.open]));
let matches=0;
questions.forEach(q=>{q.hidden=Boolean(term)&&!clean(q.textContent).includes(term);if(!q.hidden){matches++;if(term)q.open=true;else if(preSearch)q.open=preSearch.get(q.id)===true;}});
sections.forEach(section=>{section.hidden=Boolean(term)&&![...section.querySelectorAll('.qa')].some(q=>!q.hidden);const link=document.querySelector('nav a[href="#'+section.querySelector('h2').id+'"]');if(link)link.hidden=section.hidden;});
if(!term)preSearch=null;
count.textContent=term?matches+' of '+questions.length+' questions':questions.length+' questions';document.querySelector('#empty').hidden=matches>0;
});
document.querySelector('#expand').addEventListener('click',()=>questions.filter(q=>!q.hidden).forEach(q=>q.open=true));
document.querySelector('#collapse').addEventListener('click',()=>questions.forEach(q=>q.open=false));
function revealHash(){const item=document.getElementById(location.hash.slice(1));if(item?.classList.contains('qa')){if(item.hidden){search.value='';search.dispatchEvent(new Event('input'));}item.open=true;}}
addEventListener('hashchange',revealHash);revealHash();
addEventListener('beforeprint',()=>questions.forEach(q=>{q.dataset.wasOpen=String(q.open);q.open=true;}));addEventListener('afterprint',()=>questions.forEach(q=>{q.open=q.dataset.wasOpen==='true';}));
}
</script></body></html>`;
fs.writeFileSync(path.join(__dirname,outputFile),html);
console.log(outputFile+': '+count+' questions.');
}
build('FAQ.md','index.html','Student FAQs — choose your project');
build('manufacturing-cell.md','manufacturing-cell.html','Student FAQ — manufacturing cell');
build('robot-fleet.md','robot-fleet.html','Student FAQ — mobile robot fleet');
