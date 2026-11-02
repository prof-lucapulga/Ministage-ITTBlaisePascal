/* ============================================================================
   CYBER BREAK — OPERAZIONE PASCAL CYBER
   Logica del laboratorio (JavaScript puro, nessuna libreria esterna).

   MAPPA DEL FILE — se dovete modificare qualcosa, cercate la sezione giusta:

     1. CONFIGURAZIONE   → pool di parole, durata, costo indizi.
                           
     2. UTILITÀ           → funzioni di supporto (cifrario di Cesare, SHA-256,
                            numeri casuali, salvataggio locale).
     3. SESSIONE DI GIOCO → genera le parole/chiavi casuali di una partita.
     4. STATO DI GIOCO    → l'oggetto S che rappresenta "a che punto siamo".
     5. TIMER             → conto alla rovescia in alto.
     6. SCHERMATE (HTML)  → una funzione renderXxx() per ogni schermata.
     7. EVENTI (WIRING)   → cosa succede quando si clicca un pulsante.
     8. PANNELLO DOCENTE  → overlay locale (pausa, reset, domande di debrief) 
                            [si può non far vedere, utile per una versione futura c/s].
     9. AVVIO             → punto di ingresso, eseguito al caricamento pagina.

   Ogni "squadra" (= ogni volta che si preme "Avvia missione" o "Nuova
   squadra") riceve parole e chiavi diverse, pescate a caso dalle liste in
   CONFIGURAZIONE, così due squadre vicine non hanno lo stesso messaggio da
   decifrare. Lo stato della partita in corso è salvato nel localStorage del
   browser, così un aggiornamento accidentale della pagina non fa perdere il
   progresso alla squadra seduta in quel momento.
   ============================================================================ */
