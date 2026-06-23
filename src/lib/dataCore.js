export const inputFilePaths = {
  conversationsCsv: "data/input/conversations.csv",
  messagesCsv: "data/input/messages.csv",
  botEventsCsv: "data/input/bot_events.csv",
  requestsCsv: "data/input/requests.csv",
  handoffsCsv: "data/input/handoffs.csv",
  llmAnnotationsCsv: "data/input/llm_annotations.csv",
  scenarioContractsJson: "data/input/scenario_contracts.json"
};

export const qaFilePaths = {
  expectedMetricsJson: "data/expected/expected_metrics.json",
  abHypothesesCsv: "data/expected/ab_hypotheses_reference.csv"
};

export const violationTypes = [
  "missing_required_field",
  "repeated_question",
  "early_handoff",
  "wrong_service_detected",
  "unnecessary_handoff",
  "fallback_loop",
  "duplicate_handoff",
  "post_handoff_violation",
  "cancel_flow_wrong",
  "mixed_old_new_request"
];

const reviewSortOrder = [
  "early_handoff",
  "missing_required_field",
  "unnecessary_handoff",
  "fallback_loop",
  "duplicate_handoff",
  "post_handoff_violation",
  "cancel_flow_wrong",
  "repeated_question",
  "mixed_old_new_request",
  "wrong_service_detected"
];

const severityByType = {
  missing_required_field: "high",
  early_handoff: "high",
  duplicate_handoff: "high",
  post_handoff_violation: "high",
  cancel_flow_wrong: "high",
  mixed_old_new_request: "high",
  unnecessary_handoff: "medium",
  wrong_service_detected: "medium",
  fallback_loop: "medium",
  repeated_question: "medium"
};

const suggestedFixByType = {
  missing_required_field: "Make required fields blocking before handoff_ready.",
  early_handoff: "Prevent handoff_sent until contract fields are collected.",
  duplicate_handoff: "Deduplicate by request_id and lock after the first handoff_sent event.",
  fallback_loop: "Escalate or show quick intent choices after the fallback limit.",
  post_handoff_violation: "Close or reset the active request immediately after manager handoff.",
  repeated_question: "Track asked fields and suppress repeated qualification prompts.",
  wrong_service_detected: "Confirm service against the catalog before handoff.",
  mixed_old_new_request: "Open a new request when new service intent appears after handoff.",
  cancel_flow_wrong: "Route cancel/reschedule to manager and avoid claiming completion.",
  unnecessary_handoff: "Keep general questions in answer flow unless commercial intent appears."
};

const positiveFinalStates = new Set(["request_closed", "answered_price", "answered", "conversation_closed"]);

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === "\"" && nextChar === "\"") {
        value += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [header, ...records] = rows.filter((cells) => cells.some((cell) => cell !== ""));
  if (!header) {
    return [];
  }

  return records.map((cells) => {
    const record = {};
    header.forEach((name, index) => {
      record[name] = cells[index] ?? "";
    });
    return record;
  });
}

export function toCsv(rows) {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) {
      return `"${text.replaceAll("\"", "\"\"")}"`;
    }
    return text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))
  ].join("\n");
}

export function parseDashboardData(texts) {
  return {
    conversations: parseCsv(texts.conversationsCsv),
    messages: parseCsv(texts.messagesCsv),
    botEvents: parseCsv(texts.botEventsCsv).map((event) => ({
      ...event,
      payload_json: safeJson(event.payload)
    })),
    requests: parseCsv(texts.requestsCsv),
    handoffs: parseCsv(texts.handoffsCsv),
    llmAnnotations: parseCsv(texts.llmAnnotationsCsv).map((annotation) => ({
      ...annotation,
      extracted_fields_json: safeJson(annotation.extracted_fields),
      confidence_number: Number(annotation.confidence || 0)
    })),
    contracts: JSON.parse(texts.scenarioContractsJson)
  };
}

