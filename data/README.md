# Data pack

`input/` contains source data that the dashboard should analyze.

`expected/` contains QA reference outputs. Dashboard must not use expected files as analytics input.

Generated dataset is deterministic and scenario-based, not random chart filler. It contains bot conversations and event logs that represent realistic AI lead intake failures: missing required fields, early handoff, duplicate handoff, fallback loops, post-handoff violations, wrong service detection, mixed old/new requests and cancel/reschedule errors.