(function(){
"use strict";

/* ============================================================================
   1. CONFIGURAZIONE
   Tutti i valori che si possono voler cambiare stanno qui.
   - aggiungere/togliere frasi dai pool della Missione 1 e 2;
   - aggiungere/togliere password dal pool della Missione 3;
   - cambiare la durata del laboratorio;
   - cambiare quanto tempo "costano" il 2° e 3° indizio.
   ============================================================================ */
const CONFIG = {

  // Durata del laboratorio, in minuti. Diventa il conto alla rovescia in alto.
  durataMinutiTotali: 45,

  // Pool di frasi per la MISSIONE 1 (cifrario di Cesare a chiave nota).
  // Regola importante: solo lettere maiuscole A-Z e spazi, niente numeri,
  // accenti o punteggiatura (altrimenti il cifrario di Cesare non funziona
  // correttamente). Ad ogni partita ne viene estratta una a caso.
  poolMissione1: [
    'HELLO WORLD',
    'GOOD MORNING',
    'OPEN THE DOOR',
    'SAVE THE FILE',
    'RUN THE CODE',
    'TRUST NO ONE',
    'WE ARE ONLINE',
    'ACCESS GRANTED'
  ],

  // Intervallo da cui viene scelta a caso la chiave "nota" della Missione 1
  // (quella mostrata ai ragazzi, es. "la chiave sembra essere 3").
  chiaveMissione1Min: 2,
  chiaveMissione1Max: 8,

  // Pool di frasi per la MISSIONE 2 (brute force, chiave NON mostrata:
  // i ragazzi la trovano facendo eseguire il ciclo Python su tutte e 26
  // le possibilità). Stessa regola: solo lettere maiuscole e spazi.
  poolMissione2: [
    'THE KEY IS LOCKED',
    'THE SYSTEM IS SAFE',
    'FOLLOW THE SIGNAL',
    'THE CODE IS HIDDEN',
    'CHECK THE ARCHIVE',
    'THE NETWORK IS DOWN',
    'DECODE THE MESSAGE',
    'THE DOOR IS OPEN'
  ],

  // Pool di password per la MISSIONE 3 (hashing). Ad ogni partita una di
  // queste viene scelta a caso come "password vera" da far scoprire;
  // tutte le altre restano nella lista come esche. 
  // Minuscolo, solo lettere e cifre ASCII (niente accenti: la funzione di hashing non li supporta).
  poolPassword: [
    'password', '123456', 'qwerty', 'admin', 'computer',
    'dragon', 'school', 'sunshine', 'football', 'princess'
  ],

  // Secondi sottratti al timer quando la squadra chiede il 2° e il 3°
  // indizio di una missione (il 1° indizio è sempre gratuito).
  costoIndizio2: 30,
  costoIndizio3: 60
};


/* ============================================================================
   2. UTILITÀ
   ============================================================================ */

// Crea un nodo DOM a partire da una stringa HTML (usato per inserire blocchi
// generati dinamicamente, es. il pulsante che appare dopo l'esecuzione del
// codice in Missione 2).
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

// Intero casuale tra min e max, estremi inclusi.
function randomInt(min, max){ return min + Math.floor(Math.random()*(max-min+1)); }

// Un elemento a caso da un array.
function pickRandom(arr){ return arr[randomInt(0, arr.length-1)]; }

// Un elemento a caso da un array, evitando (quando possibile) un valore
// specifico — usato per non far capitare per caso la stessa frase in
// Missione 1 e Missione 2.
function pickRandomExcluding(arr, exclude){
  const filtered = arr.filter(x => x !== exclude);
  return filtered.length ? pickRandom(filtered) : pickRandom(arr);
}

// Mescola un array senza modificare l'originale: usato per
// mostrare la lista delle password della Missione 3 in ordine diverso ogni
// partita.
function shuffleArray(arr){
  const a = arr.slice();
  for (let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Cifrario di Cesare: applica uno spostamento ("shift") a ogni lettera di
// "text". Con shift positivo si DECIFRA (è quello che fanno i ragazzi);
// con shift negativo si CIFRA (è quello che usiamo noi per generare il
// messaggio segreto a partire dalla frase in chiaro). I caratteri non
// alfabetici (spazi) restano invariati, maiuscole/minuscole sono rispettate.
function caesarShift(text, shift){
  return text.split('').map(ch=>{
    const up = ch.toUpperCase();
    if (up>='A' && up<='Z'){
      const pos = up.charCodeAt(0)-65;
      const np = ((pos - shift) % 26 + 26) % 26;
      const out = String.fromCharCode(np+65);
      return ch===up ? out : out.toLowerCase();
    }
    return ch;
  }).join('');
}
// Cifra un testo in chiaro con una data chiave (comodo alias di caesarShift
// usato in fase di generazione della sessione di gioco).
function encodeCaesar(text, key){ return caesarShift(text, -key); }

/* SHA-256 in puro JavaScript (nessuna dipendenza da crypto.subtle):
   funziona anche se la pagina viene servita in http:// semplice sulla rete
   dell'istituto, dove crypto.subtle non è disponibile perché il browser
   non considera quel contesto "sicuro". Accetta solo testo ASCII (le parole
   del laboratorio lo sono sempre). Implementazione standard FIPS 180-4,
   non serve capirne i dettagli per modificare il resto del laboratorio. */
function sha256Sync(ascii){
  function rightRotate(value, amount){ return (value>>>amount) | (value<<(32-amount)); }
  const mathPow = Math.pow, maxWord = mathPow(2,32);
  let i, j, result = '';
  const words = [];
  const asciiBitLength = ascii.length*8;
  let hash = sha256Sync.h = sha256Sync.h || [];
  let k = sha256Sync.k = sha256Sync.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate=2; primeCounter<64; candidate++){
    if (!isComposite[candidate]){
      for (i=0; i<313; i+=candidate) isComposite[i]=candidate;
      hash[primeCounter] = (mathPow(candidate,.5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate,1/3)*maxWord)|0;
    }
  }
  ascii += '\x80';
  while (ascii.length%64 - 56) ascii += '\x00';
  for (i=0; i<ascii.length; i++){
    j = ascii.charCodeAt(i);
    if (j>>8) return null; // solo ASCII
    words[i>>2] |= j << ((3-i)%4)*8;
  }
  words[words.length] = ((asciiBitLength/maxWord)|0);
  words[words.length] = (asciiBitLength);
  for (j=0; j<words.length;){
    const w = words.slice(j, j+=16);
    const oldHash = hash;
    hash = hash.slice(0,8);
    for (i=0; i<64; i++){
      const w15 = w[i-15], w2 = w[i-2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25))
        + ((e&hash[5])^((~e)&hash[6]))
        + k[i]
        + (w[i] = (i<16) ? w[i] : (
            w[i-16]
            + (rightRotate(w15,7) ^ rightRotate(w15,18) ^ (w15>>>3))
            + w[i-7]
            + (rightRotate(w2,17) ^ rightRotate(w2,19) ^ (w2>>>10))
          )|0
        );
      const temp2 = (rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22))
        + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash = [(temp1+temp2)|0].concat(hash);
      hash[4] = (hash[4]+temp1)|0;
    }
    for (i=0; i<8; i++) hash[i] = (hash[i]+oldHash[i])|0;
  }
  for (i=0; i<8; i++){
    for (j=3; j+1; j--){
      const b = (hash[i]>>(j*8))&255;
      result += ((b<16)?'0':'')+b.toString(16);
    }
  }
  return result;
}
// Wrapper async: usa sempre l'implementazione pura sopra; se per qualche
// motivo fallisse (testo non ASCII), tenta crypto.subtle come ripiego.
async function sha256(text){
  const direct = sha256Sync(text);
  if (direct) return direct;
  try{
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ return '(hash non disponibile)'; }
}

function saveLocal(){
  try{ localStorage.setItem('cyberbreak_state', JSON.stringify(S)); }catch(e){}
}
function loadLocal(){
  try{ const raw = localStorage.getItem('cyberbreak_state'); return raw? JSON.parse(raw): null; }catch(e){ return null; }
}


/* ============================================================================
   3. SESSIONE DI GIOCO
   Qui vengono estratte a caso le parole e le chiavi di UNA partita, pescando
   dalle liste in CONFIGURAZIONE. Il risultato viene salvato dentro allo
   stato di gioco (S.session) così resta uguale per tutta la durata della
   partita, anche se la pagina viene aggiornata.
   ============================================================================ */
function generateSession(){
  const m1Text = pickRandom(CONFIG.poolMissione1);
  const m1Key = randomInt(CONFIG.chiaveMissione1Min, CONFIG.chiaveMissione1Max);
  const m1Cipher = encodeCaesar(m1Text, m1Key);

  const m2Text = pickRandomExcluding(CONFIG.poolMissione2, m1Text);
  const m2Key = randomInt(1, 25); // chiave sconosciuta ai ragazzi: la trovano col brute force
  const m2Cipher = encodeCaesar(m2Text, m2Key);

  const m3Target = pickRandom(CONFIG.poolPassword);
  const m3List = shuffleArray(CONFIG.poolPassword); // ordine diverso ogni partita

  return { m1Text, m1Key, m1Cipher, m2Text, m2Key, m2Cipher, m3Target, m3List };
}


/* ============================================================================
   4. STATO DI GIOCO
   S rappresenta "tutto quello che serve per sapere a che punto è la partita
   in corso": schermata attuale, nome squadra, tempo rimasto, indizi usati,
   missioni completate, e la sessione (parole/chiavi) generata al punto 3.
   ============================================================================ */
function freshState(themeLight){
  return {
    screen: 'start',
    team: '',
    timeLeft: CONFIG.durataMinutiTotali*60,
    timerRunning: false,
    hintsUsed: { m1:0, m2:0, m3:0 },
    m1done:false, m2done:false, m3done:false, finaldone:false,
    themeLight: !!themeLight,
    session: generateSession()
  };
}

// Sessione trovata da un utilizzo precedente sullo stesso PC/browser: non
// viene ripresa automaticamente (una squadra diversa potrebbe essersi
// seduta allo stesso posto), ma proposta come scelta nella schermata
// iniziale (vedi renderStart / resumeSaved).
const SAVED = loadLocal();
let pendingResume = (SAVED && SAVED.screen && SAVED.screen !== 'start') ? SAVED : null;
let S = freshState(SAVED && SAVED.themeLight);
let timerHandle = null;

// Azzera tutto e genera una nuova sessione casuale: usata da "Nuova
// squadra" e dal pulsante "Ricomincia esperienza" nel pannello docente.
function resetAll(){
  try{ localStorage.removeItem('cyberbreak_state'); }catch(e){}
  pendingResume = null;
  S = freshState(S.themeLight);
  stopTimer();
  render();
}

// Riprende la sessione trovata salvata (pulsante "Riprendi questa squadra").
function resumeSaved(){
  if (!pendingResume) return;
  S = pendingResume;
  pendingResume = null;
  if (S.timerRunning) startTimer();
  render();
}

function go(screen){ S.screen = screen; saveLocal(); render(); window.scrollTo({top:0, behavior:'instant'}); }


/* ============================================================================
   5. TIMER
   ============================================================================ */
function startTimer(){
  if (timerHandle) return;
  S.timerRunning = true;
  timerHandle = setInterval(()=>{
    if (S.timeLeft>0){ S.timeLeft--; }
    updateTimerUI();
    saveLocal();
  }, 1000);
}
function stopTimer(){ if(timerHandle){ clearInterval(timerHandle); timerHandle=null; } S.timerRunning=false; }
function fmtTime(sec){ const m=Math.floor(sec/60), s=sec%60; return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }
function updateTimerUI(){
  const t = document.getElementById('timerDisplay');
  if (t){ t.textContent = fmtTime(S.timeLeft); t.classList.toggle('low', S.timeLeft<=120); }
}
// Sottrae tempo al timer come "costo" di un indizio (vedi CONFIG.costoIndizio2/3).
function spendHintTime(seconds){
  S.timeLeft = Math.max(0, S.timeLeft - seconds);
  updateTimerUI(); saveLocal();
}

function progressPct(){
  let n = 0;
  if (S.m1done) n++;
  if (S.m2done) n++;
  if (S.m3done) n++;
  if (S.finaldone) n++;
  return Math.round(n/4*100);
}


/* ============================================================================
   6. SCHERMATE (HTML)
   Una funzione renderXxx() per ogni schermata del gioco: restituisce solo
   una stringa HTML, senza effetti collaterali. Il collegamento ai pulsanti
   (cosa succede al click) è tutto nella sezione 7, wireScreen().

   Testi dei tre indizi per missione (1° gratuito, 2° e 3° a pagamento in
   secondi di timer, vedi CONFIG.costoIndizio2/3). Sono scritti in modo
   generico apposta, così restano validi qualunque frase/chiave venga
   estratta a caso dalla sessione.
   ============================================================================ */
const HINTS = {
  m1: [
    'Il computer non serve ancora: ogni lettera è stata spostata sempre della stessa quantità. La chiave ve lo dice.',
    'Per tornare indietro, sposta ogni lettera di quella quantità all\'indietro nell\'alfabeto (es. con chiave 3, la D torna ad essere A).',
    'Fatelo lettera per lettera, mantenendo gli spazi dove sono: il risultato è una frase di senso compiuto in inglese.'
  ],
  m2: [
    'Un computer può ripetere un\'istruzione moltissime volte in pochissimo tempo: è più bravo di voi a provare tutte le chiavi.',
    'La riga da completare deve sottrarre la chiave che il ciclo sta provando in quel momento: quella chiave si chiama "shift".',
    'La parola esatta da scrivere nello spazio vuoto è: shift'
  ],
  m3: [
    'Il server non salva mai la password: salva solo un\'impronta digitale che si ottiene da quella password.',
    'Per riconoscere la password giusta, dovete calcolare l\'impronta (hash) di ogni parola della lista e confrontarla con quella del server.',
    'La riga corretta è: sha256(password) == hash_obiettivo'
  ]
};

function shellTop(missionLabel){
  return `
  <div class="topbar">
    <div class="brand"><b>CYBER BREAK</b> · Operazione Pascal Cyber${missionLabel? ' · '+missionLabel:''}</div>
    <div class="right">
      <div class="timer" id="timerDisplay">${fmtTime(S.timeLeft)}</div>
      <button class="gear-btn" id="gearBtn" title="Pannello docente" aria-label="Pannello docente">⚙</button>
    </div>
  </div>
  <div class="progressbar"><div style="width:${progressPct()}%"></div></div>`;
}

function renderHints(missionKey){
  const used = S.hintsUsed[missionKey];
  const list = HINTS[missionKey];
  let html = '<div class="hints">';
  for (let i=0;i<used;i++){
    html += `<div class="hint-item">Indizio ${i+1}: ${list[i]}</div>`;
  }
  html += '</div><div class="row-btns" style="margin-top:10px">';
  if (used < list.length){
    const cost = used===0? 'gratis' : (used===1? ('-'+CONFIG.costoIndizio2+'s') : ('-'+CONFIG.costoIndizio3+'s'));
    html += `<button class="ghost" data-hint="${missionKey}">Chiedi un indizio (${cost})</button>`;
  }
  html += '</div>';
  return html;
}

function bindHintButtons(){
  document.querySelectorAll('[data-hint]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const key = b.getAttribute('data-hint');
      const used = S.hintsUsed[key];
      if (used===1) spendHintTime(CONFIG.costoIndizio2);
      if (used===2) spendHintTime(CONFIG.costoIndizio3);
      S.hintsUsed[key] = used+1;
      saveLocal(); render();
    });
  });
}

