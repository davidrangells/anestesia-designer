// Renderiza o HTML animado em MP4 (H.264) usando o Google Chrome instalado + WebCodecs. Não precisa de ffmpeg.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs'; import path from 'node:path';
const [,, htmlPath, outPath, fpsArg='30', startArg='0', endArg='62000'] = process.argv;
const FPS=+fpsArg, START=+startArg, END=+endArg, W=1080, H=1920;
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--enable-features=WebCodecs','--use-gl=angle','--enable-unsafe-swiftshader']});
const page=await browser.newPage(); await page.setViewport({width:W,height:H,deviceScaleFactor:1});
await page.goto('file://'+path.resolve(htmlPath)+'?render',{waitUntil:'networkidle0'});
await page.waitForFunction('window.__ready===true',{timeout:20000});
await page.evaluate(()=>window.seek(0)); await new Promise(r=>setTimeout(r,300));
// página codificadora
const enc=await browser.newPage();
const encHtml=path.join(path.dirname(outPath),'.encoder.html');
fs.writeFileSync(encHtml,'<script src="https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js"></script><p>encoder</p>');
await enc.goto('file://'+path.resolve(encHtml),{waitUntil:'networkidle0'});
if(!(await enc.evaluate(()=>typeof VideoEncoder!=='undefined'&&typeof Mp4Muxer!=='undefined'))){console.error('WebCodecs ou mp4-muxer indisponíveis na página codificadora.');process.exit(1);}
const info=await enc.evaluate(async({W,H,FPS})=>{
  const cfgs=[{codec:'avc1.640033',width:W,height:H,framerate:FPS,bitrate:9_000_000,avc:{format:'avc'}},{codec:'avc1.64002A',width:W,height:H,framerate:FPS,bitrate:9_000_000,avc:{format:'avc'}}];
  for(const c of cfgs){const s=await VideoEncoder.isConfigSupported(c); if(s.supported){window.__cfg=c;return c.codec;}}
  return null;
},{W,H,FPS});
if(!info){console.error('H.264 não suportado pelo WebCodecs neste Chrome.');process.exit(1);}
console.log('codec',info);
await enc.evaluate(async({W,H,FPS})=>{
  window.__muxer=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:'avc',width:W,height:H,frameRate:FPS},fastStart:'in-memory'});
  window.__encoder=new VideoEncoder({output:(c,m)=>window.__muxer.addVideoChunk(c,m),error:e=>{window.__err=String(e);}});
  window.__encoder.configure(window.__cfg);
  window.__i=0;
  window.__push=async(b64,key)=>{const blob=await (await fetch('data:image/png;base64,'+b64)).blob();const bmp=await createImageBitmap(blob);const f=new VideoFrame(bmp,{timestamp:Math.round(window.__i*1e6/FPS),duration:Math.round(1e6/FPS)});window.__encoder.encode(f,{keyFrame:key});f.close();bmp.close();window.__i++;if(window.__encoder.encodeQueueSize>8) await new Promise(r=>setTimeout(r,30));return window.__err||null;};
  window.__finish=async()=>{await window.__encoder.flush();window.__muxer.finalize();const buf=window.__muxer.target.buffer;let s='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
},{W,H,FPS});
const n=Math.round((END-START)/1000*FPS); const t0=Date.now();
for(let i=0;i<n;i++){
  const t=START+i*1000/FPS;
  await page.evaluate(t=>window.seek(t),t);
  const png=await page.screenshot({type:'png',encoding:'base64',captureBeyondViewport:false});
  const err=await enc.evaluate((b,k)=>window.__push(b,k),png,i%(FPS*2)===0);
  if(err){console.error('encoder error',err);process.exit(1);}
  if(i%FPS===0) process.stdout.write(`\r${(t/1000).toFixed(0)}s / ${(END/1000).toFixed(0)}s  (${((Date.now()-t0)/1000).toFixed(0)}s decorridos)`);
}
const b64=await enc.evaluate(()=>window.__finish());
fs.writeFileSync(outPath,Buffer.from(b64,'base64'));
console.log(`\nOK → ${outPath} (${(fs.statSync(outPath).size/1e6).toFixed(1)} MB, ${n} quadros)`);
fs.rmSync(encHtml,{force:true});
await browser.close();