export function buildDashboardModel(texts) {
  const data = parseDashboardData(texts);
  const maps = buildMaps(data);
  const violations = validateContracts(data, maps);
  const reviewConversationIds = new Set(violations.map((violation) => violation.conversation_id));
  const metrics = buildMetrics(data, maps, violations, reviewConversationIds);
  const funnel = buildFunnel(data, maps);
  const violationSummary = buildViolationSummary(violations);
  const conversationDetails = buildConversationDetails(data, maps);
  const dataReadiness = buildDataReadiness(data, maps, metrics);

  return {
    data,
    maps,
    metrics,
    funnel,
    violations,
    reviewQueue: violations,
    reviewConversationIds: [...reviewConversationIds],
    violationSummary,
    conversationDetails,
    dataReadiness,
    successfulClosedCount: data.conversations.filter((conversation) => {
      return positiveFinalStates.has(conversation.final_state) && !reviewConversationIds.has(conversation.conversation_id);
    }).length
  };
}

export function annotateHypotheses(rows, violations) {
  const counts = countBy(violations, "violation_type", violationTypes);
  return rows.map((row) => {
    const explicitTypes = splitMultiValue(row.technical_labels);
    const matchedTypes = explicitTypes.length
      ? explicitTypes
      : violationTypes.filter((type) => row.problem.includes(type));
    const calculatedPatternCount = matchedTypes.reduce((sum, type) => sum + (counts[type] || 0), 0);
    const suppliedSignalCount = Number(row.signal_count || 0);
    return {
      ...row,
      matched_types: matchedTypes,
      pattern_count: suppliedSignalCount || calculatedPatternCount
    };
  });
}

export function compareMetrics(actual, expected, options = {}) {
  const tolerances = options.tolerances || {};
  const paths = [
    "records.conversations",
    "records.messages",
    "records.bot_events",
    "records.requests",
    "records.handoffs",
    "records.llm_annotations",
    "scenario_counts.new_service_request",
    "scenario_counts.cancel_or_reschedule",
    "scenario_counts.general_question",
    "scenario_counts.price_consultation",
    "handoff_sent_count",
    "complete_handoff_count",
    "review_conversations_count",
    "violations_total",
    "violations_by_type.missing_required_field",
    "violations_by_type.early_handoff",
    "violations_by_type.unnecessary_handoff",
    "violations_by_type.wrong_service_detected",
    "violations_by_type.fallback_loop",
    "violations_by_type.duplicate_handoff",
    "violations_by_type.post_handoff_violation",
    "violations_by_type.cancel_flow_wrong",
    "violations_by_type.repeated_question",
    "violations_by_type.mixed_old_new_request",
    "violations_by_severity.high",
    "violations_by_severity.medium"
  ];

  const rows = paths.map((path) => {
    const actualValue = getPath(actual, path);
    const expectedValue = getPath(expected, path);
    const tolerance = tolerances[path] ?? tolerances[path.split(".").at(-1)] ?? 0;
    const delta = typeof actualValue === "number" && typeof expectedValue === "number"
      ? actualValue - expectedValue
      : actualValue === expectedValue
        ? 0
        : null;
    const passed = delta === null ? actualValue === expectedValue : Math.abs(delta) <= tolerance;
    return {
      metric: path,
      actual: actualValue,
      expected: expectedValue,
      delta,
      tolerance,
      status: passed ? (delta === 0 ? "match" : "within_tolerance") : "diff"
    };
  });

  const expectedTop = expected.top_expected_review_types || [];
  const topStatus = arraysEqual(actual.top_expected_review_types, expectedTop) ? "match" : "diff";
  rows.push({
    metric: "top_expected_review_types",
    actual: actual.top_expected_review_types.join(", "),
    expected: expectedTop.join(", "),
    delta: null,
    tolerance: 0,
    status: topStatus
  });

  return {
    rows,
    passed: rows.every((row) => row.status !== "diff"),
    diffs: rows.filter((row) => row.status === "diff")
  };
}

