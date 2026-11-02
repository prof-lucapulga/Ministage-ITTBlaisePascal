# -*- coding: utf-8 -*-
"""
CYBER BREAK — Operazione Black Box
SOLUZIONE dell'attività guidata di sviluppo software (Python)

Versione completa di esercizio_cifrario_hash.py, per correggere il
lavoro degli studenti o come riferimento. Non distribuitela prima che
abbiano provato a risolverlo da soli.
"""

import hashlib


# =============================================================================
# ESERCIZIO 1 — Il cifrario di Cesare
# =============================================================================
def cifra_cesare(testo: str, chiave: int) -> str:
    risultato = ""
    for carattere in testo:
        if carattere.isalpha():
            posizione = ord(carattere) - ord("A")
            nuova_posizione = (posizione + chiave) % 26
            risultato += chr(nuova_posizione + ord("A"))
        else:
            risultato += carattere
    return risultato


def decifra_cesare(testo: str, chiave: int) -> str:
    return cifra_cesare(testo, -chiave)


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
    risultati = []
    for chiave_tentativo in range(26):
        testo = decifra_cesare(messaggio_cifrato, chiave_tentativo)
        risultati.append((chiave_tentativo, testo))
    return risultati


def test_esercizio_2():
    cifrato = cifra_cesare("THE KEY IS LOCKED", 7)
    risultati = forza_bruta_cesare(cifrato)
    assert len(risultati) == 26, "Devono esserci 26 tentativi, uno per chiave."
    assert (7, "THE KEY IS LOCKED") in risultati
    print("Esercizio 2 (brute force): tutti i test superati.")


# =============================================================================
# ESERCIZIO 3 — La password invisibile (hashing)
# =============================================================================
def sha256(testo: str) -> str:
    return hashlib.sha256(testo.encode()).hexdigest()


def trova_password(lista_password: list, hash_obiettivo: str):
    for password in lista_password:
        if sha256(password) == hash_obiettivo:
            return password
    return None


def test_esercizio_3():
    assert sha256("orbit") == sha256("orbit")
    assert sha256("orbit") != sha256("orbit1")
    lista = ["password", "123456", "qwerty", "admin", "orbit", "dragon"]
    obiettivo = sha256("orbit")
    assert trova_password(lista, obiettivo) == "orbit"
    assert trova_password(lista, sha256("parola-che-non-c-e")) is None
    print("Esercizio 3 (hashing): tutti i test superati.")


# =============================================================================
if __name__ == "__main__":
    test_esercizio_1()
    test_esercizio_2()
    test_esercizio_3()
    print("\nTutti gli esercizi sono stati completati correttamente. Pascal Cyber sbloccata!")
