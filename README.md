# Above & Beyond AI — Website

KI-Beratungswebsite für [above-beyond-ai.com](https://tewers.github.io/above-beyond-ai.com)

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Frontend | HTML5, CSS3 (Custom Dark Design), Vanilla JS |
| Internationalisierung | Eigenes i18n-System (DE/EN) |
| Charts | Chart.js v4 |
| Backend / Datenbank | Supabase (PostgreSQL + Auth) |
| Hosting | GitHub Pages |

## Dateistruktur

```
above-beyond-ai.com/
├── index.html                  # Homepage
├── leistungen.html             # Services-Übersicht
├── ki-readiness-check.html     # KI Readiness Assessment (6 Dimensionen)
├── dashboard.html              # User Dashboard mit Auswertungen
├── ueber-uns.html              # Über uns
├── kontakt.html                # Kontaktformular
├── login.html                  # Login / Registrierung
├── impressum.html              # Impressum
├── datenschutz.html            # Datenschutz
├── assets/
│   ├── css/style.css           # Haupt-Stylesheet (Dark Modern)
│   └── js/
│       ├── i18n.js             # DE/EN Übersetzungen
│       ├── main.js             # Core UI Logic
│       └── supabase-client.js  # Supabase Integration
└── database/
    └── schema.sql              # Supabase Datenbankschema
```

## Setup

### 1. GitHub Pages aktivieren

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from branch**
3. Branch: `main` / Root (`/`)
4. URL: `https://tewers.github.io/above-beyond-ai.com`

### 2. Supabase einrichten

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) erstellen
2. SQL Editor → `database/schema.sql` ausführen
3. Authentication → Email aktivieren
4. Site URL auf `https://tewers.github.io/above-beyond-ai.com` setzen

### 3. Supabase-Keys eintragen

In `assets/js/supabase-client.js`:
```javascript
const SUPABASE_URL  = 'https://DEIN-PROJEKT.supabase.co';
const SUPABASE_ANON = 'DEIN-ANON-KEY';
```

### 4. Custom Domain (optional)

1. DNS: CNAME `above-beyond-ai.com` → `tewers.github.io`
2. GitHub Pages → Custom domain eintragen
3. HTTPS erzwingen aktivieren

## Features

- ✅ Responsive Dark-Design (Mobile, Tablet, Desktop)
- ✅ DE/EN Sprachumschalter
- ✅ KI Readiness Check (42 Fragen, 6 Dimensionen)
- ✅ Radar-Diagramm & Score-Visualisierung
- ✅ Automatische Handlungsempfehlungen
- ✅ Supabase Auth (Registrierung, Login, Passwort-Reset)
- ✅ Ergebnisse speichern & abrufen
- ✅ Kontaktformular mit Datenbankanbindung
- ✅ Smooth Animations & Scroll-Reveal

## Nächste Schritte

- [ ] `leistungen.html` — Service-Detailseiten ausbauen
- [ ] `dashboard.html` — Historische Auswertungen & Vergleiche
- [ ] `login.html` — Auth-UI
- [ ] `ueber-uns.html` — Team & Story
- [ ] Blog / Insights-Sektion
- [ ] Admin-Dashboard für Anfragen

---

© 2026 Above & Beyond AI
