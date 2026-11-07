# Atelier W — Demonstrationswebsite

Statische Website für **Atelier W**, eine (hier platzhalterhafte) Schweizer Adresse für personalisierte Uhren. Die Seite ist kein Shop: kein Warenkorb, keine Kasse, keine Preise. Besucherinnen und Besucher können eine Uhr skizzieren und eine Anfrage zusammenstellen. Das Formular bleibt im Browser und sendet nichts.

Die Seite ist auf **Schweizer Hochdeutsch** verfasst (ss, ohne Eszett) und für GitHub Pages vom **Repository-Root** gedacht, auch unter einem Projektpfad wie `/velten-uhren-demo/`. Alle Verweise sind relativ.

## Lokal öffnen

Ein beliebiger statischer Server genügt, zum Beispiel:

```bash
python3 -m http.server 8765
```

Danach `http://localhost:8765/` im Browser öffnen. Ein Build-Schritt ist nicht nötig.

## Beispielbilder

Sämtliche Fotografien sind **generierte Beispielbilder**, keine Aufnahmen ausgeführter Kundenaufträge. Auf der Website sind sie als «Beispielbild» gekennzeichnet (Schweizer UWG). Das Logo liegt unverändert als SVG (schwarz und weiss, transparent) und als PNG mit 4000 Pixel Breite in `assets/logo/`.

## Inhalte mit Platzhalter

Impressum und Datenschutz nennen Adresse, UID, Telefon und verantwortliche Stelle ausdrücklich als **Platzhalter**.

## Schriften

Cormorant Garamond und Source Sans 3 sind lokal eingebunden (SIL Open Font License). Die Lizenztexte liegen bei den Schriftdateien in `assets/fonts/`.

## Technik

HTML, CSS und JavaScript ohne Framework. Der Konfigurator zeichnet die Uhr als geschichtetes SVG. Animationen nutzen nur Deckkraft und Transformation und respektieren `prefers-reduced-motion`.
