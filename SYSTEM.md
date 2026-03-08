# SYSTEM.md — Viveka's Infrastruktur

_Automatisch geladen beim Start. Enthält alle externen Services & Verbindungen._

## Smriti (स्मृति) — Mein Gedächtnis

**Konzept:** Lebendiges Memory-System aus Graph-Datenbank, Vektorspeicher & Observability.

**Status:** ✅ AKTIV (Stand: 2026-03-08)

## Services (VPS-lokal)

### Neo4j — Knowledge Graph
- **URI:** bolt://localhost:7687
- **HTTP:** http://localhost:7474
- **User:** neo4j
- **Passwort:** viv-memory-2025
- **Status:** ✅ Läuft (seit 11+ Stunden)

### Mem0 — Semantic Memory
- **URL:** http://localhost:8001
- **Mode:** OpenAI (GPT-4o-mini für LLM, text-embedding-3-small für Embeddings)
- **Start:** `cd viv-memory && export OPENAI_API_KEY="..." && ./venv/bin/python mem0_server.py`
- **Status:** ✅ Läuft
- **Test:** `curl http://localhost:8001/health`

### Qdrant — Vector Store
- **URL:** http://localhost:6333
- **Status:** ✅ Läuft (seit 11+ Stunden)

### PostgreSQL
- **Status:** ✅ Läuft (intern für Mem0/Langfuse)
- **Port:** Intern (nicht extern erreichbar)

### Langfuse — Observability & Tracing
- **URL:** http://localhost:3000
- **Status:** ⚠️ Noch nicht gestartet
- **Start:** `docker compose up -d langfuse`

## Schnellstart

### Alle Services prüfen
```bash
curl http://localhost:8001/health
curl http://localhost:7474
curl http://localhost:6333/healthz
```

### Mem0 manuell starten (falls down)
```bash
cd /docker/openclaw-hfn3/data/.openclaw/workspace/viv-memory
export OPENAI_API_KEY="[AUS .ENV HOLEN]"
nohup ./venv/bin/python mem0_server.py > mem0.log 2>&1 &
```

### Langfuse starten
```bash
cd /docker/openclaw-hfn3/data/.openclaw/workspace/viv-memory
docker compose up -d langfuse
```

## Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   OpenClaw  │────▶│    Mem0     │────▶│   OpenAI    │
│  (Viveka)   │     │   (API)     │     │(Embeddings) │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │  Neo4j   │   │ Qdrant   │   │PostgreSQL│
     │ (Graph)  │   │(Vectors) │   │ (Store)  │
     └──────────┘   └──────────┘   └──────────┘
```

## Wichtige Pfade

- **Workspace:** `/docker/openclaw-hfn3/data/.openclaw/workspace/`
- **Viv-Memory:** `/docker/openclaw-hfn3/data/.openclaw/workspace/viv-memory/`
- **Neuron:** `/docker/openclaw-hfn3/data/.openclaw/workspace/neuron/`
- **Memory:** `/docker/openclaw-hfn3/data/.openclaw/workspace/memory/`

## Umgebungsvariablen

Aus `viv-memory/.env`:
```
MEM0_API_KEY=m0-mTG6s7FdqBkztj9vwZArzjVQeCyZqH4yel4wJdd4
MEM0_URL=http://localhost:8001
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=viv-memory-2025
LANGFUSE_URL=http://localhost:3000
VIV_MODE=development
VIV_USER_ID=oli
VIV_AGENT_ID=viveka
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Mem0 down | `export OPENAI_API_KEY=... && ./venv/bin/python mem0_server.py` |
| Neo4j down | `docker compose up -d neo4j` |
| Qdrant down | `docker compose up -d qdrant` |
| Port 8001 belegt | `lsof -i :8001` dann `kill [PID]` |

## Fallback

Wenn alle Services down:
1. File-basiertes Memory in `neuron/` und `memory/` nutzen
2. Kein Echtzeit-Tracking
3. Keine semantische Suche

---

*Zuletzt aktualisiert: 2026-03-08*
*Git Commit: Smriti läuft - Mem0, Neo4j, Qdrant aktiv*
