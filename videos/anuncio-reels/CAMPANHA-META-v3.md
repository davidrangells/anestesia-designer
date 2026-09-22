# Anestesia Questões · Anúncio Reels 28 s (v3, com telas reais)

## Arquivos

| Arquivo | Uso |
|---|---|
| `anestesia-questoes-anuncio-28s-1080x1920.mp4` | Versão final com trilha. Subir no Gerenciador de Anúncios. |
| `anestesia-questoes-anuncio-28s-1080x1920-mudo.mp4` | Mesma imagem, sem áudio. Para colocar locução ou música licenciada por cima. |
| `anestesia-questoes-anuncio-28s.html` | Fonte editável. Abra no Chrome: tem botão que mostra as zonas seguras do Reels. |
| `render-video-audio.mjs` | Gera o MP4 (H.264 + AAC) com o Chrome instalado. `--mute` tira o áudio. |

## Checklist técnico do Meta (conferido)

| Quesito | Recomendação do Meta | Este vídeo |
|---|---|---|
| Proporção | 9:16 para Reels e Stories | 1080×1920 |
| Duração | Reels aceita mais, mas anúncio performa melhor abaixo de 30 s | 28 s |
| Gancho | Mensagem principal nos 3 primeiros segundos | "40 min" aos 0,2 s, pergunta aos 1,7 s |
| Marca | Aparecer cedo | Logo fixo no topo desde 0,3 s |
| Som desligado | Entender tudo sem áudio | 100% do argumento está em texto na tela |
| Zona segura | Topo 14% e base 35% livres de texto e botão | Todo texto e CTA entre 270 px e 1250 px |
| Codec | MP4, H.264, AAC, 30 fps | H.264 High, AAC 192 kbps, 30 fps |
| Texto na tela | Pouco, legível no celular | Máximo de 2 linhas por legenda, corpo acima de 56 px |

## Estrutura persuasiva

| Tempo | Etapa | O que o anestesista pensa | Alavanca |
|---|---|---|---|
| 0–3,2 s | Gancho | "Isso sou eu" | Especificidade: 40 min entre plantões, traçado de monitor |
| 3,2–7,4 s | Agitação | "Eu faço exatamente isso" | Três escolhas ruins que todo residente já fez. Monitor acelera. Aversão à perda: "custa pontos" |
| 7,4–10,2 s | Virada | "Espera, ele monta pra mim?" | O próprio app mostra "~40 min estimados". O gancho vira o produto |
| 10,2–19,6 s | Demonstração | "É real e é simples" | Telas reais: plano do dia, erro comentado com selo "Errou 4×", tema para focar com 38% |
| 19,6–23,2 s | Prova | "É robusto" | +3.200 questões, 100% comentadas, 20 anos de ME, TEA e TSA |
| 23,2–28 s | Fechamento | "Não tenho nada a perder" | Reversão de risco: 7 dias de garantia. CTA único |

## Texto do anúncio (copiar no Gerenciador)

**Texto principal (opção A, dor):**
Você tem 40 minutos entre um plantão e outro. Se gastar 15 decidindo o que estudar, sobram 25.
O Anestesia Questões monta o seu plano do dia sozinho: questão, flashcards, seus erros e o tema em que você mais perde pontos. +3.200 questões de ME, TEA e TSA, todas comentadas.
Teste por 7 dias. Não gostou, devolvemos 100%.

**Texto principal (opção B, direto):**
+3.200 questões comentadas de ME, TEA e TSA. Caderno de erros automático. Plano de estudo diário de 40 minutos. Feito por anestesiologistas, para a sua prova. 7 dias de garantia.

**Título:** Estude anestesia com direção
**Descrição:** 7 dias de garantia · ME, TEA e TSA
**Botão:** Assinar (ou "Saiba mais" no público frio)
**Destino:** landing com UTM, por exemplo `?utm_source=meta&utm_medium=reels&utm_campaign=v3-40min`

## Campanha sugerida

1. **Público frio.** Objetivo Vendas, evento de compra via pixel na Eduzz. Brasil, 24 a 45 anos. Interesses: anestesiologia, Sociedade Brasileira de Anestesiologia, residência médica. Rode também um conjunto aberto (sem interesse) e deixe o algoritmo achar.
2. **Remarketing 14 dias.** Quem viu 50% do vídeo ou visitou a landing. Use só os últimos 9 s (prova + garantia).
3. **Orçamento de teste.** 3 criativos × 7 dias. Corte o que tiver retenção de 3 s abaixo de 25% ou custo por clique 50% acima da média.

Métricas para julgar o criativo: taxa de retenção em 3 s (gancho), reprodução até 15 s (demonstração), CTR no link e custo por início de checkout.

## Variações de gancho para teste A/B

Troque só a cena 1 no HTML e renderize de novo:

- "Você tem 40 min entre um plantão e outro. O que você estuda?" (atual)
- "TEA em 90 dias. Qual tema você ainda não fechou?"
- "Você errou essa questão 4 vezes. E nem sabe."

## Antes de subir

- **Números:** o vídeo usa +3.200 (o banco tem 3.252). A landing diz 3.500+. Alinhe a landing.
- **Dados das telas:** o layout é o real do app, capturado da conta logada. Nome, aproveitamento e contagens foram trocados por valores ilustrativos ("Dra. Marina", 74%) para não expor sua conta.
- **Trilha:** é sintetizada, sem direitos de terceiros. Eu não consigo ouvir o resultado, então escute antes de publicar. Se não gostar, use a versão muda com música da biblioteca do Meta.
- **Bug encontrado no app:** o texto "39 questãos pendentes" aparece na Início e no Estudo de hoje. No vídeo já está "questões".

## Regenerar

```bash
cd ~/Projetos/anestesia-designer/videos/anuncio-reels && npm i --no-save puppeteer-core@23 && node render-video-audio.mjs anestesia-questoes-anuncio-28s.html saida.mp4 30 0 28000
```