function bindGear(){
  const g = document.getElementById('gearBtn');
  if (g) g.addEventListener('click', openTeacherPanel);
}

// Router principale: in base a S.screen sceglie quale funzione renderXxx()
// chiamare, inserisce l'HTML nella pagina, poi ricollega gli eventi.
function render(){
  const app = document.getElementById('app');
  let html = '';
  if (S.screen==='start'){ app.innerHTML = renderStart(); bindHintButtons(); bindGear(); wireScreen(); updateTimerUI(); applyTheme(); return; }
  else if (S.screen==='brief'){ html = shellTop('') + renderBrief(); }
  else if (S.screen==='m1'){ html = shellTop('Missione 01') + renderM1(); }
  else if (S.screen==='m1b'){ html = shellTop('Missione 01') + renderM1b(); }
  else if (S.screen==='m2intro'){ html = shellTop('Missione 02') + renderM2Intro(); }
  else if (S.screen==='m2ex1'){ html = shellTop('Missione 02') + renderM2Ex1(); }
  else if (S.screen==='m2ex2'){ html = shellTop('Missione 02') + renderM2Ex2(); }
  else if (S.screen==='m2done'){ html = shellTop('Missione 02') + renderM2Done(); }
  else if (S.screen==='m3intro'){ html = shellTop('Missione 03') + renderM3Intro(); }
  else if (S.screen==='m3quiz'){ html = shellTop('Missione 03') + renderM3Quiz(); }
  else if (S.screen==='m3crack'){ html = shellTop('Missione 03') + renderM3Crack(); }
  else if (S.screen==='final'){ html = shellTop('Black Box') + renderFinal(); }
  else if (S.screen==='end'){ html = shellTop('Completato') + renderEnd(); }
  app.innerHTML = `<div class="wrap"><div class="stage">${html}</div></div>`;
  bindHintButtons(); bindGear();
  wireScreen();
  updateTimerUI();
  applyTheme();
}