function validateContracts(data, maps) {
  const violations = [];
  const fallbackLimit = data.contracts.global_rules?.fallback_limit_before_review ?? 2;

  for (const request of data.requests) {
    const conversation = maps.conversationById.get(request.conversation_id);
    if (!conversation) {
      continue;
    }

    const missingFields = getMissingRequiredFields(request, conversation, data.contracts);
    if (isYes(request.handoff_sent) && missingFields.length) {
      addViolation(violations, conversation, "missing_required_field", `handoff_sent while missing required fields: ${formatFieldList(missingFields)}`);
    }

    if (conversation.scenario === "general_question" && isYes(request.handoff_sent)) {
      addViolation(violations, conversation, "unnecessary_handoff", "general question produced handoff without commercial intent");
    }
  }

  for (const [conversationId, events] of maps.eventsByConversation.entries()) {
    const conversation = maps.conversationById.get(conversationId);
    if (!conversation) {
      continue;
    }

    const fallbackEvents = events.filter((event) => event.event_type === "fallback_triggered");
    if (fallbackEvents.length > fallbackLimit) {
      addViolation(violations, conversation, "fallback_loop", `${fallbackEvents.length} fallback_triggered events`);
    }

    const earlyHandoffEvent = events.find((event) => {
      return event.event_type === "handoff_sent" && event.payload_json?.early === true;
    });
    if (earlyHandoffEvent) {
      const request = maps.requestByConversation.get(conversationId);
      const missingFields = request ? getMissingRequiredFields(request, conversation, data.contracts) : [];
      const evidenceFields = missingFields.length ? missingFields : ["contract_fields"];
      addViolation(violations, conversation, "early_handoff", `handoff_sent before required fields were collected: ${formatFieldList(evidenceFields)}`);
    }

    const handoffEvents = events.filter((event) => event.event_type === "handoff_sent");
    const duplicateHandoffEvents = handoffEvents.filter((event) => event.payload_json?.duplicate === true);
    if (duplicateHandoffEvents.length) {
      addViolation(violations, conversation, "duplicate_handoff", `${handoffEvents.length} handoff_sent events in one request`);
    }

    if (events.some((event) => ["bot_replied_after_handoff", "bot_message_after_handoff"].includes(event.event_type))) {
      addViolation(violations, conversation, "post_handoff_violation", "bot replied after handoff without opening/resetting request");
    }

    if (events.some((event) => ["bot_claims_cancel_completed", "bot_claimed_cancel_complete"].includes(event.event_type))) {
      addViolation(violations, conversation, "cancel_flow_wrong", "cancel/reschedule was handled as completed without manager confirmation");
    }

    const questionEvents = events.filter((event) => event.event_type === "question_asked");
    if (questionEvents.length > 1) {
      const repeatedField = questionEvents[0]?.payload_json?.field || "qualification question";
      addViolation(violations, conversation, "repeated_question", `${repeatedField} was requested twice in the same active request`);
    }

    if (events.some((event) => ["new_service_intent_detected", "new_service_intent_after_handoff"].includes(event.event_type))) {
      addViolation(violations, conversation, "mixed_old_new_request", "new service intent was attached to an already handed off request");
    }

    const request = maps.requestByConversation.get(conversationId);
    const wrongServiceEvent = events.find((event) => {
      const payload = event.payload_json || {};
      return event.event_type === "field_collected"
        && payload.field === "service"
        && request?.service
        && payload.value
        && payload.value !== request.service;
    });
    if (wrongServiceEvent) {
      addViolation(
        violations,
        conversation,
        "wrong_service_detected",
        `LLM/service field collected as ${wrongServiceEvent.payload_json.value}, expected/request service is ${request.service}`
      );
    }
  }

  return violations.sort((a, b) => {
    const conversationCompare = a.conversation_id.localeCompare(b.conversation_id, undefined, { numeric: true });
    if (conversationCompare !== 0) {
      return conversationCompare;
    }
    return reviewSortOrder.indexOf(a.violation_type) - reviewSortOrder.indexOf(b.violation_type);
  });
}

