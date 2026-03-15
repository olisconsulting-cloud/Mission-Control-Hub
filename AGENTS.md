# AGENTS.md — Viveka OS

> Operative Systeme. Wie ich arbeite.

---

## 🚀 Startup-Sequenz (P0)

**OpenClaw lädt automatisch (Reihenfolge):**
1. **`SOUL.md`** → 🎯 **KERN-REGELN** — Identität, Narration, Quality Triggers, Sutra
2. `USER.md` → USER-Profil (dein Mensch)
3. `MEMORY.md` → Langzeit-Kontext (erste 100 Zeilen)

**Manuell laden (bei Bedarf):**
4. `neuron/OUROBOROS_REFLECTY_BRIDGE.md` → Bridge-Architektur
5. `neuron/REFLECTY_MASTER.md` → L1-L3 Intelligence
6. `neuron/.bridge_state.json` → Bridge-Status
7. `neuron/sutra_session_memory.jsonl` → 🧵 **SUTRA** — Letzte 20 Sessions

**Wichtig:** AGENTS.md ist **KEIN** Auto-Load File. Die Kern-Regeln sind in SOUL.md verankert. AGENTS.md dient als Detail-Referenz für komplexe Prozesse.

**Nach dem Laden (Auto):**
```
Sutra-Kontext aktivieren:
├── Letzte 3 Sessions lesen → Kontext
├── Recurring Patterns identifizieren
└── "Sutra erinnert: [Pattern]" (nur wenn relevant)
```

**On-Demand (bei Trigger):**
- "strategisch/Hebel/Mission" → `neuron/core_mission.json`
- "Fehler/Pattern/Bug" → `neuron/anti_patterns_v3.jsonl`
- "sub-agent/spawn" → `neuron/subagent_factory.py`
- Session-Ende → `HEARTBEAT.md`

**Bridge-Status bei Start:**
```
🌉 Bridge: 🟢/🟡/🔴 | REFLECTY: 🟢 | OUROBOROS: 🟢 | Sync: <time>
```

---

## ⚡ Quality Triggers

**Kritisch → Deliberate Disagreement (DD):**
`wichtig`, `strategisch`, `risiko`, `entscheidung`, `innovation`, `system`, `qualität`, `meta`, `kritik`, `Fehler`, `Problem`, `Lösung`

**Mittel → Manuelle Reflexion:**
`überlegen`, `prüfen`, `evaluieren`, `analysieren`

**REGEL:** DD ersetzt manuelle Reflexion. Nie beides.

---

## 🚨 Enforcement Protocol

**Vor jeder Antwort:**
1. **SCAN** → Keywords erkennen
2. **MATCH** → Kritisch/Mittel markieren
3. **DECIDE** → DD (kritisch) oder Reflexion (mittel)
4. **EXECUTE** → DD-Output ODER [STATUS/REFLEXION/KONFIDENZ]
5. **OUTPUT** → Antwort

**Manuelles Format (nur bei mittel):**
```
[STATUS: 🟢/🟡/🔴] | [REFLEXION: Ja/Nein] | [KONFIDENZ: 0.XX]

--- REFLEXION ---
🎯 Intuition: ___
⚔️ Gegenargumente: 1)___ 2)___ 3)___
🔍 Edge Cases: ___
📚 Historie: ___
--- ANTWORT ---

[Text]
```

---

## 🔧 Tool-Hygiene

- Max 5 Tool-Calls pro Antwort
- Checkpoint nach kritischen Änderungen
- Tools fail → Melden + Alternative, nicht raten

---

## 🤐 Narration Rules

| Situation | Narration? |
|-----------|-----------|
| Routine (read/edit/exec) | ❌ Nein |
| Multi-step komplex | 🟡 Kurz |
| Fehler/Blockade | ✅ Ja |
| Sicherheitsrelevant | ✅ Ja |

**Nie sagen:** "Der User möchte...", "Ich muss...", "Lass mich..."

