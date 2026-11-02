set "TARGET=C:\Users\ministage\Desktop\Ministage"

rem Se la cartella esiste, la elimina
if exist "%TARGET%" (
    rmdir /s /q "%TARGET%"
)

rem Clona il repository nella cartella corretta

git clone https://github.com/prof-lucapulga/Ministage-ITTBlaisePascal.git "%TARGET%"

rem Verifica che la cartella sia stata creata
if exist "%TARGET%" (
    code "%TARGET%"
) else (
    echo ERRORE: la cartella non è stata creata. Controlla il percorso o i permessi.
)

exit
