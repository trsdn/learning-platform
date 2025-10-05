# Passwortschutz für Lernpfade

## Überblick

Diese Funktion ermöglicht es, Lernpfade mit einem Passwort zu schützen. Schüler müssen das richtige Passwort eingeben, bevor sie auf den geschützten Lernpfad zugreifen können.

## ⚠️ Wichtige Sicherheitshinweise

**Diese Funktion bietet NUR grundlegenden Schutz!**

- ✅ **Geeignet für**: Klassenzimmer, Familien, einfache Zugangskontrollen
- ❌ **NICHT geeignet für**: Sensible Daten, vertrauliche Informationen
- 🔓 **Technisch versierte Personen** können den Schutz umgehen, da die gesamte Logik client-seitig läuft

Der Passwortschutz ist als **Komfortfunktion** gedacht, nicht als echte Sicherheitsmaßnahme.

## Schnellstart für Lehrer

### Schritt 1: Passwort-Hash generieren

Führen Sie das Hash-Generator-Skript aus:

```bash
node scripts/generate-password-hash.js
```

Das Skript fragt Sie nach Ihrem gewünschten Passwort und generiert einen Hash:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔒 Passwort-Hash Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Passwort eingeben: ********
Passwort bestätigen: ********

✅ Hash erfolgreich generiert!

Ihr Passwort-Hash:
a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

Verwendung in Ihrer JSON-Datei:
{
  "id": "ihr-lernpfad-id",
  "title": "Ihr Lernpfad Titel",
  "requiresPassword": true,
  "passwordHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "tasks": [...]
}
```

### Schritt 2: Lernpfad-JSON konfigurieren

Öffnen Sie Ihre Lernpfad-JSON-Datei (z.B. `public/learning-paths/mathematik/geheim.json`) und fügen Sie die folgenden Felder hinzu:

```json
{
  "learningPath": {
    "id": "mathematik-geheim",
    "topicId": "mathematik",
    "title": "Geheimer Mathematik-Lernpfad",
    "description": "Nur für Schüler mit Passwort",
    "difficulty": "medium",
    "estimatedTime": 45,
    "isActive": true,
    "requiresPassword": true,
    "passwordHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "createdAt": "2025-10-06T00:00:00.000Z",
    "requirements": {
      "minimumAccuracy": 70,
      "requiredTasks": 10
    }
  },
  "tasks": [
    ...
  ]
}
```

**Wichtige Felder:**

- `requiresPassword`: Auf `true` setzen
- `passwordHash`: Den generierten Hash einfügen (NICHT das Passwort selbst!)

### Schritt 3: Passwort an Schüler weitergeben

Teilen Sie das **Passwort** (nicht den Hash!) mit Ihren Schülern über einen sicheren Kanal:

- Mündlich im Unterricht
- Per E-Mail
- Auf einem Zettel
- Über Ihre Lernplattform

## Beispiel-Lernpfad

Ein vollständiges Beispiel finden Sie unter:
`public/learning-paths/test/password-protected-demo.json`

**Test-Passwort**: `test123`

## Wie es funktioniert

### Für Schüler

1. Schüler öffnet die App und wählt ein Thema
2. Geschützte Lernpfade zeigen ein 🔒-Symbol
3. Beim Klick auf einen geschützten Lernpfad erscheint eine Passwortabfrage
4. Nach Eingabe des richtigen Passworts wird der Lernpfad freigeschaltet
5. Die Freischaltung bleibt gespeichert (LocalStorage)

### Technische Details

- **Hashing**: SHA-256-Algorithmus
- **Speicherung**: LocalStorage (pro Lernpfad)
- **Validierung**: Client-seitig (JavaScript)
- **Session**: Bleibt aktiv bis Browser-Daten gelöscht werden

## Passwort zurücksetzen

### Als Lehrer: Neues Passwort erstellen

1. Führen Sie `node scripts/generate-password-hash.js` aus
2. Generieren Sie einen neuen Hash
3. Ersetzen Sie `passwordHash` in der JSON-Datei
4. Aktualisieren Sie die Datenbank (falls nötig)

### Als Schüler: Zugang vergessen

Schüler können ihren Zugang zurücksetzen, indem sie:

1. Browser-Daten (LocalStorage) löschen
2. **ODER** die App im Inkognito-Modus öffnen
3. Passwort erneut eingeben

Alternativ können Sie als Lehrer eine "Logout"-Funktion für Schüler bereitstellen.

## Erweiterte Verwendung

### Mehrere geschützte Lernpfade

Jeder Lernpfad kann ein eigenes Passwort haben:

```json
// Lernpfad A: Passwort "mathe2025"
{
  "requiresPassword": true,
  "passwordHash": "hash-von-mathe2025"
}

