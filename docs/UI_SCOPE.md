# UI_SCOPE

## MVP pages

### 1. Overview

Cards:
- Total conversations
- Successful / closed correctly
- Handoff sent
- Conversations with violations
- Critical violations
- Review queue size

### 2. Scenario Funnel

Steps:
- conversation_started
- intent_detected
- scenario_selected
- field_collected / required fields collected
- handoff_ready
- handoff_sent
- request_closed / closed correctly

Group by scenario if possible.

### 3. Contract Violations

Show violation type counts and severity.

Required violation types:
- missing_required_field
- early_handoff
- duplicate_handoff
- fallback_loop
- post_handoff_violation
- repeated_question
- wrong_service_detected
- mixed_old_new_request
- cancel_flow_wrong
- unnecessary_handoff

### 4. Review Queue

Table columns:
- conversation_id
- scenario
- violation_type
- severity
- evidence
- suggested_fix

Click/open drill-down if easy. Do not overbuild.

### 5. A/B Backlog

Generate cards from violation patterns:
- problem
- hypothesis
- test A
- test B
- metric

Can use `data/expected/ab_hypotheses_reference.csv` as reference copy for MVP.

## Style

Dark premium operational dashboard. Calm, technical, not marketing-heavy.

## Avoid

- Sales/profit claims.
- Revenue metrics.
- Marketing analytics.
- “AI magic”.
- Unexplained pretty graphs.