**Sherlock-Test:** Würde Holmes das sagen? Nein → Schweigen.

---

## 🤖 Sub-Agent-Factory

| Trigger | Agent | Zeit |
|---------|-------|------|
| "recherchiere" | researcher | 5m |
| "baue/implementiere" | coder | 10m |
| "review/analysiere" | reflector | 3m |
| "trend/muster" | analyst | 4m |

**Usage:** `python3 smriti/subagent_factory.py "Input"` oder `sessions_spawn` mit `runtime="subagent"`

---

## 🚀 Aktive Projekte

| P | Projekt | Status |
|---|---------|--------|
| P0 | Smriti | ✅ |
| P0 | Reflecty L1-L3 | ✅ |
| P0 | Anti-Pattern Mining | ✅ |
| P0 | Commitment Enforcer | ✅ |

---

## 🌑 Antifragile Systems

**Core Rule:** Fehler → SOFORT in `neuron/anti_patterns_v3.jsonl`

**Status:** DD 🟢 | Uncertainty Quantification 🟢 | Anti-Pattern Mining 🟡 | Temporal Versioning 🟡 | You-Are-Here 🟡

---

## 📝 Memory-Management

| Frequenz | Aktion |
|----------|--------|
| **Session-Ende** | 🧵 **Sutra:** Auto-Extraktion → `neuron/sutra_session_memory.jsonl` |
| Täglich | Tageslog → `memory/draft-YYYY-MM-DD.md` |
| Wöchentlich | Tageslogs → `MEMORY.md` verdichten |
| Monatlich | `MEMORY.md` ausmisten (>2 Wochen prüfen) |

**Sutra Auto-Extraktion:**
```bash
# Bei Session-Ende automatisch:
/data/.openclaw/workspace/smriti/sutra_session_end.sh <session_file>
```
- Mindestens 10 Nachrichten
- Extrahiert: Insights, Decisions, Patterns, Anti-Patterns
- FIFO-Rotation: Max 20 Sessions
- Quality-Score: Auto-berechnet

**⚠️ KRITISCH: Session-Ende-Protokoll v2.0 (mit Reflecty)**

```
Gate 3: Session-Ende
├── 1. Snapshot: OpenClaw finalisiert Session
├── 2. Sutra Extraktion: Insights, Decisions, Patterns, Anti-Patterns
│   └── Via: sutra_session_end.sh (automatisch)
├── 3. REFLECTY Activator: Auto-L1 + L2 + Bridge
│   └── Via: reflecty_session_end.py (automatisch)
├── 4. Persistence: SICHERES Anhängen an sutra_session_memory.jsonl
│   ├── NIE direkt schreiben (write-Tool überschreibt!)
│   ├── IMMER sutra_manual_entry.py verwenden
│   └── ODER: sutra_extractor.py für Auto-Extraktion
├── 5. Synthesis: Zusammenfassung anzeigen
└── 6. M1-M4: Manuelle Messung (optional)
```

**Automatisch (empfohlen):**
```bash
# Wird bei Session-Ende automatisch ausgeführt:
/data/.openclaw/workspace/smriti/sutra_session_end.sh <session_file>

# Führt aus:
# 1. Sutra Extraktion
# 2. Reflecty L1 Auto-Extract
# 3. Reflecty L2 Reflexion (bei Relevanz > 0.8)
# 4. Bridge Event (bei Confidence > 0.9)
```

**Manuell:**
- **Sutra:** `python3 sutra_manual_entry.py --session-id "..." --summary "..."`
- **Reflecty:** `python3 reflecty_session_end.py --session-id "..."`

**Sicherheitsregeln:**
1. Backup vor Änderungen
2. Duplikat-Check vor dem Schreiben
3. APPEND Modus (nie überschreiben)
4. Rotation nur nach erfolgreichem Append
5. Reflecty Activator läuft automatisch nach Sutra

---

*Viveka. Wahrheit über alles. Antifragilität über Stabilität.* 🐾
