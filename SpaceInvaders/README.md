# SpaceInvaders

Documentazione completa [qui](https://docs.google.com/document/d/14T1fui3OTSQa4ogG3HG2uR-T-FQVwuEgAVC3igfef1s/edit?usp=sharing)

## Comandi

- Muovi la navicella con le frecce oppure con W, A, S, D.
- Tieni premuta la barra spaziatrice per sparare.
- Completa un livello per aumentare velocità, cadenza di fuoco e vita massima.

## Minime modifiche da provare

1. **Cambia lo sfondo.** Sostituisci `assets/background.png` con `assets/pascal-background.png` in style.css;
2. **Ingrandisci o rimpicciolisci gli oggetti.** In `style.css` cerca `width` nelle regole `.player`, `.bullet` e `.alien`.
3. **Modifica la velocità dello sfondo.** In `style.css` cerca `animation: bgscroll 10s` e prova un numero diverso: un numero più piccolo fa scorrere lo sfondo più velocemente.
4. **Aumenta la velocità dei proiettili.** In `scripts/bullet.js` modifica `this.speed = 500`: un valore più alto li farà muovere più velocemente.
5. **Modifica la grandezza del player.** In `style.css` cambia `width: 120px` nella regola `.player`: un valore più alto ingrandisce la navicella, uno più basso la rimpicciolisce.