function applyTheme(){
  document.documentElement.setAttribute('data-theme', S.themeLight? 'light':'dark');
}

/* ---- schermata iniziale ---- */
function renderStart(){
  return `
  <div class="wrap">
    <div class="start-hero">
      <div class="logo">◈ CYBER UNIT — ACCESSO INIZIALE</div>
      <h1 class="big" style="margin-top:14px">Operazione Pascal Cyber</h1>
      <p class="lead" style="margin:0 auto">Una rete è stata compromessa. Avete poco tempo per recuperare le informazioni.
      Non vi serve essere hacker: vi serve capire come pensa un computer.</p>
    </div>
    ${pendingResume ? `
    <div class="panel" style="border-color:var(--signal-dim)">
      <div class="eyebrow">SESSIONE IN SOSPESO SU QUESTO COMPUTER</div>
      <p class="lead" style="font-size:14.5px;margin:8px 0 16px">Squadra "<b style="color:var(--text)">${pendingResume.team||'senza nome'}</b>", tempo rimasto ${fmtTime(pendingResume.timeLeft)}. È la squadra che sta giocando ora, o è rimasta di una partita precedente?</p>
      <div class="row-btns" style="margin:0">
        <button id="resumeBtn">Riprendi questa squadra</button>
        <button class="ghost" id="dismissResumeBtn">È una nuova squadra</button>
      </div>
    </div>` : ''}
    <div class="panel">
      <div class="eyebrow">NOME SQUADRA</div>
      <div class="field-row">
        <input type="text" id="teamInput" placeholder="Es. Cyber Unit 07" value="${S.team||''}">
      </div>
      <p class="lead" style="font-size:13px;margin-top:14px">Durata: ${CONFIG.durataMinutiTotali} minuti.</p>
      <div class="field-row" style="margin-top:10px">
        <button id="startBtn">Avvia missione</button>
      </div>
    </div>
  </div>`;
}

/* ---- introduzione cinematica ---- */
function renderBrief(){
  return `
  <div class="eyebrow">TRASMISSIONE IN ARRIVO</div>
  <h1 class="big">Una rete informatica è stata compromessa.</h1>
  <p class="lead">Un sistema automatico ha intercettato alcuni messaggi, ma sono protetti. Avete tempo limitato per recuperare le informazioni necessarie. Non vi serve essere hacker. Vi serve capire come pensa un computer.</p>
  <div class="panel">
    <div class="checklist">
      <div class="check-row"><div class="dot"></div>Missione 01 — Il messaggio intercettato</div>
      <div class="check-row"><div class="dot"></div>Missione 02 — Attacco brute force</div>
      <div class="check-row"><div class="dot"></div>Missione 03 — La password invisibile</div>
      <div class="check-row"><div class="dot"></div>Missione finale</div>
    </div>
    <button id="toM1">Inizia la Missione 01</button>
  </div>`;
}

