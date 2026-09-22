# Gera o HTML do anúncio a partir do template-v3 e do mapa de frases da narração.
import base64,re,json,sys
m=json.load(open('src/narracao-frases.json')); s=open('src/template-v3.html',encoding='utf-8').read()
ms=lambda t:int(round(t*1000))
def rep(a,b):
    global s
    assert a in s, a[:70]; s=s.replace(a,b,1)
# ---------- textos ----------
rep('Abrir o Miller<br>na página 1?','Abrir um livro<br>na página 1?')
rep('>+3.200<','>+3.500<')
rep('<u>7 dias</u> de garantia<small>Não gostou? Devolvemos 100%.</small>','<u>7 dias</u> de garantia')
rep('--img-cad:url(__CAD__)','--img-cad:url(__CAD2__)')
rep('Questão, flashcard,<br>erro. <i>Na ordem certa.</i>','Questão, flashcards<br>e erros <i>na ordem certa.</i>')
rep('.pr .v{font-size:190px;font-weight:800;letter-spacing:-.06em;line-height:.95}','.pr .v{font-size:190px;font-weight:800;letter-spacing:-.06em;line-height:.95;padding-right:.08em;flex:none}')
rep('Prévia sem áudio. O MP4 final tem trilha.','Prévia sem áudio. O MP4 final tem narração e trilha.')
# ---------- timeline ----------
s1_end=m['estuda'][1]+0.25
s2_start=s1_end
rv=m['revisa']
if 'livro' in m: opt1=[rv[0]+0.03, m['livro'][0]-0.02]; opt2=[m['livro'][0]-0.02, m['livro'][1]+0.2]
else:
    mid=rv[0]+(rv[1]-rv[0])*0.5; opt1=[rv[0]+0.03, mid]; opt2=[mid, rv[1]+0.2]
