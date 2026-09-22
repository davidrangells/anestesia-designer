# Anestesia Questões · Vídeo de apresentação (Meta Ads)

Arquivos nesta pasta:

| Arquivo | O que é |
|---|---|
| `anestesia-questoes-apresentacao.html` | A peça animada (1080×1920, 62 s). Abra no Chrome para assistir, pausar e navegar por cena. |
| `anestesia-questoes-apresentacao-1080x1920.mp4` | O vídeo renderizado (H.264, 30 fps, sem áudio). Pronto para subir no Gerenciador de Anúncios. |
| `render-video.mjs` | Script que gera o MP4 a partir do HTML usando o Google Chrome instalado (não precisa de ffmpeg). |

## Números usados (conferidos no Firestore em 10/09/2026)

| Dado | Valor real | Como aparece no vídeo |
|---|---|---|
| Questões no banco | 3.252 (ME 1.395 · TEA 934 · TSA 923) | "+3.200 questões" |
| Questões com comentário | 3.252 de 3.252 | "100% comentadas" |
| Anos de prova | 2003 a 2023 (+8 autorais 2026) | "20 anos de provas" |
| Temas usados | 56 | "56 temas" |
| Flashcards | 669 em 32 decks | "669 flashcards em 32 decks" |
| Preço | 12× R$ 108,39 ou R$ 1.048 à vista | igual à landing |

Atenção: a landing page diz "3.500+ questões" e o banco tem 3.252. Alinhe um dos dois antes de rodar a campanha (o Meta e o Procon cobram consistência entre anúncio e página).

## Roteiro por cena (com locução sugerida)

| # | Tempo | Cena | Texto na tela | Locução (voz masculina ou feminina, tom direto, sem "vendedor") |
|---|---|---|---|---|
| 1 | 0–4,5 s | Gancho | Cronômetro 40:00 → 38:00 · "Você tem 40 minutos. Estuda o quê?" | "Entre um plantão e outro sobram quarenta minutos. Você estuda o quê?" |
| 2 | 4,5–11,5 s | Dor | Cards caóticos (Miller, PDFs, WhatsApp) · 3 dores | "Livro, PDF, questão solta no grupo. O problema não é estudar pouco. É não saber onde estão seus pontos fracos." |
| 3 | 11,5–15,5 s | Marca | Logo · "Estude com direção." | "Anestesia Questões. Estude com direção." |
| 4 | 15,5–25 s | Simulado | Filtros ME/TEA/TSA, tema, ano · questão real · comentário sobe | "Monte o simulado por prova, tema e ano. Cada questão vem com comentário clínico e referência." |
| 5 | 25–33 s | Dashboard | Acerto 74% · barras por tema · "Tema para focar" | "O dashboard mostra exatamente onde você perde pontos. Sem achismo sobre o que revisar." |
| 6 | 33–41 s | Erros + flashcards | 28 erros pendentes · flashcard vira | "Cada erro vira um flashcard com revisão espaçada. Você revê o que errou, no momento certo." |
| 7 | 41–47,5 s | Estudo de hoje | Checklist do dia · app iOS incluído | "Abriu o app, o plano do dia já está pronto. No computador ou no iPhone, com o mesmo progresso." |
| 8 | 47,5–54,5 s | Números | +3.200 questões · 20 anos · 56 temas · 669 flashcards · 100% | "Mais de três mil e duzentas questões de ME, TEA e TSA. Vinte anos de prova. Todas comentadas." |
| 9 | 54,5–62 s | Oferta | 12× R$ 108,39 · itens inclusos · "Assinar agora" · 7 dias de garantia | "Doze meses de acesso completo por doze vezes de cento e oito reais. Sete dias de garantia. Assine agora." |

Áudio: o MP4 sai mudo. Grave a locução acima (ou use ElevenLabs/Play.ht em pt-BR) e coloque uma trilha discreta. No Meta, 70% das pessoas assistem sem som, por isso todo o texto já está na tela. Se subir com locução, ative as legendas automáticas do Meta.

## Cortes recomendados para a campanha

O mesmo HTML gera qualquer trecho. O script aceita início e fim em milissegundos:

```bash
node render-video.mjs anestesia-questoes-apresentacao.html corte-15s.mp4 30 0 15500
```