/* ---- missione 1 ---- */
function renderM1(){
  return `
  <div class="eyebrow">MISSIONE 01 · IL MESSAGGIO INTERCETTATO</div>
  <h1 class="big">Decifrate il messaggio.</h1>
  <p class="lead">Abbiamo recuperato un messaggio. Il mittente utilizzava un vecchio sistema di cifratura: il cifrario di Cesare. Ogni lettera è stata spostata sempre della stessa quantità di posizioni nell'alfabeto. La chiave sembra essere <b style="color:var(--amber)">${S.session.m1Key}</b>.</p>
  <div class="panel">
    <div class="msg-box">${S.session.m1Cipher}</div>
    <div class="field-row">
      <input type="text" id="m1answer" placeholder="Scrivi il messaggio decifrato">
      <button id="m1submit">Decifra</button>
    </div>
    <div class="feedback" id="m1feedback"></div>
    ${renderHints('m1')}
  </div>`;
}
function renderM1b(){
  return `
  <div class="eyebrow">ACCESSO CONFERMATO</div>
  <h1 class="big">Ottimo lavoro. Ma c'è un problema.</h1>
  <p class="lead">La chiave era ${S.session.m1Key} perché qualcuno ve l'ha comunicata. E se non conoscessimo la chiave? Ecco il messaggio successivo:</p>
  <div class="panel">
    <div class="msg-box">${S.session.m2Cipher}</div>
    <p class="lead" style="margin-top:16px">Questa volta la chiave è sconosciuta. Non provate tutte le possibilità a mano. <b style="color:var(--signal)">Usate il computer.</b></p>
    <button id="toM2">Passa alla Missione 02</button>
  </div>`;
}

/* ---- missione 2 ---- */
function renderM2Intro(){
  return `
  <div class="eyebrow">MISSIONE 02 · ATTACCO BRUTE FORCE</div>
  <h1 class="big">Fate provare tutto al computer.</h1>
  <p class="lead">Il cifrario di Cesare ha solo 26 possibili chiavi. Un essere umano può provarle una alla volta. Un computer può provarle tutte, in un istante. Il problema diventa: come glielo spieghi?</p>
  <div class="panel">
    <button id="toM2ex1">Apri il terminale</button>
  </div>`;
}
function renderM2Ex1(){
  return `
  <div class="eyebrow">TERMINALE · ESERCIZIO 1</div>
  <h1 class="big">Fate contare il computer da 0 a 25.</h1>
  <div class="split">
    <div>
      <div class="code-block">for numero in range(26):
    print(numero)</div>
      <div class="field-row"><button id="run1">Esegui</button></div>
      <div class="console" id="out1" style="display:none"></div>
    </div>
    <div class="panel" style="margin-top:0">
      <div class="eyebrow">COSA STA SUCCEDENDO</div>
      <p class="lead" style="font-size:14.5px">Avete appena detto al computer: "prova tutti i numeri da 0 a 25". Questa è la base di ogni attacco brute force.</p>
      <div id="ex1next" style="display:none"><button id="toM2ex2">Continua</button></div>
    </div>
  </div>`;
}
function renderM2Ex2(){
  return `
  <div class="eyebrow">TERMINALE · ESERCIZIO 2</div>
  <h1 class="big">Provate ogni chiave sul messaggio cifrato.</h1>
  <div class="split">
    <div>
      <div class="code-block">messaggio = "${S.session.m2Cipher}"

for shift in range(26):
    risultato = ""
    for carattere in messaggio:
        if carattere.isalpha():
            posizione = ord(carattere) - ord("A")
            nuova_posizione = (posizione - <span class="blank" id="blankSlot">______</span>) % 26
            risultato += chr(nuova_posizione + ord("A"))
        else:
            risultato += carattere
    print(shift, risultato)</div>
      <div class="field-row">
        <input type="text" id="blankInput" placeholder="Completa lo spazio vuoto" style="max-width:220px">
        <button id="run2">Esegui</button>
      </div>
      <div class="feedback" id="m2feedback"></div>
      <div class="table-out" id="out2" style="display:none"></div>
    </div>
    <div class="panel" style="margin-top:0">
      <div class="eyebrow">SUGGERIMENTO</div>
      <p class="lead" style="font-size:14.5px">Il ciclo sta provando, una alla volta, tutte le chiavi possibili. Nello spazio vuoto va la variabile che rappresenta la chiave che il ciclo sta testando in quel momento.</p>
      ${renderHints('m2')}
    </div>
  </div>`;
}
function renderM2Done(){
  return `
  <div class="eyebrow">BRUTE FORCE RIUSCITO</div>
  <h1 class="big">Non avete indovinato la password.</h1>
  <p class="lead">Avete costruito un algoritmo che ha provato sistematicamente tutte le possibilità. Questo è un attacco <b style="color:var(--signal)">brute force</b>. Il vostro problema aveva solo 26 possibilità: cosa succederebbe se fossero un miliardo? È qui che iniziano a contare algoritmi più veloci e sistemi di sicurezza più solidi.</p>
  <div class="panel">
    <p class="lead" style="font-size:14.5px">Avete trovato la chiave, ma non potete ancora entrare: il sistema non conserva le password. Conserva solo una loro impronta.</p>
    <button id="toM3">Passa alla Missione 03</button>
  </div>`;
}

