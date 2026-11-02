# AI Challenge - Addestra la tua AI!

## Laboratorio di Intelligenza Artificiale con Teachable Machine

### Attività orientativa ministage per studenti di 3ª media

------------------------------------------------------------------------

# 1. Idea dell'attività

**AI Challenge - Addestra la tua AI!** è un laboratorio pratico in cui gli studenti, divisi in piccole squadre, costruiscono e mettono alla prova un semplice classificatore di immagini con **Google Teachable Machine**.

> **Raccolgo esempi → addestro un modello → lo metto alla prova → scopro
> gli errori → provo a migliorarlo.**

------------------------------------------------------------------------

# 2. Termini tecnici per gli studenti

I termini tecnici vengono introdotti solo quando servono all'esperienza, facendo esempi allegati per migliorare e facilitare la comprensione dei presenti:

| Termine | Spiegazione per gli studenti |
| --- | --- |
| **Dataset** | L'insieme degli esempi che diamo alla macchina (es: immagini) |
| **Classe** | Una categoria che la macchina deve riconoscere (es: cane/gatto) |
| **Training** | Il momento in cui la macchina impara dagli esempi (es: immagini) |
| **Modello** | Il risultato dell'addestramento (es: l'intelligenza) |
| **Test** | Una prova con qualcosa che non abbiamo usato per allenarla (es: immagine non utilizzata prima) |

------------------------------------------------------------------------

# 3. La sfida

## Missione

Ogni squadra costruisce un'AI capace di distinguere due categorie di immagini, scegliendo una delle seguenti coppie:

-   **Muffin** vs **Chihuahua**;
-   **Gatti** vs **Cani**;
-   **Biciclette** vs **Motociclette**.

Poi dovrà cercare di **mettere alla prova il modello e migliorarlo**.

> **Il modello non deve solo funzionare sulle fotografie che gli abbiamo
> dato. Deve funzionare anche quando lo mettiamo in difficoltà con nuove immagini.**

La squadra vincente non è quindi quella che ottiene semplicemente la percentuale più alta ma è quella che:

1.  costruisce un buon dataset;
2.  ottiene buoni risultati sui test;
3.  scopre almeno un errore interessante.

------------------------------------------------------------------------

# 4. Organizzazione dell'attività e laboratorio

## Squadre

Consigliato:

-   **2-3 studenti per squadra** - oppure anche da soli;
-   un computer per squadra (o studente);
-   una copia della scheda
    [Scheda_Studente_AI_Challenge.docx](Scheda_Studente_AI_Challenge.docx)
    per ogni membro del team - **in modo che possa essere lasciato a loro quando tornano a casa**.

### Consegna della scheda

Una volta formati i team, il docente o gli studenti assistenti
consegnano a ciascuna squadra la scheda
**Scheda_Studente_AI_Challenge.docx**. La squadra la compila durante
l'attività per annotare le categorie, le caratteristiche del dataset scelto da loro.

## Ruoli

Per evitare che un solo studente faccia tutto e per rendere più coinvolgente l'attività, è possibile assegnare i ruoli:

### 1. Data Hunter
Cerca e prepara gli esempi, tra i dataset proposti.

### 2. Trainer
Gestisce Teachable Machine e avvia il training.

### 3. Hacker
Cerca intenzionalmente di far sbagliare il modello scegliendo nuove immagini dal test set già pronto.


**Consiglio:** durante la nuove manche i ruoli possono ruotare.

In questo modo ogni studente deve sperimentare almeno una parte tecnica e una parte di ragionamento.

------------------------------------------------------------------------

# 5. Materiale necessario

## Per ogni squadra

-   1 PC con browser e Internet;
-   accesso a Teachable Machine;
-   immagini digitali per le due categorie scelte;
-   la scheda **Scheda_Studente_AI_Challenge.docx**.

Teachable Machine è lo strumento web principale della proposta originale
e permette di addestrare semplici modelli senza scrivere codice.

------------------------------------------------------------------------

# 6. Preparazione prima dell'open day/ministage

Prima dell'attività, predisporre per ogni team uno dei dataset indicati
nella sezione 3, in modo che le immagini siano subito disponibili sul
computer.