function buildMetrics(data, maps, violations, reviewConversationIds) {
  const violationsByType = countBy(violations, "violation_type", violationTypes);
  const violationsBySeverity = countBy(violations, "severity", ["high", "medium"]);
  const scenarioCounts = countBy(data.conversations, "scenario");
  const handoffSentCount = data.requests.filter((request) => isYes(request.handoff_sent)).length;
  const completeHandoffCount = data.handoffs.filter(isCompleteServiceHandoffRecord).length;

  return {
    dataset_name: "calculated_from_prepared_input_files",
    records: {
      conversations: data.conversations.length,
      messages: data.messages.length,
      bot_events: data.botEvents.length,
      requests: data.requests.length,
      handoffs: data.handoffs.length,
      llm_annotations: data.llmAnnotations.length
    },
    scenario_counts: scenarioCounts,
    handoff_sent_count: handoffSentCount,
    complete_handoff_count: completeHandoffCount,
    review_conversations_count: reviewConversationIds.size,
    violations_total: violations.length,
    violations_by_type: violationsByType,
    violations_by_severity: violationsBySeverity,
    top_expected_review_types: Object.entries(violationsByType)
      .filter(([, count]) => count > 0)
      .sort(([leftType, leftCount], [rightType, rightCount]) => {
        if (rightCount !== leftCount) {
          return rightCount - leftCount;
        }
        return violationTypes.indexOf(leftType) - violationTypes.indexOf(rightType);
      })
      .slice(0, 5)
      .map(([type]) => type),
    main_expected_dashboard_question: "Does the AI lead bot follow the scenario contract, or does it violate required fields, handoff rules, fallback limits and post-handoff behavior?"
  };
}

function buildFunnel(data, maps) {
  const scenarios = [...new Set(data.conversations.map((conversation) => conversation.scenario))].sort();
  const steps = [
    { id: "conversation_started", label: "Conversation started" },
    { id: "intent_detected", label: "Intent detected" },
    { id: "scenario_selected", label: "Scenario selected" },
    { id: "field_collected", label: "Fields collected" },
    { id: "handoff_ready", label: "Handoff ready" },
    { id: "handoff_sent", label: "Handoff sent" },
    { id: "closed_correctly", label: "Closed correctly" }
  ];

  const rows = scenarios.map((scenario) => {
    const conversations = data.conversations.filter((conversation) => conversation.scenario === scenario);
    const ids = new Set(conversations.map((conversation) => conversation.conversation_id));
    const countUnique = (predicate) => new Set(
      data.botEvents
        .filter((event) => ids.has(event.conversation_id) && predicate(event))
        .map((event) => event.conversation_id)
    ).size;

    const row = {
      scenario,
      total: conversations.length,
      conversation_started: countUnique((event) => event.event_type === "conversation_started"),
      intent_detected: countUnique((event) => event.event_type === "intent_detected"),
      scenario_selected: countUnique((event) => event.event_type === "scenario_selected"),
      field_collected: countUnique((event) => event.event_type === "field_collected"),
      handoff_ready: countUnique((event) => event.event_type === "handoff_ready"),
      handoff_sent: data.requests.filter((request) => ids.has(request.conversation_id) && isYes(request.handoff_sent)).length,
      closed_correctly: conversations.filter((conversation) => positiveFinalStates.has(conversation.final_state)).length,
      required_fields_ready: data.requests.filter((request) => {
        const conversation = maps.conversationById.get(request.conversation_id);
        return ids.has(request.conversation_id)
          && hasRequiredFields(request, conversation, data.contracts);
      }).length
    };

    row.steps = steps.map((step) => ({
      ...step,
      count: row[step.id],
      rate: row.total ? Math.round((row[step.id] / row.total) * 100) : 0
    }));

    return row;
  });

  const totals = {
    scenario: "All scenarios",
    total: data.conversations.length
  };
  for (const step of steps) {
    totals[step.id] = rows.reduce((sum, row) => sum + row[step.id], 0);
  }
  totals.required_fields_ready = rows.reduce((sum, row) => sum + row.required_fields_ready, 0);
  totals.steps = steps.map((step) => ({
    ...step,
    count: totals[step.id],
    rate: totals.total ? Math.round((totals[step.id] / totals.total) * 100) : 0
  }));

  return {
    steps,
    totals,
    rows
  };
}

function buildViolationSummary(violations) {
  const byType = countBy(violations, "violation_type", violationTypes);
  return violationTypes.map((type) => ({
    type,
    severity: severityByType[type],
    count: byType[type] || 0,
    suggested_fix: suggestedFixByType[type]
  }));
}

function buildConversationDetails(data, maps) {
  const details = {};
  for (const conversation of data.conversations) {
    details[conversation.conversation_id] = {
      conversation,
      request: maps.requestByConversation.get(conversation.conversation_id) || null,
      messages: maps.messagesByConversation.get(conversation.conversation_id) || [],
      events: maps.eventsByConversation.get(conversation.conversation_id) || [],
      handoffs: maps.handoffsByConversation.get(conversation.conversation_id) || [],
      annotation: maps.annotationByConversation.get(conversation.conversation_id) || null
    };
  }
  return details;
}