/* ---- missione 3 ---- */
function renderM3Intro(){
  return `
  <div class="eyebrow">MISSIONE 03 · LA PASSWORD INVISIBILE</div>
  <h1 class="big">Il server non conosce la password.</h1>
  <p class="lead">Conosce solo la sua impronta digitale, calcolata con un algoritmo chiamato SHA-256. Provate voi stessi: la stessa parola produce sempre la stessa impronta, ma basta cambiare un solo carattere e l'impronta cambia completamente.</p>
  <div class="panel">
    <div class="hash-row"><span class="hash-in">${S.session.m3Target}</span><span>→</span><span class="hash-out" id="hashA">calcolo…</span></div>
    <div class="hash-row"><span class="hash-in">${S.session.m3Target}1</span><span>→</span><span class="hash-out" id="hashB">calcolo…</span></div>
    <p class="lead" style="font-size:14.5px;margin-top:14px">Due input quasi identici. Due impronte completamente diverse. Questa è la logica dell'hashing.</p>
    <button id="toM3quiz">Continua</button>
  </div>`;
}
function renderM3Quiz(){
  return `
  <div class="eyebrow">DOMANDA</div>
  <h1 class="big">Se il server non conosce la password, come fa a sapere se quella inserita è corretta?</h1>
  <div class="panel">
    <div class="opt-list">
      <button class="opt-btn" data-opt="a">La password è nascosta con dei simboli</button>
      <button class="opt-btn" data-opt="b">Il server calcola un'impronta della password inserita e la confronta con quella salvata</button>
      <button class="opt-btn" data-opt="c">Il server prova tutte le password possibili in quel momento</button>
    </div>
    <div class="feedback" id="quizFeedback"></div>
    <div id="quizNext" style="display:none;margin-top:14px"><button id="toM3crack">Continua</button></div>
  </div>`;
}
function renderM3Crack(){
  const listLiteral = S.session.m3List.map(p=>`"${p}"`).join(', ');
  return `
  <div class="eyebrow">IL PROBLEMA</div>
  <h1 class="big">Il server possiede solo un'impronta. Riuscite a scoprire la password?</h1>
  <p class="lead">Ecco l'impronta SHA-256 salvata sul server e una lista di password comuni da provare:</p>
  <div class="panel">
    <div class="hash-row"><span class="eyebrow" style="margin:0">HASH_OBIETTIVO</span></div>
    <div class="hash-out" id="targetHash" style="margin-bottom:14px">calcolo…</div>
    <div class="code-block">import hashlib

def sha256(testo):
    return hashlib.sha256(testo.encode()).hexdigest()

passwords = [${listLiteral}]
hash_obiettivo = "..."

for password in passwords:
    if <span class="blank" id="crackBlankSlot">completa questa riga</span>:
        print("PASSWORD TROVATA:", password)</div>
    <div class="field-row">
      <select id="crackSelect">
        <option value="">Scegli come completare la condizione…</option>
        <option value="a">password == hash_obiettivo</option>
        <option value="b">sha256(password) == hash_obiettivo</option>
        <option value="c">password in hash_obiettivo</option>
        <option value="d">hash_obiettivo in passwords</option>
      </select>
      <button id="runCrack">Esegui</button>
    </div>
    <div class="feedback" id="crackFeedback"></div>
    <div class="console" id="crackOut" style="display:none;margin-top:14px"></div>
    ${renderHints('m3')}
    <div id="crackNext" style="display:none;margin-top:16px"><button id="toFinal">Continua alla missione finale</button></div>
  </div>`;
}

/* ---- missione finale ---- */
function renderFinal(){
  return `
  <div class="eyebrow">MISSIONE FINALE</div>
  <h1 class="big">Qual è la differenza principale tra cifratura e hashing?</h1>
  <div class="panel">
    <div class="checklist" style="margin-bottom:8px">
      <div class="check-row done"><div class="dot"></div>Cifrario di Cesare → si usa una chiave per cifrare e decifrare</div>
      <div class="check-row done"><div class="dot"></div>Brute force → si provano sistematicamente tutte le chiavi</div>
      <div class="check-row done"><div class="dot"></div>Hash → è un'impronta dell'input, non un testo da decifrare</div>
    </div>
    <div class="opt-list">
      <button class="opt-btn" data-fopt="a">La cifratura può essere progettata per essere invertita con una chiave</button>
      <button class="opt-btn" data-fopt="b">Un hash è pensato come impronta dell'input, non come testo da decifrare</button>
      <button class="opt-btn" data-fopt="c">Un brute force prova sistematicamente molte possibilità</button>
      <button class="opt-btn" data-fopt="d">Tutte le precedenti</button>
    </div>
    <div class="feedback" id="finalFeedback"></div>
    <div id="finalNext" style="display:none;margin-top:14px"><button id="toEnd">Ripristina il sistema</button></div>
  </div>`;
}

/* ---- schermata finale ---- */
function renderEnd(){
  return `
  <div class="finale">
    <div class="box">
      <div class="eyebrow">SISTEMA RIPRISTINATO</div>
      <h2>Pascal Cyber sbloccata.</h2>
      <div class="checklist">
        <div class="check-row done"><div class="dot"></div>Cifrario di Cesare</div>
        <div class="check-row done"><div class="dot"></div>Brute force</div>
        <div class="check-row done"><div class="dot"></div>Python</div>
        <div class="check-row done"><div class="dot"></div>Hash</div>
      </div>
      <p class="lead" style="margin:20px auto 4px">Quello che avete appena fatto ha un nome: <b style="color:var(--signal)">informatica</b>. E la cybersecurity è solo uno dei mondi in cui potete usarla.</p>
    </div>
    <div class="row-btns" style="justify-content:center;margin-top:24px">
      <button class="ghost" id="restartBtn">Nuova squadra</button>
    </div>
  </div>`;
}


/* ============================================================================
   7. EVENTI (WIRING)
   Dopo ogni render(), questa funzione viene richiamata e collega i click sui
   pulsanti della schermata appena disegnata. Ogni blocco "if (S.screen===…)"
   corrisponde a una schermata.
   ============================================================================ */
