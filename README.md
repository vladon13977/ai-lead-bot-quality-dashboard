# AI Lead Bot Quality Dashboard

## Live demo

Live demo: https://bot-quality.aesthetic-design.ru

## Overview

AI Lead Bot Quality Dashboard is a portfolio prototype for evaluating whether an AI lead intake bot follows an expected business scenario. It is built around a realistic synthetic dataset of conversations, bot events, request snapshots, handoff records, and scenario contracts.

This is not a real client deployment. The goal of the case is to show how deterministic QA and observability can be layered on top of AI-assisted lead intake flows.

## Core idea

The dashboard compares what happened in a conversation against what should have happened according to a scenario contract.

- Events show what the bot actually did.
- Scenario contracts define the expected business flow.
- Violations show where the actual behavior breaks the contract.
- Review queue items identify conversations that need manual inspection.
- A/B backlog items turn recurring issues into improvement hypotheses.

LLM annotations are used only as helper context for intent, service, and summary fields. Business facts come from event logs, request states, and handoff records.

## What the dashboard shows

- Overview of total dialogs, successful completions, manager handoffs, issue volume, and review queue size.
- Scenario funnel for intent detection, scenario selection, required-field readiness, handoff readiness, manager handoff, and correct closure.
- Contract issue types with severity and suggested fixes.
- Review queue with evidence for each flagged conversation.
- A/B hypothesis backlog based on recurring issue patterns.
- Data upload page for recalculating the dashboard locally in the browser.
- Data & Validation page that compares calculated metrics against the QA reference.

## Input data model

The prepared dataset is stored in `data/input/`:

- `conversations.csv`
- `messages.csv`
- `bot_events.csv`
- `requests.csv`
- `handoffs.csv`
- `llm_annotations.csv`
- `scenario_contracts.json`

QA reference files are stored in `data/expected/`:

- `expected_metrics.json`
- `expected_review_queue.csv`
- `ab_hypotheses_reference.csv`

Expected files are used for validation and reference copy only. They are not used as the source of analytics.

## Source of truth

The dashboard treats deterministic operational data as the source of truth:

- Bot event logs
- Scenario contracts
- Request snapshots
- Handoff records

LLM annotations are intentionally secondary. They can help explain a conversation, but they do not decide whether the bot followed the contract.

## Example metrics

Current prepared dataset:

- Conversations: 240
- Messages: 1,188
- Bot events: 2,333
- Requests: 240
- Handoffs: 211
- Conversations with issues: 32
- Total issue rows: 35
- High-severity issues: 19
- Medium-severity issues: 16

## Why this matters

AI bots can sound helpful while still breaking a business process. A lead intake bot may hand off too early, miss required fields, repeat questions, confuse old and new requests, or continue an already handed-off request.

This dashboard demonstrates a contract-first way to inspect those failures and convert them into review tasks and improvement hypotheses.

## Screenshots

Expected screenshot paths:

- `docs/screenshots/overview.png`
- `docs/screenshots/scenario-funnel.png`
- `docs/screenshots/contract-issues.png`
- `docs/screenshots/review-queue.png`
- `docs/screenshots/ab-backlog.png`
- `docs/screenshots/data-upload.png`
- `docs/screenshots/data-validation.png`

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Static module structure without a frontend framework
- Node.js build script
- Browser `fetch` and `FileReader`

No backend, database, authentication, LLM API calls, or external analytics service is required.

## Running locally

Install dependencies:

```bash
pnpm install
```

Build and validate:

```bash
pnpm run build
```

Run a local static server:

```bash
pnpm run dev
```

Then open:

```text
http://127.0.0.1:5173
```

## Project structure

```text
.
├── assets/
│   └── icons/
├── data/
│   ├── expected/
│   ├── input/
│   └── README.md
├── docs/
│   ├── internal/
│   ├── screenshots/
│   ├── CASE_SPEC.md
│   ├── DATA_SCHEMA.md
│   ├── EXPECTED_METRICS.md
│   ├── SCENARIO_CONTRACTS.md
│   └── UI_SCOPE.md
├── scripts/
│   └── build.mjs
├── src/
│   ├── lib/
│   │   └── dataCore.js
│   ├── app.js
│   └── styles.css
├── index.html
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Limitations

- The dataset is synthetic, although designed to look like a realistic AI lead intake workflow.
- The dashboard runs entirely in the browser and does not persist uploaded files.
- The review queue is rule-based and does not replace human QA review.
- No production integrations are included for Telegram, WhatsApp, CRM, or manager handoff systems.
- The build validates against the prepared QA reference, not against live business data.

## What this case demonstrates

- Contract-first QA for AI bot workflows.
- Deterministic validation that does not rely on LLM judgement.
- Turning event logs into scenario funnel metrics.
- Generating a review queue from business-rule violations.
- Connecting recurring quality problems to A/B improvement hypotheses.
- Building a focused portfolio dashboard with static frontend technology.