function buildDataReadiness(data, maps, metrics) {
  const scenarioNames = Object.keys(data.contracts.scenarios || {});
  const missingContracts = [...new Set(data.conversations.map((conversation) => conversation.scenario))]
    .filter((scenario) => !scenarioNames.includes(scenario));
  const eventCounts = countBy(data.botEvents, "event_type");

  return {
    files_loaded: {
      conversations: data.conversations.length,
      messages: data.messages.length,
      bot_events: data.botEvents.length,
      requests: data.requests.length,
      handoffs: data.handoffs.length,
      llm_annotations: data.llmAnnotations.length,
      scenario_contracts: scenarioNames.length
    },
    event_counts: eventCounts,
    missing_contracts: missingContracts,
    request_coverage_count: data.conversations.filter((conversation) => maps.requestByConversation.has(conversation.conversation_id)).length,
    handoff_unique_conversations: new Set(data.handoffs.map((handoff) => handoff.conversation_id)).size,
    qa_reference_note: "Expected files are used only for QA comparison and A/B card copy, not as analytics input.",
    metrics
  };
}

function buildMaps(data) {
  const conversationById = new Map(data.conversations.map((conversation) => [conversation.conversation_id, conversation]));
  const requestByConversation = new Map(data.requests.map((request) => [request.conversation_id, request]));
  const annotationByConversation = new Map(data.llmAnnotations.map((annotation) => [annotation.conversation_id, annotation]));
  return {
    conversationById,
    requestByConversation,
    annotationByConversation,
    eventsByConversation: groupBy(data.botEvents, "conversation_id"),
    messagesByConversation: groupBy(data.messages, "conversation_id"),
    handoffsByConversation: groupBy(data.handoffs, "conversation_id")
  };
}

function getMissingRequiredFields(request, conversation, contracts) {
  if (!conversation) {
    return splitList(request.missing_fields);
  }

  const contractFields = contracts.scenarios?.[conversation.scenario]?.required_fields_before_handoff || [];
  const requestRequiredFields = splitList(request.required_fields);
  const requiredFields = contractFields.length ? contractFields : requestRequiredFields;
  const reportedMissing = splitList(request.missing_fields);
  if (reportedMissing.length) {
    return reportedMissing;
  }

  const collectedFields = new Set(splitList(request.collected_fields));
  return requiredFields.filter((field) => !collectedFields.has(field));
}

function hasRequiredFields(request, conversation, contracts) {
  if (!conversation) {
    return false;
  }
  const requiredFields = contracts.scenarios?.[conversation.scenario]?.required_fields_before_handoff || splitList(request.required_fields);
  if (!requiredFields.length) {
    return true;
  }
  return getMissingRequiredFields(request, conversation, contracts).length === 0;
}

function addViolation(violations, conversation, type, evidence) {
  violations.push({
    conversation_id: conversation.conversation_id,
    scenario: conversation.scenario,
    channel: conversation.channel,
    violation_type: type,
    severity: severityByType[type],
    evidence,
    suggested_fix: suggestedFixByType[type],
    started_at: conversation.started_at,
    last_message_at: conversation.last_message_at
  });
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitMultiValue(value) {
  return String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFieldList(fields) {
  return fields.join(", ");
}

function isYes(value) {
  return String(value).toLowerCase() === "yes";
}

function isCompleteServiceHandoffRecord(handoff) {
  return isYes(handoff.has_phone)
    && isYes(handoff.has_service)
    && isYes(handoff.has_car)
    && !isYes(handoff.is_duplicate);
}

function groupBy(rows, key) {
  const grouped = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!grouped.has(value)) {
      grouped.set(value, []);
    }
    grouped.get(value).push(row);
  }
  return grouped;
}

function countBy(rows, key, orderedKeys = []) {
  const counts = {};
  for (const orderedKey of orderedKeys) {
    counts[orderedKey] = 0;
  }
  for (const row of rows) {
    const value = row[key] || "unknown";
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function safeJson(value) {
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function arraysEqual(left = [], right = []) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
