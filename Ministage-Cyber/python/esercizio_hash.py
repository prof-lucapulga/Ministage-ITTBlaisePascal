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

import hashlib


# =============================================================================
# ESERCIZIO 3 — La password invisibile (hashing)
# =============================================================================
def sha256(testo: str) -> str:
    """
    Restituisce l'impronta SHA-256 di 'testo', come stringa esadecimale.

    hashlib.sha256(...) vuole in ingresso dei byte, non una stringa
    Python: testo.encode() converte la stringa in byte. Il risultato va
    poi trasformato in esadecimale leggibile con .hexdigest().
    """
    # TODO 3a: una riga sola, usando hashlib.sha256(...).hexdigest()
    pass


def trova_password(lista_password: list, hash_obiettivo: str):
    """
    Scorre 'lista_password', calcola l'hash di ciascuna con la funzione
    sha256() appena scritta, e restituisce la password il cui hash
    corrisponde a 'hash_obiettivo'. Se nessuna corrisponde, restituisce None.
    """
    # TODO 3b: ciclo "for password in lista_password:"; per ciascuna
    #          confrontate sha256(password) con hash_obiettivo e, se
    #          coincidono, restituite quella password (return password).
    return None


def test_esercizio_3():
    assert sha256("orbit") == sha256("orbit")   # stesso input -> stesso hash
    assert sha256("orbit") != sha256("orbit1")  # un carattere in più -> hash diverso
    lista = ["password", "123456", "qwerty", "admin", "orbit", "dragon"]
    obiettivo = sha256("orbit")
    assert trova_password(lista, obiettivo) == "orbit"
    assert trova_password(lista, sha256("parola-che-non-c-e")) is None
    print("Esercizio 3 (hashing): tutti i test superati.")


# =============================================================================
if __name__ == "__main__":
    test_esercizio_3()
    print("\nTutti gli esercizi sono stati completati correttamente. Pascal Cyber Challenge sbloccata!")
