# Sincroniza a narração a partir da transcrição por palavra (src/narracao2.words.json).
# uso: python3 src/sync-narracao2.py <ratio> <wav-entrada>
import wave, numpy as np, json, sys
RATIO=float(sys.argv[1]); SRC=sys.argv[2]; GAP=0.20; PRE=0.05; POST=0.07
words=json.load(open('src/narracao2.words.json'))
# grupos de palavras por frase (índices inclusive), na ordem da gravação
groups=[('40min',0,6),('estuda',7,10),('revisa',11,15),('livro',16,18),('custa',19,23),('monta',24,30),('qfe',31,35),('ordem',36,38),('cada',39,42),('ve',43,47),('3500',48,52),('vinte',53,59),('aleatorio',60,65),('marca',66,67),('garantia',68,71),('assine',72,73)]
for n,a,b in groups: print(n,':',' '.join(w[2].strip() for w in words[a:b+1]))
w=wave.open(SRC); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
win=int(sr*0.01); env=np.array([np.abs(x[i:i+win]).max() for i in range(0,len(x)-win,win)]); thr=env.max()*0.09
def refine(t0,t1,which):
    i0=max(0,int(t0/0.01)); i1=min(len(env)-1,int(t1/0.01))
    idx=[i for i in range(i0,i1+1) if env[i]>thr]
    if not idx: return t0 if which=='start' else t1
    return (idx[0] if which=='start' else idx[-1]+1)*0.01
# ---- compressão de silêncio em qualquer ponto: trechos com envelope abaixo do limiar por mais de MINSIL viram GAP ----
MINSIL=0.30
runs=[]; on=None
for i_,e in enumerate(env):
    if e<=thr and on is None: on=i_
    if e>thr and on is not None:
        if (i_-on)*0.01>=MINSIL: runs.append((on*0.01,i_*0.01))
        on=None
if on is not None and (len(env)-on)*0.01>=MINSIL: runs.append((on*0.01,len(env)*0.01))
pieces=[]; cursor=0.0; cuts=[]  # cuts: (t_old_inicio_do_corte, quanto foi removido acumulado até ali)
removed=0.0
for a,b in runs:
    keep_end=a+GAP if (b-a)>GAP else b
    pieces.append(x[int(cursor*sr):int(keep_end*sr)])
    removed+=b-keep_end; cuts.append((keep_end,b,removed)); cursor=b
pieces.append(x[int(cursor*sr):])
y=np.concatenate(pieces)
def tmap(t):
    r=0.0
    for ke,b,rem in cuts:
        if t>=b: r=rem
        elif t>ke: return ke-(rem-(b-ke))
        else: break
    return t-r
newmap={}
for n,a,b in groups:
    st=refine(max(words[groups[groups.index((n,a,b))-1][2]][1] if a else 0,words[a][0]-0.3),words[a][0]+0.25,'start')
    en=refine(words[b][0]+0.08,min((words[b+1][0]-0.05) if b+1<len(words) else len(x)/sr,words[b][1]+0.45),'end')
    newmap[n]=[tmap(st),tmap(en)]
print('silêncios comprimidos',len(runs),'removido',round(removed,2),'s')
def wsola(x,ratio,sr,win_ms=40,hop_ms=10,tol_ms=8):
    N=int(sr*win_ms/1000); Hs=int(sr*hop_ms/1000); tol=int(sr*tol_ms/1000)
    w=np.hanning(N).astype(np.float32); L=int(len(x)/ratio); out=np.zeros(L+N,dtype=np.float32); norm=np.zeros_like(out); prev=None; k=0
    while True:
        po=k*Hs; nominal=int(round(po*ratio))
        if nominal+N+tol>=len(x) or po+N>=len(out): break
        pi=nominal
        if prev is not None:
            best=nominal; bc=-1e9
            for c in range(max(0,nominal-tol),nominal+tol+1,2):
                s_=np.dot(x[c:c+N],prev)
                if s_>bc: bc=s_; best=c
            pi=best
        out[po:po+N]+=x[pi:pi+N]*w; norm[po:po+N]+=w; prev=x[pi+Hs:pi+Hs+N]; k+=1
    norm[norm<1e-3]=1; return (out/norm)[:L]
z=wsola(y,RATIO,sr) if RATIO!=1 else y
z=z/np.abs(z).max()*0.95; f=int(0.01*sr); z[:f]*=np.linspace(0,1,f); z[-f:]*=np.linspace(1,0,f)
SR=48000; n=int(len(z)*SR/sr); z48=np.interp(np.arange(n)/SR,np.arange(len(z))/sr,z.astype(np.float64))
wo=wave.open('narracao-sync-48k.wav','wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(SR); wo.writeframes((np.clip(z48,-1,1)*32767).astype(np.int16).tobytes()); wo.close()
m={k:[round(a/RATIO,3),round(b/RATIO,3)] for k,(a,b) in newmap.items()}
json.dump(m,open('src/narracao-frases.json','w'),indent=0)
print('original',round(len(x)/sr,2),'sem pausas',round(len(y)/sr,2),'final',round(len(z)/sr,2)); print(m)
