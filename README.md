# Filipe de Jesus 666

Memorial de aniversário em página única, com estética fúnebre monocromática e clímax de ressurreição.

## Executar localmente

No terminal, dentro desta pasta:

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` no navegador. O áudio começa somente depois de uma interação e pode ser controlado no cabeçalho.

## Estrutura

- `index.html`: conteúdo e marcação semântica da experiência.
- `css/`: tokens, estilos, animações e responsividade.
- `js/`: estado global, partículas, áudio, interações e minigame.
- `assets/images/filipe.png`: fotografia utilizada no memorial.
- `assets/audio/filipe.mp3`: música copiada da pasta `song/`.

## Persistência

O áudio, volume e mensagens do livro de condolências usam `localStorage`. Não há backend nem envio de dados para fora do navegador.

## Conteúdo

A mensagem da homenagem fica no bloco `#message-content` de `index.html` e foi mantida no HTML para preservar o texto manualmente inserido.
