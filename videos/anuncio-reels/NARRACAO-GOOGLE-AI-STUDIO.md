# Narração do anúncio de 28 s · guia para o Google AI Studio

## Onde e como (interface atual: Gemini 3.1 Flash TTS Preview)

1. No Playground de fala, clique no template **The Ad Voiceover** ("A smooth, premium commercial voice"). Ele já configura voz e tom de comercial.
2. Apague o texto de exemplo e cole o bloco "Prompt completo" abaixo. Nessa versão não existe campo separado de estilo: a direção vai no início do texto e nas tags entre colchetes.
3. Em **Run settings**, à direita: modelo `gemini-3.1-flash-tts-preview` (já selecionado), Temperature 1. Se aparecer o seletor de voz (ele surge quando há texto ou dentro de Model settings), escolha **Charon**. Alternativa feminina: **Kore**.
4. Clique em Run, ouça, e baixe pelo ícone de download do áudio gerado. Gere 2 ou 3 vezes e fique com a leitura mais natural.
5. Salve como `videos/anuncio-reels/narracao.wav` (ou .mp3, também serve) e me avise.

## Prompt completo (copiar inteiro no campo de texto)

```
Narre em português do Brasil como um narrador de comercial premium de tecnologia médica, falando com anestesiologistas. Voz grave, calma e segura, sem tom de vendedor. Ritmo ágil, frases curtas, pausas breves nas reticências. Não leia as instruções nem as tags, apenas o roteiro.

[calm, confident] Você tem quarenta minutos entre um plantão e outro... [short pause] O que você estuda?

[slightly faster] Revisa o que já sabe? Abre um livro na página um? Responde uma questão solta do grupo?

[slow, serious, weighty] Estudar sem direção... custa pontos.

[warm, assured] O Anestesia Questões já montou os seus quarenta minutos. Questão, flashcard, erro... na ordem certa. Cada erro volta comentado. E você vê exatamente onde perde pontos.

[clear, deliberate] Mais de três mil e quinhentas questões. Cem por cento comentadas. Vinte anos de provas de ME, TEA e TSA.

[calm] Seu tempo é curto. Seu estudo não precisa ser aleatório.

[firm, final] Anestesia Questões. Sete dias de garantia. Assine agora.
```

Se o áudio sair lendo alguma tag em voz alta, remova as tags entre colchetes e mantenha só o parágrafo de instrução inicial; o modelo continua seguindo a direção.

## Marcação de tempo (para conferência)

A narração precisa caber em 27 s. Se a sua leitura passar de 28 s, eu ajusto a duração das cenas em vez de acelerar a voz.

| Trecho | Deve terminar até |
|---|---|
| "...O que você estuda?" | 3,2 s |
| "...custa pontos." | 7,4 s |
| "...onde perde pontos." | 19,6 s |
| "...ME, TEA e TSA." | 23,2 s |
| "...Assine agora." | 27,5 s |
