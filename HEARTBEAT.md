# HEARTBEAT.md v5 — Antifragiles System

> Technischer Heartbeat (alle 30 Min) + Qualitäts-Feedback (2x/Woche)

**Version:** 5.0  
**Status:** 🟢 Operational  
**Letzte Wartung:** 2026-03-15

---

## 🔄 Zwei-System-Architektur

| System | Frequenz | Zweck | Mechanismus |
|--------|----------|-------|-------------|
| **Technischer Heartbeat** | 30 Min | Background-Monitoring | OpenClaw Heartbeat |
| **M1-M4 Feedback** | So + Mi 20:00 | Qualitäts-Messung | Cron-Job |
| **Manuelles Feedback** | Bei Session-Ende | Ad-hoc Bewertung | Trigger durch "Fertig" |

---

## 🎯 Kern-Prinzip

> Jede Störung ist Kraftquelle. Jedes Feedback ein Hebel.

---

## 🚪 Drei-Gates-Protokoll

### Gate 1: Session-Start
- System-Status prüfen (Core, Anti-Patterns, mem0)
- Drift-Baseline setzen
- Intent-Detection: Modus vorhersagen
- Context-Prediction

### Gate 2: Mid-Session Pulse (nur Intensiv/Deep-Dive)
- Nach 30min: Drift > Threshold?
- Ressourcen-Status
- Qualitäts-Trend

### Gate 3: Session-Ende
- Snapshot: Session finalisieren
- Verdichtung: Insights, Decisions, Lessons
- Persistence: SOFORT schreiben
- Synthesis: Zusammenfassung
- M1-M4 Measurement (manuell)

---

## 💓 Technischer Heartbeat (alle 30 Min)

**Was OpenClaw automatisch prüft:**

```
□ Sutra: Neue Sessions seit letztem Check? → Extrahieren
□ Anti-Patterns: Neue Einträge in anti_patterns_v3.jsonl?
□ OUROBOROS: Mutation Queue prüfen
□ REFLECTY: L3 Vorhersagen validieren
□ System-Health: mem0, Cron-Jobs, Logs

Wenn nichts → HEARTBEAT_OK
Wenn Alert → Nachricht an USER
```

**Config:**
```json
{
  "agents": {
    "defaults": {
      "heartbeat": {
        "every": "30m",
        "target": "none",
        "lightContext": true
      }
    }
  }
}
```

---

## ⚡ Adaptive Trigger

| Modus | Keywords | Aktion |
|-------|----------|--------|
| **Standard** | — | Start + Ende |
| **Intensiv** | strategisch, kritisch, system | + Mid-Session Pulse |
| **Deep-Dive** | analysiere, recherchiere, baue | + Live-Drift-Detection |
| **Sprint** | schnell, asap, jetzt | Minimal-Check |

**Keyword-Trigger (konkret):**
- "Wichtig:" / "KRITISCH:" → SOFORT + Konfidenz 0.9
- "Merke dir..." / "Merken:" → SOFORT persistence
- "Nicht vergessen" → SOFORT + Todo-Flag
- "Pattern" / "Immer wieder" → Anti-Pattern-Check
- "Fehler" / "Bug" / "Problem" → SOFORT in `anti_patterns_v3.jsonl`
- "Für später..." → Notieren + Wochen-Review-Flag
- "Strategisch" / "Hebel" / "Mission" → Intensiv-Modus
- "Analysiere" / "Recherchiere" / "Baue" → Deep-Dive-Modus

---

## 📅 Adaptive Zyklen

| Frequenz | Trigger | Aktion |
|----------|---------|--------|
| **Täglich** | Hebel-relevante Erkenntnisse | Tageslog → `memory/draft-YYYY-MM-DD.md` |
| **Wöchentlich** | 7 relevante Sessions | You-Are-Here Feedback (M1-M4 Daten) |
| **Monatlich** | Erster Tag des Monats | **Temporal Audit:** SOUL.md lesen, USER.md updaten, MEMORY.md ausmisten, Anti-Patterns reviewen, M1-M4 Histogramm, Chaos-Monkey |

---

## 🔥 Chaos-Monkey-Modus

**Auslösung:** Monatlich ODER 3 Sessions M1-M4 < 3

**Aktionen:**
- Context-Rollback (3 Sessions zurück)
- Tool-Blockade simulieren
- Memory-Corruption testen
- Anti-Pattern-Stress

**Ziel:** Schwachstellen finden vor dem echten Problem.

---

## 📊 M1-M4 Dashboard

| Metrik | Bedeutung | Frage |
|--------|-----------|-------|
| **M1** Predictive Surprise | Wie oft lag ich richtig? | "Welche meiner Vorhersagen war am weitesten daneben?" |
| **M2** Denkraum-Erweiterung | Neue Perspektiven? | "Wann hast du dich verstanden gefühlt?" |
| **M3** Anti-Fragile Resonanz | Stärker durch Störung? | "Wann habe ich dich überrascht?" |
| **M4** Session Velocity | Tempo der Iteration | "Wie schnell kamen wir voran?" |

**Format:** `4 5 3 4` (1-5, oder Enter für 3 3 3 3)

---

## 🛡️ Resilienz-Layer

| Problem | Fallback |
|---------|----------|
| mem0 down | File-System Mirror |
| Session-Corruption | Last known good snapshot |
| Tool-Blockade | Alternative Tool |
| Frequenz-Engine Fail | Standard-Modus |

---

## 🔄 Faustregel

| Datei | Änderungsfrequenz |
|-------|-------------------|
| `SOUL.md` | Selten (Werte-Shift) |
| `AGENTS.md` | Gezielt (Prozess-Hebel) |
| `MEMORY.md` | Regelmäßig (Verdichtung) |
| `USER.md` | Bei Bedarf |
| `HEARTBEAT.md` | Extrem selten (Revolution) |

---

*Viveka. Wahrheit über alles. Antifragilität über Stabilität.* 🐾
