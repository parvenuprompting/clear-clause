# ClearClause

<div align="center">
  <img src="frontend/public/logo-full.png" height="80" alt="ClearClause Logo" />
  <p><strong>AI-assisted legal document analysis</strong></p>
  <p>Maak complexe juridische documenten begrijpelijker en ontdek risico's voordat u tekent.</p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/status-MVP-f59e0b" alt="Project status: MVP" />
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776ab" alt="Python 3.11 or newer" />
  <img src="https://img.shields.io/badge/FastAPI-backend-009688" alt="FastAPI backend" />
  <img src="https://img.shields.io/badge/Next.js-16.1.1-000000" alt="Next.js 16.1.1" />
  <img src="https://img.shields.io/badge/React-19.2.3-61dafb" alt="React 19.2.3" />
  <img src="https://img.shields.io/badge/Docker-supported-2496ed" alt="Docker supported" />
</p>

![ClearClause home](frontend/public/docs/home.png)

ClearClause analyseert juridische tekst, PDF's en afbeeldingen met mode-specifieke prompts en gestructureerde JSON-output. De tool is bedoeld voor uitleg, risico-identificatie en voorbereiding. ClearClause vervangt geen advocaat of juridisch advies.

## Functies

- Analyse van geplakte juridische tekst
- Upload en tekstextractie van PDF's
- OCR van afbeeldingen en screenshots via GPT-4o Vision
- Mode-specifieke analyse voor verschillende juridische situaties
- Rode vlaggen met bronpassage, risico-type, uitleg en ernstscore
- Samenvatting, aanbevelingen en score in een dashboard
- Maximaal drie contextuele vervolgvragen per analyse
- PDF-export van analyse-resultaten
- Request-validatie, uploadlimieten, JWT-structuur en rate limiting

## Analysemodi

| Modus | Doel |
| --- | --- |
| Algemene voorwaarden | Dark patterns en juridische risico's detecteren |
| Privacybeleid | GDPR-compliance, datacategorieen en ontbrekende elementen analyseren |
| Gebruikersvoorwaarden | Gebruikersrechten, beperkingen en fairness beoordelen |
| Brievenanalyse | Urgentie, claims, deadlines en reactie-strategie analyseren |
| Reactiebrief-generator | Een professionele conceptreactie opstellen |
| Zakelijke onderhandelingen | Dealrisico's, balans en onderhandelingstips beoordelen |
| Webdeals en aanbiedingen | Verborgen kosten en oneerlijke online voorwaarden signaleren |

## Architectuur

```text
clear-clause/
├── main.py                         # FastAPI-app en API-routes
├── modules/
│   ├── analysis/
│   │   ├── models.py               # Pydantic response-modellen
│   │   ├── service.py              # GPT-4o-analyse en chunk merging
│   │   ├── file_processor.py       # PDF-extractie en Vision OCR
│   │   ├── modes.py                # Beschikbare analysemodi
│   │   ├── prompts/                # Mode-specifieke prompts
│   │   └── utils.py                # Token counting en chunking
│   ├── auth/                       # JWT-validatie en rate limiting
│   └── chat/                       # Contextuele vervolgchat
├── frontend/
│   ├── app/                        # Next.js App Router-pagina's
│   ├── components/                 # Analyseformulier en dashboards
│   └── lib/api.ts                  # Typed API-client
├── nginx/                          # Reverse proxy-configuratie
├── Dockerfile
└── docker-compose.yml
```

### Backend

- FastAPI
- OpenAI GPT-4o en GPT-4o Vision
- Pydantic structured output
- PyMuPDF voor PDF-tekstextractie
- `tiktoken` voor token counting en documentchunking
- JWT-validatie met `python-jose`

### Frontend

- Next.js 16 met App Router
- React 19 en TypeScript
- Tailwind CSS 4
- Radix UI en Lucide React
- `@react-pdf/renderer` voor PDF-export

## Snel starten

### Vereisten

- Python 3.11 of nieuwer
- Node.js 20 of nieuwer
- npm
- Een OpenAI API-key voor echte analyses

### Backend lokaal starten

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Vul daarna `OPENAI_API_KEY` in `.env` in. Start de API met:

```bash
python3 main.py
```

De backend draait standaard op `http://127.0.0.1:8000`.

### Frontend lokaal starten

```bash
cd frontend
npm install
npm run dev
```

De frontend draait standaard op `http://localhost:3000`.

Voor een andere backend-url kan `NEXT_PUBLIC_API_URL` worden ingesteld:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

## Docker

Configureer `.env` met minimaal:

```env
OPENAI_API_KEY=sk-jouw-api-key
SECRET_KEY=gebruik-een-lange-willekeurige-productiesleutel
ALGORITHM=HS256
ENVIRONMENT=production
```

Start vervolgens de volledige stack:

```bash
docker compose up --build
```

De Nginx gateway is beschikbaar op `http://localhost`.

## API

| Methode | Endpoint | Beschrijving |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/modes` | Beschikbare analysemodi en metadata |
| `POST` | `/analyze` | Geplakte tekst analyseren |
| `POST` | `/analyze-file` | PDF of afbeelding analyseren |
| `POST` | `/chat` | Vervolgvraag over documentcontext beantwoorden |

Voorbeeld van `POST /analyze`:

```json
{
  "text": "De volledige tekst van het document...",
  "document_name": "Algemene voorwaarden - Bedrijf X",
  "mode": "algemene_voorwaarden",
  "context": null
}
```

De response bevat een uniforme dashboardvorm met onder andere `mode`, `summary`, `red_flags`, `suggestions`, `privacy_score` en `privacy_motivatie`. Mode-specifieke velden blijven daarnaast beschikbaar in dezelfde response.

## Security en privacy

- Zet nooit echte secrets in Git.
- Gebruik in productie altijd een sterke `SECRET_KEY`.
- Development accepteert uitsluitend de development mock-auth-flow.
- Requests zijn begrensd op 1 MB.
- Tekstvelden en chatgeschiedenis hebben expliciete limieten.
- De backend gebruikt server-side rate limiting per IP; de huidige implementatie is in-memory en bedoeld voor de MVP.
- Gevoelige juridische documenten kunnen naar de geconfigureerde AI-provider worden verzonden. Voeg geen documenten toe zonder het privacy- en verwerkingsbeleid te controleren.
- ClearClause geeft geen formeel juridisch advies en vervangt geen advocaat.

## Development checks

Backend syntax controleren:

```bash
python3 -m compileall -q main.py modules
```

Frontend controleren:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Status en roadmap

ClearClause is momenteel een MVP. De eerstvolgende technische prioriteiten zijn:

1. Backendtests voor validatie, uploads, modes en response-normalisatie.
2. Volledige frontend typecheck en mode-specifieke dashboards.
3. Bronverwijzingen en betrouwbaarheidssignalen in analyse-resultaten.
4. Privacybeleid, accounts en schaalbare quota.
5. Observability, kostenmeting en productiehardening.

## Licentie

Dit project is een MVP voor educatieve en experimentele doeleinden. Er is momenteel geen aparte open-source licentie gepubliceerd.