| Corte | Cenas | Uso |
|---|---|---|
| 62 s (master) | 1 a 9 | Página do produto, YouTube, WhatsApp, público morno |
| 30 s | 1, 2, 4, 8, 9 (edite no CapCut/Premiere a partir do master) | Reels e Stories, público frio |
| 15 s | 1, 3, 9 | Abertura da campanha, teste de gancho |
| 6 s | só cena 1 | Bumper para remarketing |

Para Feed 4:5 ou 1:1, recorte a partir do vertical. Tudo que importa está na faixa central de segurança.

## Estrutura de campanha sugerida (Meta)

1. **Público frio, objetivo Vendas com pixel Eduzz ou Leads.** Interesses: anestesiologia, SBA, residência médica, TEA; idade 25–45; Brasil. Criativos: corte 15 s (gancho) contra 30 s (dor + prova). Mede custo por clique na landing.
2. **Remarketing 7 dias** para quem assistiu 50% do vídeo ou visitou a landing: cena 9 isolada + depoimento de aluno. Mensagem: garantia de 7 dias e R$ 2,87 por dia.
3. **Remarketing 30 dias**: bumper de 6 s com o cronômetro e o link direto para o checkout Eduzz.

Três ganchos para teste A/B na cena 1 (troque o texto no HTML e renderize de novo):
- "Você tem 40 minutos. Estuda o quê?" (atual)
- "Sua última prova de anestesia: você sabia onde estava errando?"
- "TEA em 90 dias. Qual tema você ainda não fechou?"

## Como regenerar o vídeo depois de editar o HTML

Requisitos: Google Chrome instalado e Node 20. O `puppeteer-core` foi instalado só na pasta temporária da sessão; para rodar de novo:

```bash
cd ~/Projetos/anestesia-designer/videos/anuncio-reels && npm i --no-save puppeteer-core@23 && node render-video.mjs anestesia-questoes-apresentacao.html saida.mp4 30 0 62000
```

Argumentos: `html`, `saída.mp4`, `fps`, `início ms`, `fim ms`.

---

# Versão 2 · Reels 30 s (reconstruída do zero)

Arquivos: `anestesia-questoes-reels-30s.html` (fonte) e `anestesia-questoes-reels-30s-1080x1920.mp4` (H.264, 30 fps, sem áudio).

| # | Tempo | Cena | Na tela | Locução sugerida (opcional; o vídeo funciona mudo) |
|---|---|---|---|---|
| 1 | 0–4 s | Gancho | "Você tem 40 minutos entre um plantão e outro." · 40 MIN gigante com anel esvaziando e cronômetro · "O que você estuda?" | "Quarenta minutos entre um plantão e outro. O que você estuda?" |
| 2 | 4–8 s | Dor | Livro, PDF, prova, anotações e WhatsApp voando para a tela · "Conteúdo demais." "Tempo de menos." "E uma prova pela frente." · "Estudar sem direção custa pontos." | "Conteúdo demais, tempo de menos, e uma prova pela frente. Estudar sem direção custa pontos." |
| 3 | 8–11 s | Virada | Tela limpa · "Anestesia Questões" · "Seu estudo começa a ter direção." · smartphone sobe com a tela Início | "Anestesia Questões. Seu estudo começa a ter direção." |
| 4 | 11–21 s | Sistema | Mesmo telefone, cinco telas encadeadas: Novo simulado → Desempenho → Caderno de Erros → flashcard → Estudo de hoje. Trilho embaixo: Questão · Desempenho · Erro · Revisão · Próximo estudo | "Treine para ME, TEA e TSA. Descubra onde você mais erra. Transforme erros em revisão. E saiba exatamente onde focar." |
| 5 | 21–25 s | Robustez | +3.200 questões · 100% comentadas · 20 anos de provas | "Mais de três mil e duzentas questões, todas comentadas, de vinte anos de provas." |
| 6 | 25–30 s | Fechamento | "Seu tempo é limitado." · "Seu estudo não precisa ser aleatório." · logo · "Comece agora" | "Seu tempo é limitado. Seu estudo não precisa ser aleatório. Comece agora." |

Sem preço, por decisão de roteiro. O CTA leva para anestesiaquestoes.com.br.

Regenerar após editar o HTML:

```bash
cd ~/Projetos/anestesia-designer/videos/anuncio-reels && npm i --no-save puppeteer-core@23 && node render-video.mjs anestesia-questoes-reels-30s.html reels.mp4 30 0 30000
```
