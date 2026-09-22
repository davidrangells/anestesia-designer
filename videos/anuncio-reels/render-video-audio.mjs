// HTML animado → MP4 (H.264 + AAC) usando o Google Chrome instalado e WebCodecs. Sem ffmpeg.
// uso: node render-video-audio.mjs <html> <saida.mp4> [fps=30] [inicio_ms=0] [fim_ms=34600] [--mute] [--no-music] [--voice=narracao-sync.wav]
import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import path from 'node:path';
const args=process.argv.slice(2).filter(a=>!a.startsWith('--')); const MUTE=process.argv.includes('--mute'); const NOMUSIC=process.argv.includes('--no-music'); const VOICE=(process.argv.find(a=>a.startsWith('--voice='))||'').slice(8); const VOICE64=VOICE?fs.readFileSync(VOICE).toString('base64'):null;
const [htmlPath,outPath,fpsArg='30',startArg='0',endArg='34600']=args;
const FPS=+fpsArg,START=+startArg,END=+endArg,W=1080,H=1920,DUR=(END-START)/1000;
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage(); await page.setViewport({width:W,height:H,deviceScaleFactor:1});
await page.goto('file://'+path.resolve(htmlPath)+'?render',{waitUntil:'networkidle0'});
await page.waitForFunction('window.__ready===true',{timeout:30000});
await page.evaluate(()=>window.seek(0)); await new Promise(r=>setTimeout(r,400));
const enc=await browser.newPage(); const encHtml=path.join(path.dirname(path.resolve(outPath)),'.encoder.html');
fs.writeFileSync(encHtml,'<meta charset="utf-8"><script src="https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.1/build/mp4-muxer.min.js"></script>');
await enc.goto('file://'+encHtml,{waitUntil:'networkidle0'});
const setup=await enc.evaluate(async({W,H,FPS,DUR,MUTE,NOMUSIC,VOICE64})=>{
  let cfg=null; for(const codec of ['avc1.640033','avc1.64002A']){const c={codec,width:W,height:H,framerate:FPS,bitrate:10_000_000,avc:{format:'avc'}}; if((await VideoEncoder.isConfigSupported(c)).supported){cfg=c;break;}}
  if(!cfg) return {err:'sem H.264'};
  const acfg={codec:'mp4a.40.2',sampleRate:48000,numberOfChannels:2,bitrate:192000};
  const audioOK=!MUTE && typeof AudioEncoder!=='undefined' && (await AudioEncoder.isConfigSupported(acfg)).supported;
  window.__muxer=new Mp4Muxer.Muxer({target:new Mp4Muxer.ArrayBufferTarget(),video:{codec:'avc',width:W,height:H,frameRate:FPS},...(audioOK?{audio:{codec:'aac',numberOfChannels:2,sampleRate:48000}}:{}),fastStart:'in-memory',firstTimestampBehavior:'offset'});
  window.__venc=new VideoEncoder({output:(c,m)=>window.__muxer.addVideoChunk(c,m),error:e=>{window.__err=String(e);}}); window.__venc.configure(cfg);
  if(audioOK){
    // ---------- trilha sintetizada ----------
    const SR=48000, ctx=new OfflineAudioContext(2,Math.ceil(SR*DUR),SR);
    const master=ctx.createGain(); master.gain.value=NOMUSIC?0:(VOICE64?.30:.9); const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; master.connect(comp); comp.connect(ctx.destination);
    if(VOICE64){const bin=atob(VOICE64);const ab=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)ab[i]=bin.charCodeAt(i);const dv=new DataView(ab.buffer);let off=12,fmt=null,dat=null;while(off+8<=ab.length){const id=String.fromCharCode(ab[off],ab[off+1],ab[off+2],ab[off+3]);const sz=dv.getUint32(off+4,true);if(id==='fmt ')fmt={ch:dv.getUint16(off+10,true),sr:dv.getUint32(off+12,true),bits:dv.getUint16(off+22,true)};if(id==='data'){dat=[off+8,sz];break;}off+=8+sz+(sz&1);}if(!fmt||fmt.bits!==16||fmt.ch!==1||fmt.sr!==SR)throw new Error('voice WAV precisa ser mono 16-bit '+SR+' Hz; recebido '+JSON.stringify(fmt));const nfr=dat[1]/2;const vb=ctx.createBuffer(1,nfr,SR);const chd=vb.getChannelData(0);for(let i=0;i<nfr;i++)chd[i]=dv.getInt16(dat[0]+i*2,true)/32768;window.__voiceDur=nfr/SR;const src=ctx.createBufferSource();src.buffer=vb;const vg=ctx.createGain();vg.gain.value=1.0;const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=80;src.connect(hp);hp.connect(vg);vg.connect(comp);src.start(0.05);}
    const beep=(t,f=880,g=.10,d=.085)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type='sine';o.frequency.value=f;v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.006);v.gain.setValueAtTime(g,t+d);v.gain.exponentialRampToValueAtTime(.0001,t+d+.09);o.connect(v);v.connect(master);o.start(t);o.stop(t+d+.12);};
    const thump=(t,g=.3,f0=90,f1=38,d=.5)=>{const o=ctx.createOscillator(),v=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(master);o.start(t);o.stop(t+d+.05);};
    const nbuf=ctx.createBuffer(1,SR*2,SR);{const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
    const whoosh=(t,d=.45,g=.07,f0=400,f1=3200)=>{const s=ctx.createBufferSource();s.buffer=nbuf;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);const v=ctx.createGain();v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+d*.6);v.gain.linearRampToValueAtTime(0,t+d);s.connect(f);f.connect(v);v.connect(master);s.start(t);s.stop(t+d+.05);};
    const pad=(t0,t1,freqs,g=.035)=>{if(t1<t0+3)return;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(500,t0);lp.frequency.linearRampToValueAtTime(1500,t0+6);const v=ctx.createGain();v.gain.setValueAtTime(0,t0);v.gain.linearRampToValueAtTime(1,t0+1.4);v.gain.setValueAtTime(1,t1-1.2);v.gain.linearRampToValueAtTime(0,t1);lp.connect(v);v.connect(master);
      freqs.forEach((f,i)=>[-4,4].forEach(det=>{const o=ctx.createOscillator(),og=ctx.createGain(),p=ctx.createStereoPanner();o.type=i<2?'triangle':'sine';o.frequency.value=f;o.detune.value=det;og.gain.value=g;p.pan.value=det>0?.5:-.5;o.connect(og);og.connect(p);p.connect(lp);o.start(t0);o.stop(t1+.1);}));};
    // S1: monitor calmo (0–3.3)
    [.15,.95,1.75,2.55].forEach(t=>beep(t,880,.09));
    // S2: taquicardia + tensão (3.3–6.8)
    for(let t=3.35,i=0;t<6.6;t+=Math.max(.26,.46-i*.02),i++) beep(t,988,.10+i*.004,.06);
    {const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),v=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(55,3.3);o.frequency.linearRampToValueAtTime(82,6.8);f.type='lowpass';f.frequency.setValueAtTime(120,3.3);f.frequency.exponentialRampToValueAtTime(900,6.8);v.gain.setValueAtTime(0,3.3);v.gain.linearRampToValueAtTime(.09,6.7);v.gain.linearRampToValueAtTime(0,6.85);o.connect(f);f.connect(v);v.connect(master);o.start(3.3);o.stop(6.9);}
    thump(6.85,.4,110,34,.9);
    // Virada (10.0): acorde + pulso até a prova
    whoosh(9.6,.5,.08); pad(10.0,Math.min(DUR,34.4),[146.83,220,369.99,440,659.25]);
    for(let t=10.0;t<26.8;t+=.8) thump(t,.13,70,45,.22);
    [13.0,16.6,18.5].forEach(t=>whoosh(t-.2,.4,.05));
    whoosh(20.0,.4,.07); [20.5,22.9,24.1].forEach(t=>thump(t,.34,100,36,.7));
    // Fechamento: monitor estável
    pad(29.6,Math.min(DUR,34.4),[739.99,987.77],.018); [29.7,30.5,31.3,32.1].forEach(t=>beep(t,880,.07));
    const buf=await ctx.startRendering();
    const aenc=new AudioEncoder({output:(c,m)=>window.__muxer.addAudioChunk(c,m),error:e=>{window.__err='audio '+e;}}); aenc.configure(acfg);
    const N=buf.length,CH=4800; for(let off=0;off<N;off+=CH){const n=Math.min(CH,N-off);const data=new Float32Array(n*2);data.set(buf.getChannelData(0).subarray(off,off+n),0);data.set(buf.getChannelData(1).subarray(off,off+n),n);const ad=new AudioData({format:'f32-planar',sampleRate:SR,numberOfFrames:n,numberOfChannels:2,timestamp:Math.round(off/SR*1e6),data});aenc.encode(ad);ad.close();}
    await aenc.flush();
  }
  window.__i=0;
  window.__push=async(b64,key)=>{const blob=await (await fetch('data:image/png;base64,'+b64)).blob();const bmp=await createImageBitmap(blob);const f=new VideoFrame(bmp,{timestamp:Math.round(window.__i*1e6/FPS),duration:Math.round(1e6/FPS)});window.__venc.encode(f,{keyFrame:key});f.close();bmp.close();window.__i++;while(window.__venc.encodeQueueSize>6) await new Promise(r=>setTimeout(r,20));return window.__err||null;};
  window.__finish=async()=>{await window.__venc.flush();window.__muxer.finalize();const u=new Uint8Array(window.__muxer.target.buffer);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s);};
  return {codec:cfg.codec,audio:audioOK,voiceDur:window.__voiceDur||null,err:window.__err||null};
},{W,H,FPS,DUR,MUTE,NOMUSIC,VOICE64});
console.log(JSON.stringify(setup)); if(setup.err){process.exit(1);}
const n=Math.round(DUR*FPS),t0=Date.now();
for(let i=0;i<n;i++){const t=START+i*1000/FPS;await page.evaluate(t=>window.seek(t),t);const png=await page.screenshot({type:'png',encoding:'base64'});const err=await enc.evaluate((b,k)=>window.__push(b,k),png,i%(FPS*2)===0);if(err){console.error(err);process.exit(1);}if(i%(FPS*5)===0)console.log(`${(t/1000).toFixed(0)}s/${DUR}s · ${((Date.now()-t0)/1000).toFixed(0)}s`);}
const b64=await enc.evaluate(()=>window.__finish()); fs.writeFileSync(outPath,Buffer.from(b64,'base64')); fs.rmSync(encHtml,{force:true});
console.log(`OK ${outPath} ${(fs.statSync(outPath).size/1e6).toFixed(1)}MB ${n} quadros audio=${setup.audio}`); await browser.close();