if 'todas' not in m: m['todas']=[m['3500'][1]+0.25, m['vinte'][0]-0.1]
punch=m['custa'][0]-0.05
s3_start=m['monta'][0]+0.1
cap1=[s3_start, m['qfe'][0]-0.1]; cap2=[m['qfe'][0]-0.1, m['cada'][0]-0.13]; cap3=[m['cada'][0]-0.13, m['ve'][0]-0.07]; cap4=[m['ve'][0]-0.07, m['3500'][0]-0.2]
s5_start=m['3500'][0]-0.2; s6_start=m['aleatorio'][0]-0.3; total=m['assine'][1]+1.0
phone=s3_start+0.1
# S1
rep('<section class="scene" style="--d:0ms;--len:3200ms"><div class="cam" style="--d:0ms;--len:3200ms">',f'<section class="scene" style="--d:0ms;--len:{ms(s1_end)}ms"><div class="cam" style="--d:0ms;--len:{ms(s1_end)}ms">')
rep('class="abs s1q in" style="--d:1700ms"',f'class="abs s1q in" style="--d:{ms(m["estuda"][0]-0.1)}ms"')
rep('<svg class="ecg" style="top:1300px;--d:100ms;--len:3000ms" viewBox="0 0 1080 220"><path stroke="#34D399" style="--d:100ms;--len:3000ms"',f'<svg class="ecg" style="top:1300px" viewBox="0 0 1080 220"><path stroke="#34D399" style="--d:100ms;--len:{ms(s1_end-0.2)}ms"')
# S2 (sem opção 3)
rep('<section class="scene" style="--d:3200ms;--len:4200ms">',f'<section class="scene" style="--d:{ms(s2_start)}ms;--len:{ms(s3_start-s2_start)}ms">')
rep('style="--d:3250ms;--len:1050ms"',f'style="--d:{ms(opt1[0])}ms;--len:{ms(opt1[1]-opt1[0])}ms"')
rep('style="--d:4300ms;--len:1050ms"',f'style="--d:{ms(opt2[0])}ms;--len:{ms(opt2[1]-opt2[0])}ms"')
s=re.sub(r'\s*<div class="abs ask cut" style="--d:5350ms;--len:950ms">.*?</div></div>','',s,count=1,flags=re.S)
rep('<div class="abs punch in" style="--d:6300ms">',f'<div class="abs punch in" style="--d:{ms(punch)}ms">')
rep('animation:ul 500ms cubic-bezier(.2,.8,.2,1) 6700ms both',f'animation:ul 500ms cubic-bezier(.2,.8,.2,1) {ms(punch+0.55)}ms both')
rep('<path stroke="#FB7185" style="--d:3250ms;--len:3900ms"',f'<path stroke="#FB7185" style="--d:{ms(s2_start+0.05)}ms;--len:{ms(punch-s2_start-0.1)}ms"')
# S3/S4
rep('<section class="scene" style="--d:7400ms;--len:17200ms;animation-duration:12200ms">',f'<section class="scene" style="--d:{ms(s3_start)}ms;--len:{ms(s5_start-s3_start)}ms">')
rep('style="--d:7500ms;--len:2700ms">O app já montou',f'style="--d:{ms(cap1[0])}ms;--len:{ms(cap1[1]-cap1[0])}ms">O app já montou')
rep('style="--d:10200ms;--len:2600ms">Questão, flashcards',f'style="--d:{ms(cap2[0])}ms;--len:{ms(cap2[1]-cap2[0])}ms">Questão, flashcards')
rep('style="--d:12800ms;--len:2900ms">Cada erro volta',f'style="--d:{ms(cap3[0])}ms;--len:{ms(cap3[1]-cap3[0])}ms">Cada erro volta')
rep('style="--d:15700ms;--len:3700ms">E você vê onde',f'style="--d:{ms(cap4[0])}ms;--len:{ms(cap4[1]-cap4[0])}ms">E você vê onde')
rep('<div class="phone push" style="--d:7600ms">',f'<div class="phone push" style="--d:{ms(phone)}ms">')
rep('push 9500ms cubic-bezier(.3,0,.2,1) 9800ms both',f'push 8000ms cubic-bezier(.3,0,.2,1) {ms(cap2[0]-0.5)}ms both')
# painel Estudo de hoje: entra com o telefone, rola quando a legenda 2 entra, sai quando a legenda 3 entra
ph_d=phone; ph_len=cap3[0]-phone
p=lambda t:round((t-ph_d)/ph_len*100,1)
rep('.pane.hoje{background-image:var(--img-hoje);animation:ph 11800ms cubic-bezier(.45,0,.15,1) 7200ms both}',f'.pane.hoje{{background-image:var(--img-hoje);animation:ph {ms(ph_len)}ms cubic-bezier(.45,0,.15,1) {ms(ph_d)}ms both}}')
rep('@keyframes ph{0%,27%{background-position:0 -211px;transform:none}40%,46.6%{background-position:0 -830px;transform:none}50.2%,100%{background-position:0 -830px;transform:translateX(-100%)}}',f'@keyframes ph{{0%,{p(cap2[0]-0.3)}%{{background-position:0 -211px;transform:none}}{p(cap2[0]+0.5)}%,{p(cap3[0]-0.45)}%{{background-position:0 -830px;transform:none}}100%{{background-position:0 -830px;transform:translateX(-100%)}}}}')
pc_d=cap3[0]-0.45; pc_len=(cap4[0]+0.1)-pc_d
rep('.pane.cad{background-image:var(--img-cad);animation:pc 3500ms cubic-bezier(.45,0,.15,1) 12700ms both}',f'.pane.cad{{background-image:var(--img-cad);animation:pc {ms(pc_len)}ms cubic-bezier(.45,0,.15,1) {ms(pc_d)}ms both}}')
rep('@keyframes pc{0%{transform:translateX(100%);background-position:0 -660px}12%,40%{transform:none;background-position:0 -660px}66%,88%{transform:none;background-position:0 -1150px}100%{transform:translateX(-100%);background-position:0 -1150px}}','@keyframes pc{0%{transform:translateX(100%);background-position:0 -500px}12%,40%{transform:none;background-position:0 -500px}62%,90%{transform:none;background-position:0 -1360px}100%{transform:translateX(-100%);background-position:0 -1360px}}')
pm_d=cap4[0]-0.35; pm_len=s5_start-pm_d
rep('.pane.home{background-image:var(--img-home);animation:pm 3900ms cubic-bezier(.45,0,.15,1) 15750ms both}',f'.pane.home{{background-image:var(--img-home);animation:pm {ms(pm_len)}ms cubic-bezier(.45,0,.15,1) {ms(pm_d)}ms both}}')
rep('@keyframes pm{0%{transform:translateX(100%);background-position:0 -560px}11%,30%{transform:none;background-position:0 -560px}62%,100%{transform:none;background-position:0 -1590px}}','@keyframes pm{0%{transform:translateX(100%);background-position:0 -560px}12%,35%{transform:none;background-position:0 -560px}64%,100%{transform:none;background-position:0 -1590px}}')
rep('<div class="call" style="--d:8500ms;--len:1700ms;',f'<div class="call" style="--d:{ms(s3_start+0.9)}ms;--len:1700ms;')
rep('<div class="tagline" style="--d:8700ms;--len:1500ms;',f'<div class="tagline" style="--d:{ms(s3_start+1.1)}ms;--len:1500ms;')
old=re.search(r'<div class="call" style="--d:13300ms;--len:1500ms;[^"]*"></div>',s).group(0)
rep(old,f'<div class="call" style="--d:{ms(m["cada"][0]+0.27)}ms;--len:1400ms;left:520px;top:1040px;width:426px;height:198px;background-image:var(--img-cad);background-size:2340px auto;background-position:-1110px -2112px"></div>')
# S5
rep('<section class="scene" style="--d:19600ms;--len:3600ms"><div class="cam" style="--d:19600ms;--len:3600ms">',f'<section class="scene" style="--d:{ms(s5_start)}ms;--len:{ms(s6_start-s5_start)}ms"><div class="cam" style="--d:{ms(s5_start)}ms;--len:{ms(s6_start-s5_start)}ms">')
rep('<div class="pr in" style="--d:19700ms"><div class="v num wipe" style="--d:19800ms">',f'<div class="pr in" style="--d:{ms(m["3500"][0]-0.05)}ms"><div class="v num wipe" style="--d:{ms(m["3500"][0]+0.05)}ms">')
rep('<div class="pr in" style="--d:20500ms"><div class="v num c100" style="--d:20600ms">',f'<div class="pr in" style="--d:{ms(m["todas"][0]-0.08)}ms"><div class="v num c100" style="--d:{ms(m["todas"][0]+0.02)}ms">')
rep('<div class="pr in" style="--d:21300ms"><div class="v num c20" style="--d:21400ms">',f'<div class="pr in" style="--d:{ms(m["vinte"][0]-0.08)}ms"><div class="v num c20" style="--d:{ms(m["vinte"][0]+0.02)}ms">')
# S6
rep('<section class="scene last" style="--d:23200ms;--len:4800ms">',f'<section class="scene last" style="--d:{ms(s6_start)}ms;--len:{ms(total-s6_start)}ms">')
rep('style="--d:23300ms;--len:2300ms">Seu tempo é curto.',f'style="--d:{ms(m["aleatorio"][0]-0.2)}ms;--len:{ms(m["marca"][0]-0.15-(m["aleatorio"][0]-0.2))}ms">Seu tempo é curto.')
rep('<img class="in" style="--d:25500ms"',f'<img class="in" style="--d:{ms(m["marca"][0])}ms"')
rep('<div class="w in" style="--d:25650ms">',f'<div class="w in" style="--d:{ms(m["marca"][0]+0.15)}ms">')
rep('<div class="guar in" style="--d:26000ms">',f'<div class="guar in" style="--d:{ms(m["garantia"][0]-0.05)}ms">')
rep('<div class="cta" style="--d:26400ms">',f'<div class="cta" style="--d:{ms(m["assine"][0]-0.05)}ms">')
rep('<div class="url in" style="--d:26700ms">',f'<div class="url in" style="--d:{ms(m["assine"][0]+0.3)}ms">')
rep('<path stroke="#6AA8FF" style="--d:25400ms;--len:2400ms"',f'<path stroke="#6AA8FF" style="--d:{ms(m["marca"][0])}ms;--len:{ms(total-m["marca"][0]-0.3)}ms"')
# globais
rep('animation:bgdrift 28s ease-in-out',f'animation:bgdrift {total:.1f}s ease-in-out')
rep('animation:bug 23000ms linear 300ms both',f'animation:bug {ms(s6_start-0.3)}ms linear 300ms both')
rep("const TOTAL=28000",f"const TOTAL={ms(total)}"); rep('max="28000"',f'max="{ms(total)}"'); rep("0.0 s / 28.0 s",f"0.0 s / {total:.1f} s"); rep("' s / 28.0 s'",f"' s / {total:.1f} s'")
rep("starts=[0,3200,7400,10200,12800,15700,19600,23200]",f"starts=[0,{ms(s2_start)},{ms(s3_start)},{ms(cap2[0])},{ms(cap3[0])},{ms(cap4[0])},{ms(s5_start)},{ms(s6_start)}]")
open('src/template-v5.html','w',encoding='utf-8').write(s)
b=lambda p_,mm:f'data:{mm};base64,'+base64.b64encode(open(p_,'rb').read()).decode()
out=s.replace('__HOME__',b('src/home.jpg','image/jpeg')).replace('__HOJE__',b('src/hoje.jpg','image/jpeg')).replace('__CAD2__',b('src/cad2.jpg','image/jpeg')).replace('__LOGO__',b('src/logo.png','image/png'))
name=sys.argv[1] if len(sys.argv)>1 else 'anestesia-questoes-anuncio.html'
open(name,'w',encoding='utf-8').write(out); print('ok',name,'total',round(total,2),'s | cenas',[round(v,2) for v in (s2_start,s3_start,cap2[0],cap3[0],cap4[0],s5_start,s6_start)])
