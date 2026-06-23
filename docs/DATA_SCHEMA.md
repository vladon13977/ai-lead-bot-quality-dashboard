# DATA_SCHEMA

## Input files

All files live in `data/input/`.

### conversations.csv
One row per conversation.

Columns:
- conversation_id
- user_id
- channel
- started_at
- last_message_at
- scenario
- current_state
- final_state
- messages_count
- duration_minutes

### messages.csv
Raw chat messages for drill-down, not primary analytics source.

Columns:
- message_id
- conversation_id
- timestamp
- direction: incoming / outgoing
- sender_type: client / bot / manager / system
- text

### bot_events.csv
Main event log. This is the most important analytics input.

Columns:
- event_id
- conversation_id
- timestamp
- event_type
- state_before
- state_after
- source: fsm / bot / llm / system
- payload: JSON string

### requests.csv
Current or closed lead request snapshot.

Columns:
- request_id
- conversation_id
- service
- status
- current_step
- required_fields: semicolon-separated
- collected_fields: semicolon-separated
- missing_fields: semicolon-separated
- handoff_ready: yes/no
- handoff_sent: yes/no
- manager_summary

### handoffs.csv
All handoff attempts to manager group.

Columns:
- handoff_id
- request_id
- conversation_id
- sent_at
- manager_group_id
- summary_text
- has_name: yes/no
- has_phone: yes/no
- has_service: yes/no
- has_car: yes/no
- has_details: yes/no
- is_duplicate: yes/no

### llm_annotations.csv
Optional helper layer. Not source of truth for critical statuses.

Columns:
- annotation_id
- conversation_id
- message_id
- intent
- service
- extracted_fields: JSON string
- confidence

### scenario_contracts.json
Rules for expected behavior by scenario.

Dashboard must use this file for validation instead of hard-coding all rules where possible.

## Expected files

Files in `data/expected/` are for QA only. Dashboard should not use them as analytics input.