function wireScreen(){
  if (S.screen==='start'){
    document.getElementById('teamInput').addEventListener('input', e=>{ S.team = e.target.value; saveLocal(); });
    document.getElementById('startBtn').addEventListener('click', ()=>{
      if (!S.team){ S.team = 'Cyber Unit'; }
      pendingResume = null;
      startTimer();
      go('brief');
    });
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) resumeBtn.addEventListener('click', resumeSaved);
    const dismissBtn = document.getElementById('dismissResumeBtn');
    if (dismissBtn) dismissBtn.addEventListener('click', ()=>{
      pendingResume = null;
      try{ localStorage.removeItem('cyberbreak_state'); }catch(e){}
      render();
    });
  }
  else if (S.screen==='brief'){
    document.getElementById('toM1').addEventListener('click', ()=>go('m1'));
  }
  else if (S.screen==='m1'){
    document.getElementById('m1submit').addEventListener('click', ()=>{
      const val = (document.getElementById('m1answer').value||'').trim().toUpperCase();
      const fb = document.getElementById('m1feedback');
      if (val === S.session.m1Text){
        fb.textContent = 'Accesso confermato.'; fb.className='feedback ok';
        setTimeout(()=>go('m1b'), 550);
      } else {
        fb.textContent = 'Non corrisponde. Riprova a spostare ogni lettera di ' + S.session.m1Key + ' posizioni indietro.'; fb.className='feedback err';
      }
    });
  }
  else if (S.screen==='m1b'){
    document.getElementById('toM2').addEventListener('click', ()=>{ S.m1done=true; saveLocal(); go('m2intro'); });
  }
  else if (S.screen==='m2intro'){
    document.getElementById('toM2ex1').addEventListener('click', ()=>go('m2ex1'));
  }
  else if (S.screen==='m2ex1'){
    document.getElementById('run1').addEventListener('click', ()=>{
      const out = document.getElementById('out1');
      out.style.display='block';
      out.textContent = Array.from({length:26},(_,i)=>i).join('\n');
      document.getElementById('ex1next').style.display='block';
    });
    const toEx2 = document.getElementById('toM2ex2');
    if (toEx2) toEx2.addEventListener('click', ()=>go('m2ex2'));
  }
  else if (S.screen==='m2ex2'){
    document.getElementById('run2').addEventListener('click', ()=>{
      const val = (document.getElementById('blankInput').value||'').trim().toLowerCase();
      const fb = document.getElementById('m2feedback');
      if (val !== 'shift'){
        fb.textContent = 'Il codice non produce ancora risultati corretti. Controllate il nome della variabile del ciclo.'; fb.className='feedback err';
        return;
      }
      fb.textContent = 'Esecuzione riuscita.'; fb.className='feedback ok';
      document.getElementById('blankSlot').textContent = 'shift';
      const out = document.getElementById('out2');
      out.style.display='block';
      out.innerHTML = Array.from({length:26},(_,shift)=>{
        const dec = caesarShift(S.session.m2Cipher, shift);
        const hit = dec === S.session.m2Text;
        return `<div class="${hit?'hit':''}"><span class="n">${shift}</span><span>${dec}</span></div>`;
      }).join('');
      setTimeout(()=>{
        const doneBtn = el(`<div class="row-btns" style="margin-top:14px"><button id="toM2done">Missione riuscita: ${S.session.m2Text}</button></div>`);
        out.after(doneBtn);
        document.getElementById('toM2done').addEventListener('click', ()=>{ S.m2done=true; saveLocal(); go('m2done'); });
      }, 300);
    });
  }
  else if (S.screen==='m2done'){
    document.getElementById('toM3').addEventListener('click', ()=>go('m3intro'));
  }
  else if (S.screen==='m3intro'){
    sha256(S.session.m3Target).then(h=>{ const n=document.getElementById('hashA'); if(n) n.textContent=h; });
    sha256(S.session.m3Target+'1').then(h=>{ const n=document.getElementById('hashB'); if(n) n.textContent=h; });
    document.getElementById('toM3quiz').addEventListener('click', ()=>go('m3quiz'));
  }
  else if (S.screen==='m3quiz'){
    document.querySelectorAll('[data-opt]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const opt = b.getAttribute('data-opt');
        document.querySelectorAll('[data-opt]').forEach(x=>x.disabled=true);
        const fb = document.getElementById('quizFeedback');
        if (opt==='b'){
          b.classList.add('correct');
          fb.textContent = 'Esatto: il server confronta le impronte, non le password.'; fb.className='feedback ok';
        } else {
          b.classList.add('wrong');
          document.querySelector('[data-opt="b"]').classList.add('correct');
          fb.textContent = 'La risposta corretta era: il server confronta l\'impronta calcolata con quella salvata.'; fb.className='feedback err';
        }
        document.getElementById('quizNext').style.display='block';
      });
    });
    document.getElementById('toM3crack').addEventListener('click', ()=>go('m3crack'));
  }
  else if (S.screen==='m3crack'){
    sha256(S.session.m3Target).then(h=>{ const n=document.getElementById('targetHash'); if(n) n.textContent = h; window.__targetHash = h; });
    document.getElementById('runCrack').addEventListener('click', async ()=>{
      const val = document.getElementById('crackSelect').value;
      const fb = document.getElementById('crackFeedback');
      if (val !== 'b'){
        fb.textContent = 'Quella condizione non confronta le impronte. Riprova.'; fb.className='feedback err';
        return;
      }
      fb.textContent = 'Condizione corretta.'; fb.className='feedback ok';
      document.getElementById('crackBlankSlot').textContent = 'sha256(password) == hash_obiettivo';
      const out = document.getElementById('crackOut');
      out.style.display='block';
      out.textContent = 'controllo password…\n';
      const list = S.session.m3List;
      const target = window.__targetHash || await sha256(S.session.m3Target);
      for (const pw of list){
        const h = await sha256(pw);
        const ok = h === target;
        out.textContent += `${pw}  ${ok? '✓ TROVATA' : '✗'}\n`;
        await new Promise(r=>setTimeout(r, ok? 120: 220));
      }
      out.textContent += `\nPASSWORD TROVATA: ${S.session.m3Target}\n\nUna password semplice può essere scoperta provando molte possibilità.\nLa sicurezza non dipende solo dal fatto che una password sia "nascosta",\nma da quanto è difficile indovinarla.`;
      S.m3done = true; saveLocal();
      document.getElementById('crackNext').style.display='block';
    });
    document.getElementById('toFinal').addEventListener('click', ()=>go('final'));
  }
  else if (S.screen==='final'){
    document.querySelectorAll('[data-fopt]').forEach(b=>{
      b.addEventListener('click', ()=>{
        const opt = b.getAttribute('data-fopt');
        document.querySelectorAll('[data-fopt]').forEach(x=>x.disabled=true);
        const fb = document.getElementById('finalFeedback');
        if (opt==='d'){
          b.classList.add('correct');
          fb.textContent = 'Esatto: cifratura, brute force e hashing sono tre idee diverse ma collegate.'; fb.className='feedback ok';
        } else {
          b.classList.add('wrong');
          document.querySelector('[data-fopt="d"]').classList.add('correct');
          fb.textContent = 'Sono tutte vere insieme: è per questo che la risposta corretta è "tutte le precedenti".'; fb.className='feedback err';
        }
        document.getElementById('finalNext').style.display='block';
      });
    });
    document.getElementById('toEnd').addEventListener('click', ()=>{ S.finaldone=true; saveLocal(); stopTimer(); go('end'); });
  }
  else if (S.screen==='end'){
    document.getElementById('restartBtn').addEventListener('click', resetAll);
  }
}


