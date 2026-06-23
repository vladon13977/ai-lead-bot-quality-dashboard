# CASE_SPEC — AI Lead Bot Quality Dashboard

## Case story

I created an AI assistant for a detailing studio. It answers incoming client messages, detects the service intent, collects required fields, and sends a structured handoff to the manager.

After launch, the key problem is not “does the bot answer?” but:

> Can we trust the bot to follow the business scenario correctly?

The bot can look smart in chat while still breaking the business process: missing phone, early handoff, duplicate handoff, fallback loops, mixing old and new requests, wrong service detection, or replying after handoff.

## Problem

AI lead intake bots are often black boxes. Owners/integrators cannot manually read hundreds of conversations every week, but they need to know which scenarios are healthy and what should be fixed next.

## Solution

A contract-first dashboard that analyzes bot event logs, request states and handoff records. It checks whether the bot follows scenario contracts and highlights deviations with evidence.

## User

Primary user: AI automation specialist / integrator / product-ops person responsible for bot quality.

Secondary user: business owner who wants to know whether the bot can be trusted for front desk lead intake.

## Dashboard must answer

1. How many conversations followed the expected scenario?
2. Where does the scenario break?
3. Which handoffs were incomplete or unsafe?
4. Which conversations need manual review?
5. What should be changed in FSM / prompts / required fields?
6. Which A/B tests should be prioritized?

## Not in scope

- Revenue analytics.
- Marketing channel analytics.
- Profit growth claims.
- Real-time monitoring.
- Production integrations.
- LLM as source of truth for statuses.

## Success criterion

The case is strong if the dashboard clearly demonstrates that the AI bot is no longer a black box: each failure has a contract rule, evidence, severity and suggested next action.