// Lernpfad B: Passwort "bio2025"
{
  "requiresPassword": true,
  "passwordHash": "hash-von-bio2025"
}
```

### Passwort-Hinweis in Beschreibung

Fügen Sie einen Hinweis in die Beschreibung ein (ohne das Passwort zu verraten):

```json
{
  "description": "Für Schüler der Klasse 9b (Passwort siehe Tafel)"
}
```

### Kombination mit anderen Funktionen

Der Passwortschutz funktioniert mit allen anderen Funktionen:

- ✅ Spaced Repetition
- ✅ Audio-Wiedergabe
- ✅ Alle Aufgabentypen
- ✅ Dashboard und Fortschritt

## Häufige Probleme

### "Falsches Passwort" obwohl es richtig ist

**Lösung**: Überprüfen Sie:

1. Groß-/Kleinschreibung (Passwort ist case-sensitive!)
2. Leerzeichen vor/nach dem Passwort
3. Hash wurde korrekt generiert und kopiert

### Hash funktioniert nicht

**Lösung**:

1. Hash mit `scripts/generate-password-hash.js` neu generieren
2. Kompletten Hash kopieren (64 Zeichen)
3. Auf Tippfehler in JSON prüfen

### Schüler können nicht abmelden

**Lösung**: Schüler können Browser-Daten löschen oder Inkognito-Modus nutzen.

Für eine Logout-Funktion können Sie folgendes implementieren:

```javascript
// Im Browser-Console (für Entwickler)
localStorage.removeItem('mindforge.auth.YOUR-LEARNING-PATH-ID');
```

## Best Practices

### ✅ Empfohlen

- Eindeutige Passwörter pro Lernpfad verwenden
- Passwörter regelmäßig ändern (z.B. pro Schuljahr)
- Passwörter mündlich mitteilen (nicht in öffentlichen Dokumenten)
- Test-Lernpfad vor Verwendung mit Schülern testen

### ❌ Nicht empfohlen

- Dasselbe Passwort für alle Lernpfade
- Passwort in JSON-Datei-Namen oder Beschreibung
- Sensible Inhalte in geschützten Lernpfaden
- Passwort-Hash manuell erstellen (immer Skript nutzen!)

## Support

Bei Problemen oder Fragen:

1. Prüfen Sie die Beispiel-Datei: `public/learning-paths/test/password-protected-demo.json`
2. Testen Sie mit Passwort `test123`
3. Lesen Sie die technische Dokumentation: [Issue #35](https://github.com/trsdn/learning-platform/issues/35)
4. Öffnen Sie ein GitHub Issue

## Technische Referenz

### Benötigte JSON-Felder

```typescript
{
  "learningPath": {
    // ... andere Felder ...
    "requiresPassword": boolean,    // Optional, default: false
    "passwordHash": string          // Optional, SHA-256 Hash
  }
}
```

### Hash-Generierung (für Entwickler)

```javascript
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Beispiel
console.log(hashPassword('test123'));
// Ausgabe: ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae
```

### LocalStorage-Schlüssel

```
mindforge.auth.<learning-path-id>
```

Beispiel: `mindforge.auth.mathematik-geheim`

## Changelog

- **2025-10-06**: Erste Version der Passwortschutz-Funktion (Issue #35)
