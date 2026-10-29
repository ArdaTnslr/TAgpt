# TAgpt – persönlicher KI-Assistent

Starterprojekt für eine deutschsprachige KI-Webanwendung mit Chat, persistentem Gedächtnis, Datei-Upload, optionaler Websuche, Programmierhilfe sowie Spracheingabe und Vorlesen von Antworten über die Browser-Sprachfunktionen.

## Voraussetzungen

- Node.js 24 LTS (oder eine unterstützte LTS-Version): https://nodejs.org/en/download/
- Ein OpenAI API-Konto mit aktivierter Abrechnung und API-Schlüssel: https://platform.openai.com/api-keys
- API-Aufrufe werden separat von einem ChatGPT-Abonnement abgerechnet.

## Start unter Windows

1. ZIP-Datei entpacken.
2. Im Projektordner im Explorer die Adressleiste anklicken, `cmd` eingeben und Enter drücken.
3. `npm install` ausführen.
4. `.env.example` kopieren und die Kopie `.env` nennen.
5. `.env` in einem Texteditor öffnen und `OPENAI_API_KEY=...` durch deinen Schlüssel ersetzen.
6. Optional `OPENAI_MODEL` auf ein Modell ändern, das deinem API-Konto zur Verfügung steht.
7. `npm start` ausführen.
8. Im Browser `http://localhost:3000` öffnen.

Zum Entwickeln mit automatischem Neustart: `npm run dev`.

## Funktionen

- **Chat:** Die letzten Nachrichten werden im Browser lokal gespeichert.
- **Gedächtnis:** Über „Gedächtnis“ können Fakten hinzugefügt und gelöscht werden. Im Chat kannst du auch `Merke dir: ...` schreiben. Die Einträge werden in `data/memory.json` gespeichert und beim nächsten API-Aufruf als Kontext mitgegeben.
- **Dateien:** Bis zu vier Dateien pro Nachricht, je maximal 8 MB. Unterstützt: PDF, TXT, MD, CSV, JSON und gängige Text-/Code-Dateien. PDF wird lokal in Text umgewandelt.
- **Websuche:** Checkbox „Websuche“ aktiviert die gehostete Websuche im Responses API-Aufruf.
- **Programmieren:** Das Modell kann Code erklären und schreiben. Dieser Starter führt generierten Code nicht aus.
- **Sprache:** Spracheingabe hängt von Browser und Betriebssystem ab; am zuverlässigsten in unterstützten Browsern mit Mikrofonberechtigung. Jede KI-Antwort hat außerdem einen „Vorlesen“-Knopf. Für mobile Geräte kann HTTPS erforderlich sein.

## Wichtige Hinweise vor Veröffentlichung

Dies ist ein Lern-/Starterprojekt, noch keine produktionsfertige Mehrbenutzer-App.

Vor einer öffentlichen Veröffentlichung unbedingt ergänzen:
- Benutzerkonten und Authentifizierung
- Pro-Nutzer-Datentrennung und sichere Datenbank
- HTTPS, Backups, Monitoring und strengere Rate-Limits
- Nutzungsgrenzen/Kostenlimits für API-Aufrufe
- Datenschutzinformation, Löschkonzept und Prüfung der rechtlichen Anforderungen
- Beschränkungen für Dateitypen und Malware-Prüfung
- Keine Geheimnisse oder persönlichen Daten in öffentliche Repositorys committen

Der Starter speichert Gedächtniseinträge serverseitig in einer JSON-Datei und hat keine Benutzeranmeldung. Deshalb zunächst nur lokal auf dem eigenen Rechner testen und nicht unverändert öffentlich ins Internet stellen.

## Häufige Fehler

- **„API-Schlüssel fehlt“:** `.env` muss im Projekt-Hauptordner liegen und `OPENAI_API_KEY=...` enthalten. Server nach Änderungen neu starten.
- **401:** API-Schlüssel prüfen.
- **429:** API-Guthaben, Projektlimit oder Rate-Limit prüfen.
- **Modell nicht verfügbar:** `OPENAI_MODEL` auf einen Modellnamen setzen, für den dein API-Projekt Zugriff hat.
- **PDF-Fehler:** PDF muss lesbar sein; gescannte PDFs benötigen ggf. OCR.

## Projektstruktur

```text
TAgpt/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```
