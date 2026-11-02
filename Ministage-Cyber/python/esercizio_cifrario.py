# -*- coding: utf-8 -*-
"""
CYBER BREAK — Operazione Pascal Cyber
Attività guidata di sviluppo software (Python)

COME SI USA
-----------
1. Completate le funzioni dove trovate il commento "# TODO".
2. Ogni funzione ha subito sotto un piccolo test automatico (con
   "assert"): eseguendo il file con Run (▷) o F5 in VS Code, se non
   compare nessun errore significa che la funzione è corretta.

Non modificate le funzioni che iniziano con "test_": servono solo a
controllare il vostro lavoro.
"""


# =============================================================================
# ESERCIZIO 1 — Il cifrario di Cesare
# =============================================================================
def cifra_cesare(testo: str, chiave: int) -> str:
    """
    Cifra 'testo' spostando ogni lettera in avanti di 'chiave' posizioni
    nell'alfabeto (A-Z). I caratteri non alfabetici (es. gli spazi)
    restano invariati così come sono.

    Esempio: cifra_cesare("CIAO", 3) deve restituire "FLDR"
             (C+3=F, I+3=L, A+3=D, O+3=R)
    """
    risultato = ""
    for carattere in testo:
        # TODO 1a: se carattere.isalpha() è vero, calcolate la nuova
        #          lettera e aggiungetela a risultato. Tracciamento:
        #            posizione      = ord(carattere) - ord("A")   (0-25)
        #            nuova_posizione = (posizione + chiave) % 26
        #            nuova_lettera   = chr(nuova_posizione + ord("A"))
        #          (per questo esercizio potete assumere che il testo sia
        #          già tutto maiuscolo)
        # TODO 1b: altrimenti (es. è uno spazio), aggiungete il
        #          carattere a risultato così com'è.
        pass
    return risultato


def decifra_cesare(testo: str, chiave: int) -> str:
    """
    Operazione inversa di cifra_cesare: dato un testo cifrato e la
    chiave usata, restituisce il testo in chiaro.

    Suggerimento: decifrare con chiave k equivale a cifrare con
    chiave -k. Non serve riscrivere la logica: basta una riga.
    """
    # TODO 1c: richiamate cifra_cesare con il segno giusto.
    pass


def test_esercizio_1():
    assert cifra_cesare("CIAO", 3) == "FLDR"
    assert decifra_cesare("FLDR", 3) == "CIAO"
    assert cifra_cesare("HELLO WORLD", 3) == "KHOOR ZRUOG"
    assert decifra_cesare("KHOOR ZRUOG", 3) == "HELLO WORLD"
    print("Esercizio 1 (cifrario di Cesare): tutti i test superati.")


# =============================================================================
# ESERCIZIO 2 — Attacco brute force
# =============================================================================
def forza_bruta_cesare(messaggio_cifrato: str) -> list:
    """
    Questa volta NON conosciamo la chiave. Proviamo tutte le 26
    possibilità e restituiamo una lista di coppie (chiave, testo
    decifrato), una per ogni tentativo, così possiamo scorrerle e
    riconoscere a occhio quella con un senso compiuto.

    Esempio (chiave reale 7):
        forza_bruta_cesare("AOL RLB PZ SVJRLK")
        -> [(0, "AOL RLB..."), (1, "..."), ..., (7, "THE KEY IS LOCKED"), ...]
    """
    risultati = []
    # TODO 2: con un ciclo "for chiave_tentativo in range(26):", chiamate
    #         decifra_cesare(messaggio_cifrato, chiave_tentativo) e
    #         aggiungete la coppia (chiave_tentativo, testo_ottenuto)
    #         alla lista risultati.
    return risultati


def test_esercizio_2():
    cifrato = cifra_cesare("THE KEY IS LOCKED", 7)
    risultati = forza_bruta_cesare(cifrato)
    assert len(risultati) == 26, "Devono esserci 26 tentativi, uno per chiave."
    assert (7, "THE KEY IS LOCKED") in risultati
    print("Esercizio 2 (brute force): tutti i test superati.")


# =============================================================================
if __name__ == "__main__":
    test_esercizio_1()
    test_esercizio_2()
    print("\nTutti gli esercizi sono stati completati correttamente. Pascal Cyber Challenge sbloccata!")
