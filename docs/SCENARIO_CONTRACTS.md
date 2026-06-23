# SCENARIO_CONTRACTS

## Principle

Do not predefine only “bad events”. Define correct behavior first. Any deviation from the contract becomes a review signal.

## Included scenarios

1. `new_service_request`
2. `price_consultation`
3. `cancel_or_reschedule`
4. `general_question`

The machine-readable contracts are in `data/input/scenario_contracts.json`.

## Main contract checks

### Handoff required fields

Before `handoff_sent`, a scenario must have collected the fields listed in `required_fields_before_handoff`.

If handoff happens before required fields are collected, violations:
- `missing_required_field`
- `early_handoff`

### Duplicate handoff

If more than one `handoff_sent` event exists for one request/conversation, violation:
- `duplicate_handoff`

### Fallback loop

If `fallback_triggered` count is greater than global `fallback_limit_before_review`, violation:
- `fallback_loop`

### Post-handoff behavior

If bot replies after handoff without reset/new request handling, violation:
- `post_handoff_violation`

### Mixed old/new request

If new service intent appears while old request remains active/closed incorrectly, violation:
- `mixed_old_new_request`

### Cancel/reschedule safety

Bot must not claim it cancelled a booking by itself. It should collect reference/contact and hand off to manager.

If bot claims cancellation completed, violation:
- `cancel_flow_wrong`

## Every violation must include evidence

Example evidence:
`handoff_sent while missing required fields: phone`
