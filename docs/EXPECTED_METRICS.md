# EXPECTED_METRICS

Expected metrics are generated from the deterministic dataset and stored in `data/expected/expected_metrics.json`.

```json
{
  "dataset_name": "ai_lead_bot_quality_golden_dataset_v1",
  "records": {
    "conversations": 240,
    "messages": 1183,
    "bot_events": 2401,
    "requests": 240,
    "handoffs": 184,
    "llm_annotations": 240
  },
  "scenario_counts": {
    "new_service_request": 122,
    "cancel_or_reschedule": 29,
    "general_question": 33,
    "price_consultation": 56
  },
  "handoff_sent_count": 180,
  "complete_handoff_count": 132,
  "review_conversations_count": 63,
  "violations_total": 90,
  "violations_by_type": {
    "missing_required_field": 19,
    "early_handoff": 19,
    "unnecessary_handoff": 7,
    "wrong_service_detected": 7,
    "fallback_loop": 10,
    "duplicate_handoff": 4,
    "post_handoff_violation": 5,
    "cancel_flow_wrong": 4,
    "repeated_question": 12,
    "mixed_old_new_request": 3
  },
  "violations_by_severity": {
    "high": 54,
    "medium": 36
  },
  "top_expected_review_types": [
    "missing_required_field",
    "early_handoff",
    "repeated_question",
    "fallback_loop",
    "unnecessary_handoff"
  ],
  "main_expected_dashboard_question": "Does the AI lead bot follow the scenario contract, or does it violate required fields, handoff rules, fallback limits and post-handoff behavior?"
}
```

If actual values differ heavily, inspect validation logic before changing data.