In alternativa, chiedere ai team di cercare e scaricare da
[Openverse](https://openverse.org/) circa **20-30 fotografie per
ciascuna categoria (minimo)** della coppia scelta. Le immagini vanno salvate in cartelle separate, una per classe, e dovrebbero mostrare soggetti, inquadrature e sfondi diversi.

------------------------------------------------------------------------

# 7. Fase 1 - Inizio

Mostrare due immagini appartenenti alle categorie che saranno
utilizzate.

Domanda:
> "Voi, come fate a distinguere queste due categorie di immagini?"

> "Secondo voi, come fa un computer a distinguere queste due categorie di immagini?"

Lasciare rispondere liberamente.

Poi:

> "E se non gli spiegassimo le regole? Se gli facessimo semplicemente vedere tanti esempi?"

A questo punto si presenta la missione:

> "Oggi costruirete **voi** una piccola intelligenza artificiale e alla fine proveremo a farla sbagliare."

**Prima si fa l'esperimento, poi si dà il nome a ciò che è successo, in modo da rendere l'esperienza meno pesante e più attiva.**

------------------------------------------------------------------------

# 8. Fase 2 - Preparazione/scelta dataset

Ogni squadra sceglie e prepara una delle coppie previste (già presenti all'interno della repository):

-   **Muffin** e **Chihuahua**;
-   **Gatti** e **Cani**;
-   **Biciclette** e **Motociclette**.

Si possono usare le immagini già predisposte oppure cercare su Openverse circa **20-30 immagini per categoria (minimo)**.

Le immagini devono mostrare varietà: soggetti, inquadrature, angoli, distanze e sfondi diversi. Per poter fare una prova corretta, tenere da parte alcune immagini non utilizzate nel training.

### Da ricordare

> **Non caricare molte immagini quasi uguali.**

Gli studenti devono capire che **la varietà degli esempi è importante quanto il loro numero**. Molte copie quasi identiche non aiutano il modello a riconoscere situazioni diverse della stessa categoria di immagini.

------------------------------------------------------------------------

# 9. Fase 3 - Controllo del dataset


Prima del training, il Reporter deve fare un controllo velocissimo.

### Checklist

-   [ ] Le immagini sono nelle cartelle/classi corrette?
-   [ ] Le due classi hanno più o meno lo stesso numero di immagini?
-   [ ] Le immagini sono abbastanza diverse?
-   [ ] Abbiamo tenuto da parte immagini per il test?

------------------------------------------------------------------------

# 10. Fase 4 - Training


Ogni squadra:

0.  apre **Teachable Machine**: [https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/);
1.  seleziona **Get Started**;
2.  seleziona **Image Project** > **Standard image model**;
3.  crea due classi con i nomi delle categorie scelte;
4.  carica le immagini;
5.  avvia il training;
6.  attende il completamento;
7.  prova il modello.

### Primo training: iniziare dalle impostazioni predefinite

La prima volta, lasciare le impostazioni predefinite di Teachable
Machine. In questo modo tutti i team partono dalla stessa situazione e
possono concentrarsi sulle immagini e sul funzionamento del modello.

Dopo la prima prova, se c'è tempo, il docente può mostrare le **opzioni
avanzate** e far provare a modificare un parametro alla volta:

-   **Learning rate (tasso di apprendimento):** indica quanto grandi
    sono i "passi" con cui il modello corregge ciò che sta imparando.
    Un passo più grande può farlo imparare più in fretta, ma può anche
    fargli saltare la soluzione migliore; un passo più piccolo procede
    con maggiore cautela e può richiedere più tempo.
-   **Batch size (dimensione del gruppo):** indica quante immagini il
    modello considera insieme prima di aggiornare ciò che ha imparato.
    È come correggere il lavoro dopo aver guardato un piccolo gruppo di
    esempi oppure un gruppo più grande.

Si può dire ai ragazzi: **"Prima facciamo una prova con le impostazioni
di partenza. Poi cambiamo una sola manopola alla volta e controlliamo
con le stesse immagini se il risultato migliora o peggiora."** 

Non è
necessario trovare un valore "perfetto": l'obiettivo è osservare che
anche il modo in cui si svolge l'allenamento può influire sul risultato.
Annotare sulla scheda il parametro modificato e l'esito del confronto.

> "In questo momento gli avete dato degli esempi. Adesso la macchina cerca delle regolarità che le permettano di distinguere le due classi."

------------------------------------------------------------------------

# 11. Fase 5 - AI Challenge: facciamola sbagliare!


Questa una parte importante per il coinvolgimento dei ragazzini.

> **"Ora avete costruito il vostro modello. Ma è davvero intelligente?
> Avete 10 minuti per provare a batterlo."**

Ogni squadra riceve una lista di prove - eventualmente si possono scrivere alla lavagna solo alcuni test in modo che i team non si perdano ma seguano in maniera guidata le prove da effettuare.
Gli studenti devono scegliere dal test set e caricare alcune immagini per far capire se l'IA sbaglia o indovina.


## Livello 1 - Test facili

Provare:

-   un'immagine di ciascuna categoria non utilizzata nel training;
-   immagini con inquadrature o sfondi diversi da quelli di training.

## Livello 2 - Test difficili

Provare:

-   soggetti molto vicini o lontani;
-   immagini difficili da classificare.

## Livello 3 - Attacco

Provare:

-   immagini di categorie diverse da quelle del modello;
-   immagini ambigue o con più soggetti.

Far annotare (**sulla SCHEDA del TEAM consegnata ad inizio attività**) cosa ha previsto il modello e con quale confidenza. Distinguere un errore da un caso in cui il modello assegna comunque una classe a un'immagine che non appartiene alle categorie conosciute.

------------------------------------------------------------------------

# 12. Il gioco: "Hackerate la vostra AI"

Per ogni prova il Reporter (studente o Prof.) registra:

| Prova | Risultato | Confidenza | Esito |
| --- | --- | --- | --- |
| Immagine nuova classe 1 | Classe 1 | 91% | ✓ |
| Immagine nuova classe 2 | Classe 2 | 87% | ✓ |
| Soggetto con angolazione | Classe 1 | 72% | ✓ |
| Categoria non prevista | Classe 1 | 96% | **Errore!** |
| Immagine ambigua | Classe 2 | 61% | **Errore!** |

Il docente o gli assistenti studenti passano tra i banchi durante le prove, verificano i risultati e segnano i punti ottenuti da ciascun team, utilizzando la scheda della squadra o un registro riepilogativo.
Il punteggio complessivo servirà a confrontare i gruppi e ad assegnare i premi descritti nella fase finale.

## Punteggio consigliato

### +1 punto

Il modello riconosce correttamente un'immagine nuova di una delle due categorie.

### +2 punti

Il modello supera una prova difficile di una immagine complicata.

### +3 punti

La squadra riesce a trovare un errore significativo e sa spiegare una possibile causa.

### +2 punti bonus

La squadra propone una modifica al dataset per correggere l'errore.

### +2 punti bonus

La squadra trova un errore che nessun'altra squadra aveva trovato.


------------------------------------------------------------------------

# 13. Fase 6 (estensione possibile - non obbligatoria): "La nostra AI ha imparato il soggetto o lo sfondo?"

Il docente può proporre un piccolo dataset volutamente sbilanciato, selezionando immagini in cui le due classi sono associate a sfondi o contesti diversi:

-   **Classe 1** sempre con uno stesso tipo di sfondo/contesto;
-   **Classe 2** sempre con uno sfondo/contesto diverso.

Addestrare rapidamente un modello e poi testarlo con immagini in cui
soggetto e sfondo/contesto sono combinati in modo diverso.

Poi mostrare:

-   un'immagine della classe 1 con lo sfondo associato alla classe 2;
-   un'immagine della classe 2 con lo sfondo associato alla classe 1;
-   immagini in cui il soggetto o il contesto è poco evidente.

Domanda:
> **"Secondo voi, che cosa ha imparato veramente la macchina?"**

Lasciare che siano gli studenti a formulare ipotesi.


### Messaggio da far emergere

> **"La macchina impara dal mondo che noi le mostriamo, non dal mondo
> intero."**

È una frase semplice ma molto efficace per un'attività di orientamento.

------------------------------------------------------------------------

# 14. Fase 7 - Lo scambio dataset


Ora entra in gioco un altro membro del team, che non ha scelto o
preparato il primo dataset. Il suo compito è scegliere un dataset
diverso, così la squadra affronta una nuova sfida e non ripete
semplicemente gli stessi passaggi.

Può scegliere un'altra coppia fra quelle già disponibili:

-   **Muffin** e **Chihuahua**;
-   **Gatti** e **Cani**;
-   **Biciclette** e **Motociclette**;

oppure cercare su [Openverse](https://openverse.org/) immagini per un'altra coppia di categorie. In questo caso, scegliere categorie riconoscibili e raccogliere immagini in numero simile per entrambe le classi. Se il tempo è limitato, usare un dataset già predisposto.

------------------------------------------------------------------------

# 15. Il finale

E' possibile prevedere l'assegnazione di categorie diverse, come:

### 🏆 Best AI
Miglior risultato complessivo, preso dai punti sopra segnati.

### 🕵️ Best Hacker
Ha trovato l'errore più interessante.

### 🧠 Best Scientist
Ha dato la spiegazione migliore.

In questo modo **ogni studente/team può avere un momento di valorizzazione**.

------------------------------------------------------------------------

# 16. Qualche messaggio finale da lasciare ai ragazzi

> **"Oggi non avete semplicemente usato un'intelligenza artificiale. ma avete costruito un piccolo modello di AI.**
>
> **E avete scoperto una cosa importante: il modello non conosce
> automaticamente il mondo MA impara dagli esempi che gli date.**
>
> **Se gli esempi sono pochi, sbagliati, ripetitivi o sbilanciati,
> anche il modello può imparare male.**
>
> **Per questo, quando usiamo l'intelligenza artificiale, non dobbiamo
> chiederci soltanto: 'Quanto è intelligente?'.**
>
> **Dobbiamo chiederci anche: 'Con quali dati ha imparato? E cosa
> succede quando cambia la situazione?'"**
