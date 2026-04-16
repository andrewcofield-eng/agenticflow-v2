# AgenticFlow v2

AgenticFlow v2 is a portfolio prototype that demonstrates a simple but strategic idea:

If CRM, PIM, and DAM context are connected into one internal campaign context layer, an AI-assisted workflow can assemble more relevant and more explainable campaign recommendations.

This project is intentionally **not** a production SaaS app. It is a supervised proof-of-concept designed to showcase systems thinking, AI workflow design, and marketing strategy concepts in a clear, demo-friendly way.

## What the prototype is

The prototype is a web app that is being built in phases to show:

- campaign setup
- visible source context from CRM, PIM, and DAM systems
- a supervised multi-step workflow with distinct agent roles
- a results dashboard for campaign recommendations, rationale, and draft content

## What is included right now

This Phase 2 scaffold includes:

- landing page
- campaign builder shell
- source data panel shells
- workflow visualization shell
- results dashboard shell
- mock sample datasets
- adapter placeholders for Directus, Cloudinary, and HubSpot
- `.env.example` for future integration setup

## What is currently mocked

Right now, all data is mocked.

That includes:

- CRM audience examples
- PIM product examples
- DAM asset examples
- campaign form options
- workflow steps and output sections

No live API calls are implemented in this phase.

## What is planned for later phases

Later phases may add:

- visible workflow logic
- recommendation and rationale generation
- draft campaign content generation
- read-only adapter integrations for:
  - Directus
  - Cloudinary
  - HubSpot
- richer metadata and schema evolution support
- improved portfolio polish and documentation

Still out of scope unless explicitly requested:

- auth
- databases
- background jobs
- vector stores
- deployment infrastructure
- production hardening
- autonomous publishing

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Open the app in your browser:

```text
http://localhost:3000
```

## Environment file

The project includes a `.env.example` file with placeholder variables for future read-only integrations.

These are not used yet, but they document the expected configuration shape for later work.

## Architectural direction

The app is structured around a normalized internal data layer so the UI does not depend directly on raw HubSpot, Cloudinary, or Directus schemas.

Current adapter structure:

- `lib/data/adapters/mock`
- `lib/data/adapters/directus`
- `lib/data/adapters/cloudinary`
- `lib/data/adapters/hubspot`

This keeps the mock-first prototype easy to evolve while staying simple and understandable.