/* ============================================================================
   8. PANNELLO DOCENTE
   Overlay locale (si apre con l'icona ⚙ in alto a destra), utile solo sul
   PC in uso in quel momento: non c'è alcun collegamento remoto o rete tra
   le postazioni. Mostra lo stato della squadra su QUESTO computer, permette
   di mettere in pausa/riprendere il timer e di ricominciare, e riporta le
   domande di debrief da fare a voce negli ultimi minuti.
   ============================================================================ */
function openTeacherPanel(){
  const overlay = el(`<div class="overlay" id="teacherOverlay">
    <div class="overlay-panel">
      <div class="close-row"><button class="ghost" id="closeTeacher">Chiudi</button></div>
      <h3>Pannello docente</h3>
      <div class="eyebrow">STATO SQUADRA (su questo PC)</div>
      <p class="lead" style="font-size:14px">Squadra: <b>${S.team||'—'}</b> · Tempo rimanente: <b>${fmtTime(S.timeLeft)}</b> · Indizi usati: M1 ${S.hintsUsed.m1} · M2 ${S.hintsUsed.m2} · M3 ${S.hintsUsed.m3}</p>
      <div class="row-btns">
        <button class="ghost" id="pauseBtn">${S.timerRunning? 'Metti in pausa':'Riprendi'}</button>
        <button class="ghost" id="resetBtn">Ricomincia esperienza</button>
      </div>
      <div class="eyebrow" style="margin-top:6px">TEMA SCHERMO</div>
      <div class="row-btns">
        <button class="ghost" id="themeDark">Scuro</button>
        <button class="ghost" id="themeLight">Chiaro</button>
      </div>
      <div class="eyebrow" style="margin-top:6px">DEBRIEF FINALE (5 minuti, gestito da voi)</div>
      <div class="qa"><b>1.</b> Chi di voi ha pensato che il messaggio fosse impossibile da decifrare?</div>
      <div class="qa"><b>2.</b> Cosa ha fatto il computer che voi non avreste voluto fare a mano?</div>
      <div class="qa"><b>3.</b> Chi ha scritto almeno una riga di codice? — "Avete appena scritto un programma di cybersecurity."</div>
      <div class="qa"><b>4.</b> Cosa succederebbe se, invece di 26 possibilità, ce ne fossero miliardi?</div>
      <div class="qa"><b>5.</b> Quanti programmi diversi pensate servano per costruire un sistema come questo?</div>
    </div>
  </div>`);
  document.body.appendChild(overlay);
  document.getElementById('closeTeacher').addEventListener('click', ()=>overlay.remove());
  overlay.addEventListener('click', e=>{ if(e.target===overlay) overlay.remove(); });
  document.getElementById('pauseBtn').addEventListener('click', ()=>{
    if (S.timerRunning){ stopTimer(); } else { startTimer(); }
    overlay.remove(); openTeacherPanel();
  });
  document.getElementById('resetBtn').addEventListener('click', ()=>{ overlay.remove(); resetAll(); });
  document.getElementById('themeDark').addEventListener('click', ()=>{ S.themeLight=false; saveLocal(); applyTheme(); });
  document.getElementById('themeLight').addEventListener('click', ()=>{ S.themeLight=true; saveLocal(); applyTheme(); });
}


/* ============================================================================
   9. AVVIO
   ============================================================================ */
document.getElementById('app') || (function(){ const d=document.createElement('div'); d.id='app'; document.body.appendChild(d); })();
applyTheme();
render();

})();
