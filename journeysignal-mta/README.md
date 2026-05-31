# Journey Signal

Journey Signal is a public Next.js dashboard for the DAP391 multi-touch attribution project. It presents attribution, regression, Markov comparison, and simulation outputs from the Python analysis notebooks, with a project-specific AI assistant for question answering.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Server-side data preparation from CSV
- Server-side `/api/chat` route for AI assistant calls through the OpenAI Responses API

## Local Setup

```bash
npm install
npm run prepare-data
npm run dev
```

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` to enable live AI answers. Without an API key, the assistant returns a grounded local fallback response.

## Data Source

The app reads CSV outputs copied from:

```text
Nhan_workspace/analysis_python/outputs/
```

The CSVs are stored in `data/raw`, then converted into `data/generated/dashboard-data.json` and `data/generated/analysis-context.json` with:

```bash
npm run prepare-data
```

## Pages

- Overview
- Attribution
- Regression
- Model Comparison
- Simulation
- Methodology

## Interactivity

- Attribution page: toggle First-Touch, Last-Touch, Linear, or all models; sort a selected model.
- Regression page: switch between logistic-adjusted share and odds-ratio evidence; filter significant predictors.
- Simulation page: switch scenario comparison metric across delta revenue, revenue, conversions, and delta revenue percent.
- Global Signal Assistant: ask page-specific questions grounded in generated project context.

## Verification

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

Current expected status:

- Lint passes with zero warnings.
- Production build passes.
- Audit reports zero vulnerabilities.

## Notes

The app does not train models in the browser or server. It displays and explains precomputed analysis outputs.

Do not put secrets in `NEXT_PUBLIC_*` variables. `OPENAI_API_KEY` is read only by the server-side chat route.
