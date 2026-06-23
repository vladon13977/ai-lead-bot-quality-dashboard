import {
  annotateHypotheses,
  buildDashboardModel,
  compareMetrics,
  inputFilePaths,
  parseCsv,
  qaFilePaths,
  violationTypes
} from "./lib/dataCore.js";

const languageStorageKey = "aiLeadBotQualityDashboardLanguage";
const iconBasePath = "assets/icons/";

const navItems = [
  { id: "overview", labelKey: "nav.overview", icon: "nav_overview.png" },
  { id: "funnel", labelKey: "nav.funnel", icon: "nav_funnel.png" },
  { id: "violations", labelKey: "nav.violations", icon: "nav_issues.png" },
  { id: "review", labelKey: "nav.review", icon: "nav_review_queue.png" },
  { id: "backlog", labelKey: "nav.backlog", icon: "nav_ab_backlog.png" },
  { id: "upload", labelKey: "nav.upload", icon: "section_events.png" },
  { id: "readiness", labelKey: "nav.readiness", icon: "nav_data.png" }
];

const overviewMetricIcons = {
  total: "kpi_total_dialogs.png",
  success: "kpi_success.png",
  handoff: "kpi_handoff.png",
  review: "kpi_issues.png",
  critical: "kpi_critical.png",
  queue: "kpi_review.png"
};

const pipelineIconFiles = [
  "section_events.png",
  "section_rules.png",
  "section_problems.png",
  "nav_review_queue.png",
  "section_hypothesis.png"
];

const requiredUploadFiles = [
  { key: "conversationsCsv", metricKey: "conversations", name: "conversations.csv" },
  { key: "messagesCsv", metricKey: "messages", name: "messages.csv" },
  { key: "botEventsCsv", metricKey: "bot_events", name: "bot_events.csv" },
  { key: "requestsCsv", metricKey: "requests", name: "requests.csv" },
  { key: "handoffsCsv", metricKey: "handoffs", name: "handoffs.csv" },
  { key: "llmAnnotationsCsv", metricKey: "llm_annotations", name: "llm_annotations.csv" },
  { key: "scenarioContractsJson", metricKey: "scenario_contracts", name: "scenario_contracts.json" }
];

const optionalUploadFiles = [
  { key: "expectedMetricsJson", name: "expected_metrics.json" },
  { key: "expectedReviewQueueCsv", name: "expected_review_queue.csv" },
  { key: "abHypothesesCsv", name: "ab_hypotheses_reference.csv" }
];

const translations = {
  en: {
    "nav.overview": "Overview",
    "nav.funnel": "Scenario Funnel",
    "nav.violations": "Scenario Issues",
    "nav.review": "Dialogs to Review",
    "nav.backlog": "Improvement Hypotheses",
    "nav.upload": "Data Upload",
    "nav.readiness": "Data & Validation",

    "error.eyebrow": "Data loading failed",
    "error.title": "Serve the project from its root folder.",
    "loading.eyebrow": "AI Lead Bot Quality Dashboard",
    "loading.title": "Loading contract evidence...",

    "brand.eyebrow": "Quality dashboard",
    "brand.title": "AI Lead Bot Quality",
    "sidebar.sourceTitle": "Source of truth",
    "sidebar.sourceText": "Events, scenario contracts, request states, and handoff records.",
    "sidebar.language": "Language",
    "topbar.eyebrow": "Scenario quality control",
    "topbar.checked": "conversations checked",

    "page.overview.title": "AI Bot Quality Overview",
    "page.overview.subtitle": "A control dashboard for checking whether the AI lead bot follows the expected scenario, collects required fields and hands off complete requests to managers.",
    "page.funnel.title": "Scenario Completion Funnel",
    "page.funnel.subtitle": "Shows how conversations move through the expected bot flow: intent, scenario, required fields, handoff and correct closure.",
    "page.violations.title": "Scenario Issues",
    "page.violations.subtitle": "Quality signals where the bot behavior deviates from the expected scenario rules. Each issue is backed by event, request or handoff evidence.",
    "page.review.title": "Dialogs to Review",
    "page.review.subtitle": "A prioritized list of conversations that need manual inspection because the bot missed required data, handed off too early, repeated questions or crossed request boundaries.",
    "page.backlog.title": "Improvement Hypotheses",
    "page.backlog.subtitle": "Actionable hypotheses for improving the bot flow based on recurring scenario issues.",
    "page.upload.title": "Data Upload",
    "page.upload.subtitle": "Upload bot logs, request snapshots, handoff records and scenario contracts to recalculate the dashboard locally in the browser.",
    "page.readiness.title": "Data & Validation",
    "page.readiness.subtitle": "This page checks whether the loaded dataset matches the QA reference. Expected files are used only for validation, not as the source of analytics.",

    "overview.heroBadge": "QA layer for an AI lead intake bot",
    "overview.heroTitle": "Quality is measured by scenario behavior, not by a helpful-sounding reply.",
    "overview.heroText": "The dashboard checks the bot against expected scenario behavior, not against subjective “it replied normally” impressions. It uses event logs, request states and handoff records as source of truth.",
    "overview.pipeline": "Events → Scenario rules → Issues → Dialogs to review → Improvement hypotheses",
    "overview.metric.total": "Total conversations",
    "overview.metric.totalHint": "Input conversations",
    "overview.metric.success": "Successful / closed correctly",
    "overview.metric.successHint": "No issues, positive final state",
    "overview.metric.handoff": "Handoff sent",
    "overview.metric.handoffHint": "{rate}% of requests",
    "overview.metric.review": "Conversations with issues",
    "overview.metric.reviewHint": "{rate}% require inspection",
    "overview.metric.critical": "Critical issues",
    "overview.metric.criticalHint": "Critical scenario issues",
    "overview.metric.queue": "Dialogs to review",
    "overview.metric.queueHint": "Issue rows with evidence",
    "overview.questionLabel": "Control areas",
    "overview.mainQuestionText": "The dashboard tracks required fields, manager handoff timing, repeated questions, fallback behavior and request boundaries after handoff.",
    "overview.scenarioTitle": "Scenario Mix",
    "overview.scenarioSubtitle": "Conversation volume by contract scenario.",
    "overview.signalsTitle": "Top Quality Signals",
    "overview.signalsSubtitle": "Recurring issues that should drive prompt/FSM fixes.",
    "overview.whatTitle": "What is being checked",
    "overview.whatText": "Required fields, handoff timing, duplicate transfers, fallback limits, cancel/reschedule safety, and post-handoff behavior.",
    "overview.whyTitle": "Why it matters",
    "overview.whyText": "A bot can look smart in chat while still breaking the business process. This view makes those breaks inspectable.",
    "overview.sourceTitle": "Source of truth",
    "overview.sourceText": "Business facts come from event logs, request states, and handoff records. LLM annotations are helper context only.",
    "overview.fixTitle": "What to fix first",
    "overview.fixText": "Prioritize the most frequent review signals before changing prompts or FSM transitions.",

    "funnel.title": "Scenario Funnel",
    "funnel.subtitle": "Milestones are counted from bot events and request snapshots. Required-field readiness is contract-aware.",
    "funnel.scenario": "Scenario",
    "funnel.total": "Total",
    "funnel.intent": "Intent",
    "funnel.fields": "Fields",
    "funnel.requiredReady": "Required ready",
    "funnel.handoffReady": "Handoff ready",
    "funnel.handoffSent": "Handoff sent",
    "funnel.closedCorrectly": "Closed correctly",
    "funnel.conversation_started": "Conversation started",
    "funnel.intent_detected": "Intent detected",
    "funnel.scenario_selected": "Scenario selected",
    "funnel.field_collected": "Fields collected",
    "funnel.handoff_ready": "Handoff ready",
    "funnel.handoff_sent": "Handoff sent",
    "funnel.closed_correctly": "Closed correctly",

    "violations.total": "Total issues",
    "violations.totalHint": "All scenario issues",
    "violations.high": "Critical issues",
    "violations.highHint": "Unsafe handoff or request boundary",
    "violations.medium": "Medium-priority issues",
    "violations.mediumHint": "Needs FSM/prompt improvement",
    "violations.review": "Dialogs to review",
    "violations.reviewHint": "Unique conversations",
    "violations.title": "Issue Types",
    "violations.subtitle": "Each issue type is tied to deterministic event, request or handoff evidence, not LLM judgement.",

    "review.title": "Dialogs to Review",
    "review.subtitle": "Manual inspection candidates generated from scenario issues.",
    "review.rows": "rows",
    "review.search": "Search conversation, scenario, evidence",
    "review.allTypes": "All issue types",
    "review.allSeverities": "All severities",
    "review.conversation": "Conversation",
    "review.scenario": "Scenario",
    "review.violation": "Issue",
    "review.severity": "Severity",
    "review.evidence": "Evidence",
    "review.suggestedFix": "Suggested fix",
    "review.detailsTitle": "{id} Evidence",
    "review.detailsSubtitle": "{scenario} - final state: {state}",
    "review.selectedFinding": "Selected finding",
    "review.generatedNote": "Detected from event/state/handoff data, not LLM judgement.",
    "review.relatedRule": "Related rule / contract condition",
    "review.contractFindings": "Contract findings",
    "review.requestSnapshot": "Request snapshot",
    "review.eventEvidence": "Event evidence",
    "review.messageContext": "Message context",
    "review.service": "Service",
    "review.missingFields": "Missing fields",
    "review.none": "none",
    "review.notAvailable": "n/a",

    "backlog.title": "A/B Hypothesis Backlog",
    "backlog.subtitle": "Cards are generated from the prepared reference backlog and prioritized by detected violation patterns.",
    "backlog.signals": "signals",
    "backlog.problem": "Problem",
    "backlog.hypothesis": "Hypothesis",
    "backlog.testA": "Test A",
    "backlog.testB": "Test B",
    "backlog.metric": "Success metric",
    "backlog.impact": "Expected impact",
    "backlog.technicalPattern": "Technical pattern",

    "readiness.fileHint": "Loaded rows/contracts",
    "readiness.title": "Data & Validation",
    "readiness.subtitle": "This page checks whether the loaded dataset matches the QA reference. Expected files are used only for validation, not as the source of analytics.",
    "readiness.requestsCovered": "Requests covered by conversations",
    "readiness.uniqueHandoffs": "Unique conversations with handoffs",
    "readiness.missingContracts": "Missing contracts: {items}",
    "readiness.allContracts": "All conversation scenarios have matching contracts.",
    "readiness.eventsTitle": "Event Log Shape",
    "readiness.eventsSubtitle": "Event types that drive validation and funnel counts.",
    "readiness.qaTitle": "Expected vs Actual Metrics",
    "readiness.qaSubtitle": "Build-time QA comparison. It validates the dashboard without becoming the product itself.",
    "readiness.qaBadge": "QA validation layer",
    "readiness.metric": "Metric",
    "readiness.actual": "Actual",
    "readiness.expected": "Expected",
    "readiness.delta": "Delta",
    "readiness.status": "Status",

    "event.conversation_started": "Conversation Started",
    "event.message_received": "Message Received",
    "event.intent_detected": "Intent Detected",
    "event.scenario_selected": "Scenario Selected",
    "event.field_collected": "Field Collected",
    "event.handoff_ready": "Handoff Ready",
    "event.handoff_sent": "Handoff Sent",
    "event.request_closed": "Request Closed",
    "event.price_orientation_given": "Price Orientation Given",
    "event.conversation_closed": "Conversation Closed",

    "upload.currentPrepared": "Current source: prepared dataset",
    "upload.currentUploaded": "Current source: uploaded files",
    "upload.requiredTitle": "Required input files",
    "upload.optionalTitle": "Optional QA/reference files",
    "upload.requiredHint": "All required files must be present before analysis.",
    "upload.optionalHint": "Optional files enable QA comparison and custom backlog copy.",
    "upload.usePrepared": "Use prepared dataset",
    "upload.uploadFiles": "Upload files",
    "upload.analyze": "Analyze uploaded data",
    "upload.clear": "Clear uploaded data",
    "upload.loaded": "Loaded",
    "upload.missing": "Missing",
    "upload.optional": "Optional",
    "upload.missingRequired": "Upload all required files before analysis.",
    "upload.success": "Uploaded dataset analyzed successfully.",
    "upload.ready": "{count} file(s) ready for analysis.",
    "upload.preparedRestored": "Prepared dataset is active.",
    "upload.analysisFailed": "Could not analyze uploaded files: {error}",
    "upload.file": "File",
    "upload.status": "Status",
    "upload.rows": "Rows",
    "upload.loadedCountsTitle": "Loaded row counts",
    "upload.loadedCountsSubtitle": "Counts are recalculated from the active dataset in the browser.",

    "severity.high": "High",
    "severity.medium": "Medium",
    "status.match": "Match",
    "status.within_tolerance": "Within tolerance",
    "status.diff": "Diff",

    "scenario.new_service_request": "New service request",
    "scenario.price_consultation": "Price consultation",
    "scenario.cancel_or_reschedule": "Cancel or reschedule",
    "scenario.general_question": "General question",

    "violation.missing_required_field": "Missing required field",
    "violation.early_handoff": "Early handoff",
    "violation.duplicate_handoff": "Duplicate handoff",
    "violation.fallback_loop": "Fallback loop",
    "violation.post_handoff_violation": "Post-handoff violation",
    "violation.repeated_question": "Repeated question",
    "violation.wrong_service_detected": "Wrong service detected",
    "violation.mixed_old_new_request": "Mixed old/new request",
    "violation.cancel_flow_wrong": "Unsafe cancel flow",
    "violation.unnecessary_handoff": "Unnecessary handoff",

    "fix.missing_required_field": "Make required fields blocking before handoff_ready.",
    "fix.early_handoff": "Prevent handoff_sent until contract fields are collected.",
    "fix.duplicate_handoff": "Deduplicate by request_id and lock after the first handoff_sent event.",
    "fix.fallback_loop": "Escalate or show quick intent choices after the fallback limit.",
    "fix.post_handoff_violation": "Close or reset the active request immediately after manager handoff.",
    "fix.repeated_question": "Track asked fields and suppress repeated qualification prompts.",
    "fix.wrong_service_detected": "Confirm service against the catalog before handoff.",
    "fix.mixed_old_new_request": "Open a new request when new service intent appears after handoff.",
    "fix.cancel_flow_wrong": "Route cancel/reschedule to manager and avoid claiming completion.",
    "fix.unnecessary_handoff": "Keep general questions in answer flow unless commercial intent appears.",

    "rule.missing_required_field": "Before handoff_sent, the scenario must have collected all fields from required_fields_before_handoff.",
    "rule.early_handoff": "handoff_sent must happen only after required fields are collected and handoff_ready is safe.",
    "rule.duplicate_handoff": "Only one handoff_sent event is allowed per request/conversation.",
    "rule.fallback_loop": "fallback_triggered count must not exceed the global fallback_limit_before_review.",
    "rule.post_handoff_violation": "After handoff, the bot must close/reset the active request or route a new request cleanly.",
    "rule.repeated_question": "The bot should not ask the same qualification question repeatedly inside one request.",
    "rule.wrong_service_detected": "The collected service must match the request service used for manager handoff.",
    "rule.mixed_old_new_request": "New service intent after handoff must create a new request instead of continuing the old one.",
    "rule.cancel_flow_wrong": "The bot must not claim cancellation is completed by itself; cancel/reschedule should be handed to a manager.",
    "rule.unnecessary_handoff": "General questions should not create manager handoff unless commercial intent appears.",

    "file.conversations": "Conversations",
    "file.messages": "Messages",
    "file.bot_events": "Bot events",
    "file.requests": "Requests",
    "file.handoffs": "Handoffs",
    "file.llm_annotations": "LLM annotations",
    "file.scenario_contracts": "Scenario contracts",

    "ab.ab_001.title": "Phone collection before manager handoff",
    "ab.ab_001.problem": "The bot can transfer a service request before the phone number or required context is actually collected.",
    "ab.ab_001.hypothesis": "If phone is treated as a hard requirement before handoff_ready, incomplete manager transfers should drop.",
    "ab.ab_001.testA": "Keep the current flow with a soft phone request before manager transfer.",
    "ab.ab_001.testB": "Block handoff_ready until phone is collected and explain why the phone is needed.",
    "ab.ab_001.metric": "handoff completeness rate; missing_phone_before_handoff count",
    "ab.ab_001.impact": "Fewer incomplete handoffs.",
    "ab.ab_002.title": "Fallback recovery with intent choices",
    "ab.ab_002.problem": "Open-ended fallback keeps clients stuck when the bot cannot classify intent.",
    "ab.ab_002.hypothesis": "Quick choices after fallback should help the bot recover intent faster.",
    "ab.ab_002.testA": "Use the current generic fallback text.",
    "ab.ab_002.testB": "Show quick choices: service, price, booking, cancel, manager.",
    "ab.ab_002.metric": "fallback_loop rate; intent_detected after fallback",
    "ab.ab_002.impact": "Fewer fallback loops.",
    "ab.ab_003.title": "Clean request reset after handoff",
    "ab.ab_003.problem": "The old request can remain active after handoff, so later messages continue the wrong flow.",
    "ab.ab_003.hypothesis": "Closing the active request after handoff should reduce boundary errors.",
    "ab.ab_003.testA": "Keep current post-handoff behavior.",
    "ab.ab_003.testB": "Close active_request after handoff and route new service intent into a new request.",
    "ab.ab_003.metric": "post_handoff_violation count; mixed_old_new_request count",
    "ab.ab_003.impact": "Cleaner request boundaries.",
    "ab.ab_004.title": "Safer cancel/reschedule routing",
    "ab.ab_004.problem": "Cancel/reschedule messages can be handled like normal service requests or over-confirmed by the bot.",
    "ab.ab_004.hypothesis": "A dedicated cancel/reschedule scenario should prevent unsafe cancellation claims.",
    "ab.ab_004.testA": "Use current general intent routing.",
    "ab.ab_004.testB": "Use dedicated cancel_or_reschedule flow with booking reference and manager handoff.",
    "ab.ab_004.metric": "cancel_flow_wrong count; complete cancel/reschedule handoff rate",
    "ab.ab_004.impact": "Safer cancellation handling."
  },
  ru: {
    "nav.overview": "Обзор",
    "nav.funnel": "Воронка сценария",
    "nav.violations": "Отклонения сценария",
    "nav.review": "Диалоги на проверку",
    "nav.backlog": "Гипотезы улучшений",
    "nav.upload": "Загрузка данных",
    "nav.readiness": "Данные и проверка",

    "error.eyebrow": "Ошибка загрузки данных",
    "error.title": "Запустите проект из корневой папки.",
    "loading.eyebrow": "AI Lead Bot Quality",
    "loading.title": "Загружаю доказательства по контрактам...",

    "brand.eyebrow": "Контроль качества",
    "brand.title": "AI Lead Bot Quality",
    "sidebar.sourceTitle": "Источник правды",
    "sidebar.sourceText": "Журнал событий, контракты сценариев, состояния заявок и handoff-записи.",
    "sidebar.language": "Язык",
    "topbar.eyebrow": "Контроль сценариев",
    "topbar.checked": "диалогов проверено",

    "page.overview.title": "Обзор качества AI-бота",
    "page.overview.subtitle": "Панель контроля показывает, проходит ли AI-бот ожидаемый сценарий, собирает ли обязательные данные и передаёт ли менеджеру полноценные заявки.",
    "page.funnel.title": "Воронка прохождения сценария",
    "page.funnel.subtitle": "Показывает, как диалоги проходят ключевые этапы сценария: определение intent, выбор сценария, сбор данных, handoff и корректное закрытие.",
    "page.violations.title": "Отклонения сценария",
    "page.violations.subtitle": "Сигналы качества, где поведение бота отклоняется от ожидаемых правил сценария. Каждое отклонение подтверждается событием, заявкой или handoff-записью.",
    "page.review.title": "Диалоги на проверку",
    "page.review.subtitle": "Приоритетный список диалогов, которые нужно разобрать вручную: бот мог не собрать данные, рано передать заявку, повторить вопрос или смешать границы заявки.",
    "page.backlog.title": "Гипотезы улучшений",
    "page.backlog.subtitle": "Гипотезы для улучшения сценариев бота на основе повторяющихся проблем качества.",
    "page.upload.title": "Загрузка данных",
    "page.upload.subtitle": "Загрузите логи бота, снимки заявок, handoff-записи и контракты сценариев, чтобы пересчитать панель локально в браузере.",
    "page.readiness.title": "Данные и проверка",
    "page.readiness.subtitle": "Этот раздел показывает, совпадают ли расчёты по загруженным данным с QA-эталоном. Контрольные файлы используются только для сверки, а не как источник аналитики.",

    "overview.heroBadge": "QA-слой для AI-бота приема заявок",
    "overview.heroTitle": "Качество измеряется поведением сценария, а не тем, что ответ звучит нормально.",
    "overview.heroText": "Панель проверяет бота по ожидаемому поведению сценария, а не по субъективному “он вроде нормально отвечает”. Источник истины — журнал событий, состояния заявок и handoff-записи.",
    "overview.pipeline": "События → Правила сценария → Проблемы → Диалоги на проверку → Гипотезы улучшений",
    "overview.metric.total": "Всего диалогов",
    "overview.metric.totalHint": "Входные диалоги",
    "overview.metric.success": "Успешно / корректно закрыто",
    "overview.metric.successHint": "Без проблем, позитивное финальное состояние",
    "overview.metric.handoff": "Передано менеджеру",
    "overview.metric.handoffHint": "{rate}% заявок",
    "overview.metric.review": "Диалоги с проблемами",
    "overview.metric.reviewHint": "{rate}% требуют проверки",
    "overview.metric.critical": "Критичные проблемы",
    "overview.metric.criticalHint": "Критичные проблемы сценария",
    "overview.metric.queue": "Диалоги на проверку",
    "overview.metric.queueHint": "Строки проблем с подтверждением",
    "overview.questionLabel": "Зоны контроля",
    "overview.mainQuestionText": "Панель отслеживает обязательные поля, момент передачи менеджеру, повторные вопросы, fallback-сценарии и границы заявки после handoff.",
    "overview.scenarioTitle": "Сценарии",
    "overview.scenarioSubtitle": "Объем диалогов по контрактным сценариям.",
    "overview.signalsTitle": "Главные сигналы качества",
    "overview.signalsSubtitle": "Повторяющиеся проблемы для исправления prompts/FSM.",
    "overview.whatTitle": "Что проверяется",
    "overview.whatText": "Обязательные поля, момент handoff, дубликаты передачи, fallback-лимиты, безопасность cancel/reschedule и поведение после handoff.",
    "overview.whyTitle": "Почему это важно",
    "overview.whyText": "Бот может выглядеть умным в чате, но ломать бизнес-процесс. Этот экран делает такие поломки видимыми.",
    "overview.sourceTitle": "Источник правды",
    "overview.sourceText": "Бизнес-факты берутся из журнала событий, состояний заявок и handoff-записей. Аннотации LLM — только вспомогательный контекст.",
    "overview.fixTitle": "Что чинить первым",
    "overview.fixText": "Начните с самых частых сигналов ручной проверки, прежде чем менять prompts или FSM-переходы.",

    "funnel.title": "Воронка сценария",
    "funnel.subtitle": "Этапы считаются по событиям бота и снимкам состояния заявок. Готовность обязательных полей учитывает контракт.",
    "funnel.scenario": "Сценарий",
    "funnel.total": "Всего",
    "funnel.intent": "Intent",
    "funnel.fields": "Поля",
    "funnel.requiredReady": "Обязательные готовы",
    "funnel.handoffReady": "Готово к передаче",
    "funnel.handoffSent": "Передано менеджеру",
    "funnel.closedCorrectly": "Корректно закрыто",
    "funnel.conversation_started": "Диалог начат",
    "funnel.intent_detected": "Намерение определено",
    "funnel.scenario_selected": "Сценарий выбран",
    "funnel.field_collected": "Поля собраны",
    "funnel.handoff_ready": "Готово к передаче",
    "funnel.handoff_sent": "Передано менеджеру",
    "funnel.closed_correctly": "Корректно закрыто",

    "violations.total": "Всего проблем",
    "violations.totalHint": "Все отклонения сценария",
    "violations.high": "Критичные проблемы",
    "violations.highHint": "Небезопасный handoff или граница заявки",
    "violations.medium": "Средняя критичность",
    "violations.mediumHint": "Нужно исправить FSM/prompt",
    "violations.review": "Диалоги на проверку",
    "violations.reviewHint": "Уникальные диалоги",
    "violations.title": "Типы проблем",
    "violations.subtitle": "Каждый тип подтверждается событием, заявкой или handoff-записью, а не оценкой LLM.",

    "review.title": "Диалоги на проверку",
    "review.subtitle": "Диалоги для ручной проверки, собранные из отклонений сценария.",
    "review.rows": "строк",
    "review.search": "Поиск по диалогу, сценарию или подтверждению",
    "review.allTypes": "Все типы проблем",
    "review.allSeverities": "Все уровни критичности",
    "review.conversation": "Диалог",
    "review.scenario": "Сценарий",
    "review.violation": "Проблема",
    "review.severity": "Критичность",
    "review.evidence": "Подтверждение",
    "review.suggestedFix": "Что исправить",
    "review.detailsTitle": "Подтверждение: {id}",
    "review.detailsSubtitle": "{scenario} - финальное состояние: {state}",
    "review.selectedFinding": "Выбранная проблема",
    "review.generatedNote": "Определено по событиям, состояниям и handoff-записям, а не по решению LLM.",
    "review.relatedRule": "Связанное правило / условие контракта",
    "review.contractFindings": "Найденные нарушения контракта",
    "review.requestSnapshot": "Снимок состояния заявки",
    "review.eventEvidence": "Подтверждения из событий",
    "review.messageContext": "Контекст сообщений",
    "review.service": "Услуга",
    "review.missingFields": "Недостающие поля",
    "review.none": "нет",
    "review.notAvailable": "н/д",

    "backlog.title": "A/B-гипотезы",
    "backlog.subtitle": "Карточки берутся из подготовленного списка гипотез и приоритизируются по найденным паттернам нарушений.",
    "backlog.signals": "сигналов",
    "backlog.problem": "Проблема",
    "backlog.hypothesis": "Гипотеза",
    "backlog.testA": "Тест A",
    "backlog.testB": "Тест B",
    "backlog.metric": "Метрика успеха",
    "backlog.impact": "Ожидаемый эффект",
    "backlog.technicalPattern": "Техническая метка",

    "readiness.fileHint": "Загруженные строки/контракты",
    "readiness.title": "Данные и проверка",
    "readiness.subtitle": "Этот раздел показывает, совпадают ли расчёты по загруженным данным с QA-эталоном. Контрольные файлы используются только для сверки, а не как источник аналитики.",
    "readiness.requestsCovered": "Заявки, связанные с диалогами",
    "readiness.uniqueHandoffs": "Уникальные диалоги с handoff",
    "readiness.missingContracts": "Нет контрактов: {items}",
    "readiness.allContracts": "Для всех сценариев диалогов есть контракты.",
    "readiness.eventsTitle": "Структура журнала событий",
    "readiness.eventsSubtitle": "Типы событий, на которых строятся проверка и расчёты воронки.",
    "readiness.qaTitle": "Ожидание и факт",
    "readiness.qaSubtitle": "QA-сверка проверяет расчёты панели, но не является источником аналитики.",
    "readiness.qaBadge": "QA-сверка",
    "readiness.metric": "Метрика",
    "readiness.actual": "Факт",
    "readiness.expected": "Ожидание",
    "readiness.delta": "Разница",
    "readiness.status": "Статус",

    "event.conversation_started": "Диалог начат",
    "event.message_received": "Сообщение получено",
    "event.intent_detected": "Намерение определено",
    "event.scenario_selected": "Сценарий выбран",
    "event.field_collected": "Поле собрано",
    "event.handoff_ready": "Готово к передаче",
    "event.handoff_sent": "Передано менеджеру",
    "event.request_closed": "Заявка закрыта",
    "event.price_orientation_given": "Ориентир по цене отправлен",
    "event.conversation_closed": "Диалог закрыт",

    "upload.currentPrepared": "Текущий источник: подготовленный набор данных",
    "upload.currentUploaded": "Текущий источник: загруженные файлы",
    "upload.requiredTitle": "Обязательные входные файлы",
    "upload.optionalTitle": "Опциональные файлы для QA-сверки",
    "upload.requiredHint": "Все обязательные файлы должны быть загружены перед анализом.",
    "upload.optionalHint": "Опциональные файлы включают QA-сверку и собственный текст гипотез.",
    "upload.usePrepared": "Использовать подготовленные данные",
    "upload.uploadFiles": "Загрузить файлы",
    "upload.analyze": "Проанализировать загруженные данные",
    "upload.clear": "Сбросить загруженные данные",
    "upload.loaded": "Загружен",
    "upload.missing": "Не хватает",
    "upload.optional": "Опционально",
    "upload.missingRequired": "Загрузите все обязательные файлы перед анализом.",
    "upload.success": "Загруженный набор данных успешно проанализирован.",
    "upload.ready": "Файлов готово к анализу: {count}.",
    "upload.preparedRestored": "Подготовленный набор данных снова активен.",
    "upload.analysisFailed": "Не удалось проанализировать загруженные файлы: {error}",
    "upload.file": "Файл",
    "upload.status": "Статус",
    "upload.rows": "Строки",
    "upload.loadedCountsTitle": "Сколько данных загружено",
    "upload.loadedCountsSubtitle": "Количество пересчитано по активному набору данных прямо в браузере.",

    "severity.high": "Высокая",
    "severity.medium": "Средняя",
    "status.match": "Совпадает",
    "status.within_tolerance": "В допуске",
    "status.diff": "Расхождение",

    "scenario.new_service_request": "Новая заявка на услугу",
    "scenario.price_consultation": "Консультация по цене",
    "scenario.cancel_or_reschedule": "Отмена или перенос",
    "scenario.general_question": "Общий вопрос",

    "violation.missing_required_field": "Нет обязательного поля",
    "violation.early_handoff": "Ранний handoff",
    "violation.duplicate_handoff": "Дублирующий handoff",
    "violation.fallback_loop": "Fallback loop",
    "violation.post_handoff_violation": "Нарушение после handoff",
    "violation.repeated_question": "Повторный вопрос",
    "violation.wrong_service_detected": "Неверно определена услуга",
    "violation.mixed_old_new_request": "Смешана старая и новая заявка",
    "violation.cancel_flow_wrong": "Небезопасная отмена",
    "violation.unnecessary_handoff": "Лишний handoff",

    "fix.missing_required_field": "Сделать обязательные поля блокирующими до handoff_ready.",
    "fix.early_handoff": "Запретить handoff_sent, пока контрактные поля не собраны.",
    "fix.duplicate_handoff": "Дедуплицировать по request_id и блокировать повтор после первого handoff_sent.",
    "fix.fallback_loop": "После лимита fallback показать быстрые варианты intent или передать менеджеру.",
    "fix.post_handoff_violation": "Закрывать или сбрасывать активную заявку сразу после handoff менеджеру.",
    "fix.repeated_question": "Отслеживать уже заданные поля и не повторять уточняющие вопросы.",
    "fix.wrong_service_detected": "Подтверждать услугу по каталогу перед handoff.",
    "fix.mixed_old_new_request": "Создавать новую заявку, если после handoff появился новый service intent.",
    "fix.cancel_flow_wrong": "Передавать cancel/reschedule менеджеру и не подтверждать отмену от имени бота.",
    "fix.unnecessary_handoff": "Оставлять общие вопросы в сценарии ответа, пока не появился коммерческий intent.",

    "rule.missing_required_field": "До handoff_sent сценарий должен собрать все поля из required_fields_before_handoff.",
    "rule.early_handoff": "handoff_sent допустим только после сбора обязательных полей и безопасного handoff_ready.",
    "rule.duplicate_handoff": "На одну заявку/диалог допускается только одно событие handoff_sent.",
    "rule.fallback_loop": "Число fallback_triggered не должно превышать global fallback_limit_before_review.",
    "rule.post_handoff_violation": "После handoff бот должен закрыть или сбросить активную заявку либо корректно направить новую.",
    "rule.repeated_question": "Бот не должен повторно задавать один и тот же уточняющий вопрос в одной заявке.",
    "rule.wrong_service_detected": "Собранная service должна совпадать с услугой в заявке, которая уходит менеджеру.",
    "rule.mixed_old_new_request": "Новый service intent после handoff должен открывать новую заявку, а не продолжать старую.",
    "rule.cancel_flow_wrong": "Бот не должен утверждать, что отмена завершена; cancel/reschedule уходит менеджеру.",
    "rule.unnecessary_handoff": "Общий вопрос не должен создавать handoff менеджеру без коммерческого intent.",

    "file.conversations": "Диалоги",
    "file.messages": "Сообщения",
    "file.bot_events": "События бота",
    "file.requests": "Заявки",
    "file.handoffs": "Handoff-записи",
    "file.llm_annotations": "Аннотации LLM",
    "file.scenario_contracts": "Контракты сценариев",

    "ab.ab_001.title": "Сбор телефона до передачи менеджеру",
    "ab.ab_001.problem": "Бот может передать заявку на услугу до того, как телефон или обязательный контекст реально собраны.",
    "ab.ab_001.hypothesis": "Если телефон станет жестким условием до handoff_ready, неполных передач менеджеру станет меньше.",
    "ab.ab_001.testA": "Оставить текущий сценарий с мягким запросом телефона перед передачей.",
    "ab.ab_001.testB": "Блокировать handoff_ready до сбора телефона и объяснять, зачем телефон нужен.",
    "ab.ab_001.metric": "handoff completeness rate; missing_phone_before_handoff count",
    "ab.ab_001.impact": "Меньше неполных handoff.",
    "ab.ab_002.title": "Восстановление fallback через выбор intent",
    "ab.ab_002.problem": "Открытый fallback удерживает клиента в тупике, когда бот не классифицировал intent.",
    "ab.ab_002.hypothesis": "Быстрые варианты после fallback помогут быстрее восстановить intent.",
    "ab.ab_002.testA": "Использовать текущий общий текст fallback.",
    "ab.ab_002.testB": "Показать быстрый выбор: услуга, цена, запись, отмена, менеджер.",
    "ab.ab_002.metric": "fallback_loop rate; intent_detected after fallback",
    "ab.ab_002.impact": "Меньше fallback-loop ситуаций.",
    "ab.ab_003.title": "Чистый сброс заявки после handoff",
    "ab.ab_003.problem": "Старая заявка может оставаться активной после handoff, и новые сообщения продолжают неверный сценарий.",
    "ab.ab_003.hypothesis": "Закрытие активной заявки после handoff должно уменьшить ошибки границ заявки.",
    "ab.ab_003.testA": "Оставить текущее поведение после handoff.",
    "ab.ab_003.testB": "Закрывать active_request после handoff и направлять новый service intent в новую заявку.",
    "ab.ab_003.metric": "post_handoff_violation count; mixed_old_new_request count",
    "ab.ab_003.impact": "Более чистые границы заявок.",
    "ab.ab_004.title": "Безопасный сценарий отмены/переноса",
    "ab.ab_004.problem": "Отмена или перенос могут обрабатываться как обычная заявка, либо бот может ошибочно подтвердить отмену.",
    "ab.ab_004.hypothesis": "Отдельный сценарий отмены/переноса снизит риск небезопасных подтверждений.",
    "ab.ab_004.testA": "Использовать текущую маршрутизацию общего intent.",
    "ab.ab_004.testB": "Использовать отдельный сценарий cancel_or_reschedule с номером записи и handoff менеджеру.",
    "ab.ab_004.metric": "cancel_flow_wrong count; complete cancel/reschedule handoff rate",
    "ab.ab_004.impact": "Более безопасная обработка отмен."
  }
};

const state = {
  activePage: "overview",
  language: getInitialLanguage(),
  dataSource: "prepared",
  preparedTexts: null,
  preparedExpectedMetrics: null,
  preparedHypothesisRows: [],
  uploadedFiles: {},
  uploadStatus: "",
  uploadError: "",
  uploadErrorDetail: "",
  model: null,
  expectedMetrics: null,
  comparison: null,
  hypotheses: [],
  selectedReviewKey: null,
  reviewSearch: "",
  reviewType: "all",
  reviewSeverity: "all",
  error: null
};

const root = document.querySelector("#app");

document.addEventListener("click", async (event) => {
  const languageButton = event.target.closest("[data-language]");
  if (languageButton) {
    setLanguage(languageButton.dataset.language);
    return;
  }

  const preparedButton = event.target.closest("[data-use-prepared]");
  if (preparedButton) {
    usePreparedDataset();
    return;
  }

  const analyzeButton = event.target.closest("[data-analyze-uploaded]");
  if (analyzeButton) {
    analyzeUploadedDataset();
    return;
  }

  const clearButton = event.target.closest("[data-clear-uploaded]");
  if (clearButton) {
    clearUploadedDataset();
    return;
  }

  const navButton = event.target.closest("[data-page]");
  if (navButton) {
    state.activePage = navButton.dataset.page;
    render();
    return;
  }

  const reviewRow = event.target.closest("[data-review-key]");
  if (reviewRow) {
    state.selectedReviewKey = decodeURIComponent(reviewRow.dataset.reviewKey);
    render();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-review-search]")) {
    state.reviewSearch = event.target.value;
    render();
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.matches("[data-review-type]")) {
    state.reviewType = event.target.value;
    state.selectedReviewKey = null;
    render();
  }
  if (event.target.matches("[data-review-severity]")) {
    state.reviewSeverity = event.target.value;
    state.selectedReviewKey = null;
    render();
  }
  if (event.target.matches("[data-upload-files]")) {
    await handleUploadSelection(event.target.files);
    event.target.value = "";
  }
});

boot();

async function boot() {
  try {
    const prepared = await loadPreparedDataset();
    state.preparedTexts = prepared.texts;
    state.preparedExpectedMetrics = prepared.expectedMetrics;
    state.preparedHypothesisRows = prepared.hypothesisRows;
    applyDataset(prepared.texts, {
      source: "prepared",
      expectedMetrics: prepared.expectedMetrics,
      hypothesisRows: prepared.hypothesisRows
    });
  } catch (error) {
    state.error = error;
  }

  render();
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.text();
}

async function loadPreparedDataset() {
  const texts = {};
  await Promise.all(Object.entries(inputFilePaths).map(async ([key, path]) => {
    texts[key] = await fetchText(path);
  }));

  let expectedMetrics = null;
  try {
    expectedMetrics = JSON.parse(await fetchText(qaFilePaths.expectedMetricsJson));
  } catch (error) {
    console.warn("QA reference metrics were not loaded.", error);
  }

  let hypothesisRows = [];
  try {
    hypothesisRows = parseCsv(await fetchText(qaFilePaths.abHypothesesCsv));
  } catch (error) {
    console.warn("A/B reference copy was not loaded.", error);
  }

  return { texts, expectedMetrics, hypothesisRows };
}

function applyDataset(texts, options = {}) {
  const source = options.source || "prepared";
  const expectedMetrics = options.expectedMetrics || null;
  const hypothesisRows = options.hypothesisRows || [];
  const model = buildDashboardModel(texts);

  state.model = model;
  state.dataSource = source;
  state.expectedMetrics = expectedMetrics;
  state.comparison = expectedMetrics
    ? compareMetrics(model.metrics, expectedMetrics, {
      tolerances: { complete_handoff_count: 2 }
    })
    : null;
  state.hypotheses = hypothesisRows.length
    ? annotateHypotheses(hypothesisRows, model.violations)
    : buildFallbackHypotheses(model.violations);
  state.selectedReviewKey = null;
  state.reviewSearch = "";
  state.reviewType = "all";
  state.reviewSeverity = "all";
}

function usePreparedDataset() {
  if (!state.preparedTexts) {
    return;
  }
  applyDataset(state.preparedTexts, {
    source: "prepared",
    expectedMetrics: state.preparedExpectedMetrics,
    hypothesisRows: state.preparedHypothesisRows
  });
  state.uploadStatus = "prepared";
  state.uploadError = "";
  state.uploadErrorDetail = "";
  render();
}

async function handleUploadSelection(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) {
    return;
  }

  try {
    const nextFiles = { ...state.uploadedFiles };
    for (const file of files) {
      nextFiles[file.name] = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        text: await readFileAsText(file)
      };
    }
    state.uploadedFiles = nextFiles;
    state.uploadStatus = "ready";
    state.uploadError = "";
    state.uploadErrorDetail = "";
  } catch (error) {
    state.uploadStatus = "";
    state.uploadError = "analysis";
    state.uploadErrorDetail = error.message;
  }
  render();
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error || new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

function analyzeUploadedDataset() {
  const missingFiles = getMissingRequiredUploadFiles();
  if (missingFiles.length) {
    state.uploadStatus = "";
    state.uploadError = "missing";
    state.uploadErrorDetail = "";
    render();
    return;
  }

  try {
    const texts = Object.fromEntries(requiredUploadFiles.map((file) => {
      return [file.key, state.uploadedFiles[file.name].text];
    }));
    const expectedMetrics = state.uploadedFiles["expected_metrics.json"]
      ? JSON.parse(state.uploadedFiles["expected_metrics.json"].text)
      : null;
    const hypothesisRows = state.uploadedFiles["ab_hypotheses_reference.csv"]
      ? parseCsv(state.uploadedFiles["ab_hypotheses_reference.csv"].text)
      : state.preparedHypothesisRows;

    applyDataset(texts, {
      source: "uploaded",
      expectedMetrics,
      hypothesisRows
    });
    state.uploadStatus = "success";
    state.uploadError = "";
    state.uploadErrorDetail = "";
  } catch (error) {
    state.uploadStatus = "";
    state.uploadError = "analysis";
    state.uploadErrorDetail = error.message;
  }
  render();
}

function clearUploadedDataset() {
  state.uploadedFiles = {};
  state.uploadStatus = "";
  state.uploadError = "";
  state.uploadErrorDetail = "";
  if (state.dataSource === "uploaded") {
    usePreparedDataset();
    return;
  }
  render();
}

function getMissingRequiredUploadFiles() {
  return requiredUploadFiles.filter((file) => !state.uploadedFiles[file.name]);
}

function uploadFileCount(file) {
  if (file.metricKey && state.dataSource === "uploaded") {
    const activeCount = state.model?.dataReadiness?.files_loaded?.[file.metricKey];
    if (typeof activeCount === "number") {
      return activeCount;
    }
  }

  const uploaded = state.uploadedFiles[file.name];
  if (!uploaded) {
    return "";
  }
  if (file.name.endsWith(".csv")) {
    return parseCsv(uploaded.text).length;
  }
  try {
    const json = JSON.parse(uploaded.text);
    if (file.name === "scenario_contracts.json") {
      return Object.keys(json.scenarios || {}).length;
    }
    if (Array.isArray(json)) {
      return json.length;
    }
    return Object.keys(json || {}).length;
  } catch {
    return 1;
  }
}

function render() {
  if (state.error) {
    root.innerHTML = `
      <main class="load-error">
        <p class="eyebrow">${escapeHtml(t("error.eyebrow"))}</p>
        <h1>${escapeHtml(t("error.title"))}</h1>
        <p>${escapeHtml(state.error.message)}</p>
        <code>python3 -m http.server --bind 127.0.0.1 5173</code>
      </main>
    `;
    return;
  }

  if (!state.model) {
    root.innerHTML = `
      <main class="loading">
        <p class="eyebrow">${escapeHtml(t("loading.eyebrow"))}</p>
        <h1>${escapeHtml(t("loading.title"))}</h1>
      </main>
    `;
    return;
  }

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-top">
          <div class="brand-block">
            <div class="product-mark"><span>QA</span></div>
            <div>
              <p class="eyebrow">${escapeHtml(t("brand.eyebrow"))}</p>
              <h1>${escapeHtml(t("brand.title"))}</h1>
            </div>
          </div>
          <nav class="nav-list">
            ${navItems.map(({ id, labelKey, icon }) => `
              <button class="${state.activePage === id ? "active" : ""}" data-page="${id}">
                ${iconImg("nav-icon", icon)}
                <span>${escapeHtml(t(labelKey))}</span>
              </button>
            `).join("")}
          </nav>
        </div>

        <div class="sidebar-bottom">
          <div class="language-block">
            <span>${escapeHtml(t("sidebar.language"))}</span>
            <div class="language-switcher" role="group" aria-label="${escapeHtml(t("sidebar.language"))}">
              ${["en", "ru"].map((language) => `
                <button class="language-button ${state.language === language ? "active" : ""}" data-language="${language}">
                  ${language.toUpperCase()}
                </button>
              `).join("")}
            </div>
          </div>
          <div class="side-note">
            <strong class="section-title-with-icon">
              ${iconImg("inline-section-icon", "source_truth.png")}
              <span>${escapeHtml(t("sidebar.sourceTitle"))}</span>
            </strong>
            <span>${escapeHtml(t("sidebar.sourceText"))}</span>
          </div>
        </div>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <p class="eyebrow">${escapeHtml(t("topbar.eyebrow"))}</p>
            <h2>${escapeHtml(t(`page.${state.activePage}.title`))}</h2>
            <p class="page-subtitle">${escapeHtml(t(`page.${state.activePage}.subtitle`))}</p>
          </div>
          <div class="data-pill">
            <span>${formatNumber(state.model.metrics.records.conversations)}</span>
            ${escapeHtml(t("topbar.checked"))}
          </div>
        </header>
        ${renderActivePage()}
      </main>
    </div>
  `;
}

function renderActivePage() {
  if (state.activePage === "overview") {
    return renderOverview();
  }
  if (state.activePage === "funnel") {
    return renderFunnel();
  }
  if (state.activePage === "violations") {
    return renderViolations();
  }
  if (state.activePage === "review") {
    return renderReviewQueue();
  }
  if (state.activePage === "backlog") {
    return renderBacklog();
  }
  if (state.activePage === "upload") {
    return renderDataUpload();
  }
  return renderReadiness();
}

function renderOverview() {
  const { metrics, successfulClosedCount, violationSummary } = state.model;
  const highCount = metrics.violations_by_severity.high || 0;
  const handoffRate = pct(metrics.handoff_sent_count, metrics.records.requests);
  const reviewRate = pct(metrics.review_conversations_count, metrics.records.conversations);
  const topViolations = violationSummary
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  return `
    <section class="case-hero">
      <span class="mini-badge mini-badge--cyan">${escapeHtml(t("overview.heroBadge"))}</span>
      <h3>${escapeHtml(t("overview.heroTitle"))}</h3>
      <p>${escapeHtml(t("overview.heroText"))}</p>
      <div class="pipeline-block" aria-label="${escapeHtml(t("overview.pipeline"))}">
        ${renderPipelineSteps()}
      </div>
    </section>

    <section class="metric-grid">
      ${metricCard(t("overview.metric.total"), metrics.records.conversations, t("overview.metric.totalHint"), "", overviewMetricIcons.total)}
      ${metricCard(t("overview.metric.success"), successfulClosedCount, t("overview.metric.successHint"), "", overviewMetricIcons.success)}
      ${metricCard(t("overview.metric.handoff"), metrics.handoff_sent_count, t("overview.metric.handoffHint", { rate: handoffRate }), "", overviewMetricIcons.handoff)}
      ${metricCard(t("overview.metric.review"), metrics.review_conversations_count, t("overview.metric.reviewHint", { rate: reviewRate }), "warn", overviewMetricIcons.review)}
      ${metricCard(t("overview.metric.critical"), highCount, t("overview.metric.criticalHint"), "danger", overviewMetricIcons.critical)}
      ${metricCard(t("overview.metric.queue"), metrics.violations_total, t("overview.metric.queueHint"), "", overviewMetricIcons.queue)}
    </section>

    <section class="question-band">
      <div>
        <p class="eyebrow">${escapeHtml(t("overview.questionLabel"))}</p>
        <h3>${escapeHtml(t("overview.mainQuestionText"))}</h3>
      </div>
      <div class="evidence-chain">
        ${t("overview.pipeline").split("→").slice(0, 4).map((item) => `<span>${escapeHtml(item.trim())}</span>`).join("")}
      </div>
    </section>

    <section class="explainer-grid">
      ${explainCard(t("overview.whatTitle"), t("overview.whatText"))}
      ${explainCard(t("overview.whyTitle"), t("overview.whyText"))}
      ${explainCard(t("overview.sourceTitle"), t("overview.sourceText"))}
      <article class="explain-card">
        <span>${escapeHtml(t("overview.fixTitle"))}</span>
        <p>${escapeHtml(t("overview.fixText"))}</p>
        <div class="tag-list">
          ${topViolations.map((item) => `<code>${escapeHtml(item.type)}</code><strong>${formatNumber(item.count)}</strong>`).join("")}
        </div>
      </article>
    </section>

    <section class="two-column">
      <div class="panel">
        <div class="panel-heading">
          <span class="card-label">${escapeHtml(t("overview.scenarioTitle"))}</span>
          <h3>${escapeHtml(t("overview.scenarioSubtitle"))}</h3>
        </div>
        ${Object.entries(metrics.scenario_counts).map(([scenario, count]) => barRow(labelForScenario(scenario), count, metrics.records.conversations)).join("")}
      </div>
      <div class="panel">
        <div class="panel-heading">
          <span class="card-label">${escapeHtml(t("overview.signalsTitle"))}</span>
          <h3>${escapeHtml(t("overview.signalsSubtitle"))}</h3>
        </div>
        ${violationSummary
          .filter((item) => item.count > 0)
          .sort((left, right) => right.count - left.count)
          .slice(0, 6)
          .map((item) => barRow(labelForViolation(item.type), item.count, metrics.violations_total, item.severity))
          .join("")}
      </div>
    </section>
  `;
}

function renderFunnel() {
  const { funnel } = state.model;
  return `
    <section class="panel">
      <div class="panel-heading">
        <span class="card-label">${escapeHtml(t("funnel.title"))}</span>
        <h3>${escapeHtml(t("funnel.subtitle"))}</h3>
      </div>
      <div class="funnel-overview">
        ${funnel.totals.steps.map((step) => funnelStep(step, funnel.totals.total)).join("")}
      </div>
    </section>

    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(t("funnel.scenario"))}</th>
              <th>${escapeHtml(t("funnel.total"))}</th>
              <th>${escapeHtml(t("funnel.intent"))}</th>
              <th>${escapeHtml(t("funnel.fields"))}</th>
              <th>${escapeHtml(t("funnel.requiredReady"))}</th>
              <th>${escapeHtml(t("funnel.handoffReady"))}</th>
              <th>${escapeHtml(t("funnel.handoffSent"))}</th>
              <th>${escapeHtml(t("funnel.closedCorrectly"))}</th>
            </tr>
          </thead>
          <tbody>
            ${funnel.rows.map((row) => `
              <tr>
                <td><strong>${escapeHtml(labelForScenario(row.scenario))}</strong><br><code>${escapeHtml(row.scenario)}</code></td>
                <td>${formatNumber(row.total)}</td>
                <td>${countWithRate(row.intent_detected, row.total)}</td>
                <td>${countWithRate(row.field_collected, row.total)}</td>
                <td>${countWithRate(row.required_fields_ready, row.total)}</td>
                <td>${countWithRate(row.handoff_ready, row.total)}</td>
                <td>${countWithRate(row.handoff_sent, row.total)}</td>
                <td>${countWithRate(row.closed_correctly, row.total)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderViolations() {
  const { metrics, violationSummary } = state.model;
  const high = metrics.violations_by_severity.high || 0;
  const medium = metrics.violations_by_severity.medium || 0;

  return `
    <section class="metric-grid compact">
      ${metricCard(t("violations.total"), metrics.violations_total, t("violations.totalHint"))}
      ${metricCard(t("violations.high"), high, t("violations.highHint"), "danger")}
      ${metricCard(t("violations.medium"), medium, t("violations.mediumHint"), "warn")}
      ${metricCard(t("violations.review"), metrics.review_conversations_count, t("violations.reviewHint"))}
    </section>

    <section class="panel">
      <div class="panel-heading">
        <span class="card-label">${escapeHtml(t("violations.title"))}</span>
        <h3>${escapeHtml(t("violations.subtitle"))}</h3>
      </div>
      <div class="violation-list">
        ${violationSummary.map((item) => `
          <article class="violation-item">
            <div>
              <span class="severity ${item.severity}">${escapeHtml(labelForSeverity(item.severity))}</span>
              <h4>${escapeHtml(labelForViolation(item.type))}</h4>
              <code>${escapeHtml(item.type)}</code>
              <p>${escapeHtml(fixForViolation(item.type))}</p>
            </div>
            <strong>${formatNumber(item.count)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderReviewQueue() {
  const rows = getFilteredReviewRows();
  const selectedRow = rows.find((row) => reviewKey(row) === state.selectedReviewKey) || rows[0] || null;
  const selected = selectedRow ? state.model.conversationDetails[selectedRow.conversation_id] : null;

  return `
    <section class="panel">
      <div class="panel-heading row-heading">
        <div>
          <span class="card-label">${escapeHtml(t("review.title"))}</span>
          <h3>${escapeHtml(t("review.subtitle"))}</h3>
        </div>
        <span class="data-pill">${formatNumber(rows.length)} ${escapeHtml(t("review.rows"))}</span>
      </div>
      <div class="filters">
        <input data-review-search type="search" placeholder="${escapeHtml(t("review.search"))}" value="${escapeHtml(state.reviewSearch)}">
        <select data-review-type>
          <option value="all">${escapeHtml(t("review.allTypes"))}</option>
          ${violationTypes.map((type) => `<option value="${type}" ${state.reviewType === type ? "selected" : ""}>${escapeHtml(labelForViolation(type))}</option>`).join("")}
        </select>
        <select data-review-severity>
          <option value="all">${escapeHtml(t("review.allSeverities"))}</option>
          <option value="high" ${state.reviewSeverity === "high" ? "selected" : ""}>${escapeHtml(labelForSeverity("high"))}</option>
          <option value="medium" ${state.reviewSeverity === "medium" ? "selected" : ""}>${escapeHtml(labelForSeverity("medium"))}</option>
        </select>
      </div>
      <div class="table-wrap review-table">
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(t("review.conversation"))}</th>
              <th>${escapeHtml(t("review.scenario"))}</th>
              <th>${escapeHtml(t("review.violation"))}</th>
              <th>${escapeHtml(t("review.severity"))}</th>
              <th>${escapeHtml(t("review.evidence"))}</th>
              <th>${escapeHtml(t("review.suggestedFix"))}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => {
              const key = reviewKey(row);
              return `
                <tr data-review-key="${escapeHtml(encodeURIComponent(key))}" class="${selectedRow && key === reviewKey(selectedRow) ? "selected" : ""}">
                  <td><strong>${escapeHtml(row.conversation_id)}</strong><br><span>${escapeHtml(row.channel)}</span></td>
                  <td>${escapeHtml(labelForScenario(row.scenario))}<br><code>${escapeHtml(row.scenario)}</code></td>
                  <td>${escapeHtml(labelForViolation(row.violation_type))}<br><code>${escapeHtml(row.violation_type)}</code></td>
                  <td><span class="severity ${row.severity}">${escapeHtml(labelForSeverity(row.severity))}</span></td>
                  <td>${escapeHtml(labelForEvidence(row.evidence))}</td>
                  <td>${escapeHtml(fixForViolation(row.violation_type))}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${selected && selectedRow ? renderConversationDetail(selected, selectedRow) : ""}
  `;
}

function renderBacklog() {
  return `
    <section class="panel">
      <div class="panel-heading">
        <span class="card-label">${escapeHtml(t("backlog.title"))}</span>
        <h3>${escapeHtml(t("backlog.subtitle"))}</h3>
      </div>
      <div class="hypothesis-grid">
        ${state.hypotheses.map((item) => `
          <article class="hypothesis-card">
            <div class="card-kicker">
              <span>${escapeHtml(item.hypothesis_id)}</span>
              <strong>${formatNumber(item.pattern_count)} ${escapeHtml(t("backlog.signals"))}</strong>
            </div>
            <h4>${escapeHtml(hypothesisText(item, "title"))}</h4>
            <div class="technical-pattern">
              <span>${escapeHtml(t("backlog.technicalPattern"))}</span>
              <code>${escapeHtml(item.technical_labels || item.problem)}</code>
            </div>
            <div class="ab-copy">
              ${abRow(t("backlog.problem"), hypothesisText(item, "problem"))}
              ${abRow(t("backlog.hypothesis"), hypothesisText(item, "hypothesis"), "section_hypothesis.png")}
            </div>
            <div class="test-pair">
              <div>
                <span class="section-title-with-icon">${iconImg("inline-section-icon", "section_test_ab.png")}${escapeHtml(t("backlog.testA"))}</span>
                <p>${escapeHtml(hypothesisText(item, "testA", "test_a"))}</p>
              </div>
              <div>
                <span class="section-title-with-icon">${iconImg("inline-section-icon", "section_test_ab.png")}${escapeHtml(t("backlog.testB"))}</span>
                <p>${escapeHtml(hypothesisText(item, "testB", "test_b"))}</p>
              </div>
            </div>
            <footer>
              <span><span class="section-title-with-icon">${iconImg("inline-section-icon", "section_metric.png")}<strong>${escapeHtml(t("backlog.metric"))}</strong></span> ${escapeHtml(hypothesisText(item, "metric", "success_metric"))}</span>
              <span><span class="section-title-with-icon">${iconImg("inline-section-icon", "section_impact.png")}<strong>${escapeHtml(t("backlog.impact"))}</strong></span> ${escapeHtml(hypothesisText(item, "impact", "expected_impact"))}</span>
            </footer>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDataUpload() {
  const currentSource = state.dataSource === "uploaded" ? t("upload.currentUploaded") : t("upload.currentPrepared");
  const missingFiles = getMissingRequiredUploadFiles();
  const canAnalyze = missingFiles.length === 0;
  return `
    <section class="qa-explainer upload-source">
      <span class="mini-badge mini-badge--green">${escapeHtml(currentSource)}</span>
      <p>${escapeHtml(t("page.upload.subtitle"))}</p>
    </section>

    <section class="panel upload-panel">
      <div class="panel-heading row-heading">
        <div>
          <span class="card-label">${escapeHtml(t("upload.requiredTitle"))}</span>
          <h3>${escapeHtml(t("upload.requiredHint"))}</h3>
        </div>
        <div class="upload-actions">
          <button class="action-button action-button--ghost" data-use-prepared>${escapeHtml(t("upload.usePrepared"))}</button>
          <label class="action-button action-button--secondary">
            ${escapeHtml(t("upload.uploadFiles"))}
            <input data-upload-files type="file" multiple accept=".csv,.json">
          </label>
          <button class="action-button action-button--primary" data-analyze-uploaded ${canAnalyze ? "" : "disabled"}>
            ${escapeHtml(t("upload.analyze"))}
          </button>
          <button class="action-button action-button--ghost" data-clear-uploaded>${escapeHtml(t("upload.clear"))}</button>
        </div>
      </div>

      ${renderUploadNotice()}

      <div class="upload-file-grid">
        <div class="upload-file-group">
          <div class="upload-file-group-heading">
            <strong>${escapeHtml(t("upload.requiredTitle"))}</strong>
            <span>${escapeHtml(t("upload.requiredHint"))}</span>
          </div>
          ${requiredUploadFiles.map((file) => uploadFileRow(file, true)).join("")}
        </div>
        <div class="upload-file-group">
          <div class="upload-file-group-heading">
            <strong>${escapeHtml(t("upload.optionalTitle"))}</strong>
            <span>${escapeHtml(t("upload.optionalHint"))}</span>
          </div>
          ${optionalUploadFiles.map((file) => uploadFileRow(file, false)).join("")}
        </div>
      </div>
    </section>

    ${state.dataSource === "uploaded" ? renderUploadedCounts() : ""}
  `;
}

function renderReadiness() {
  const readiness = state.model.dataReadiness;
  return `
    <section class="metric-grid compact">
      ${Object.entries(readiness.files_loaded).map(([name, count]) => metricCard(labelForFile(name), count, t("readiness.fileHint"))).join("")}
    </section>

    <section class="qa-explainer">
      <span class="mini-badge mini-badge--green">${escapeHtml(t("readiness.qaBadge"))}</span>
      <p>${escapeHtml(t("readiness.subtitle"))}</p>
    </section>

    <section class="two-column">
      <div class="panel">
        <div class="panel-heading">
          <span class="card-label">${escapeHtml(t("readiness.title"))}</span>
          <h3>${escapeHtml(t("readiness.subtitle"))}</h3>
        </div>
        ${barRow(t("readiness.requestsCovered"), readiness.request_coverage_count, readiness.files_loaded.conversations)}
        ${barRow(t("readiness.uniqueHandoffs"), readiness.handoff_unique_conversations, readiness.files_loaded.conversations)}
        ${readiness.missing_contracts.length
          ? `<p class="warning-text">${escapeHtml(t("readiness.missingContracts", { items: readiness.missing_contracts.join(", ") }))}</p>`
          : `<p class="ok-text">${escapeHtml(t("readiness.allContracts"))}</p>`}
      </div>
      <div class="panel">
        <div class="panel-heading">
          <span class="card-label">${escapeHtml(t("readiness.eventsTitle"))}</span>
          <h3>${escapeHtml(t("readiness.eventsSubtitle"))}</h3>
        </div>
        ${Object.entries(readiness.event_counts)
          .sort((left, right) => right[1] - left[1])
          .slice(0, 10)
          .map(([type, count]) => barRow(labelForEventType(type), count, readiness.files_loaded.bot_events))
          .join("")}
      </div>
    </section>

    ${state.comparison ? `
      <section class="panel qa-panel">
        <div class="panel-heading">
          <span class="card-label">${escapeHtml(t("readiness.qaTitle"))}</span>
          <h3>${escapeHtml(t("readiness.qaSubtitle"))}</h3>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>${escapeHtml(t("readiness.metric"))}</th>
                <th>${escapeHtml(t("readiness.actual"))}</th>
                <th>${escapeHtml(t("readiness.expected"))}</th>
                <th>${escapeHtml(t("readiness.delta"))}</th>
                <th>${escapeHtml(t("readiness.status"))}</th>
              </tr>
            </thead>
            <tbody>
              ${state.comparison.rows.map((row) => `
                <tr>
                  <td><code>${escapeHtml(row.metric)}</code></td>
                  <td>${escapeHtml(row.actual)}</td>
                  <td>${escapeHtml(row.expected)}</td>
                  <td>${row.delta ?? ""}</td>
                  <td><span class="status ${row.status}">${escapeHtml(labelForStatus(row.status))}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    ` : ""}
  `;
}

function renderUploadNotice() {
  if (state.uploadError === "missing") {
    return `<p class="warning-text">${escapeHtml(t("upload.missingRequired"))}</p>`;
  }
  if (state.uploadError === "analysis") {
    return `<p class="warning-text">${escapeHtml(t("upload.analysisFailed", { error: state.uploadErrorDetail || t("review.notAvailable") }))}</p>`;
  }
  if (state.uploadStatus === "success") {
    return `<p class="ok-text">${escapeHtml(t("upload.success"))}</p>`;
  }
  if (state.uploadStatus === "prepared") {
    return `<p class="ok-text">${escapeHtml(t("upload.preparedRestored"))}</p>`;
  }
  if (state.uploadStatus === "ready") {
    return `<p class="ok-text">${escapeHtml(t("upload.ready", { count: Object.keys(state.uploadedFiles).length }))}</p>`;
  }
  return "";
}

function uploadFileRow(file, required) {
  const uploaded = state.uploadedFiles[file.name];
  const status = uploaded ? "loaded" : required ? "missing" : "optional";
  const count = uploaded ? uploadFileCount(file) : "";
  return `
    <div class="upload-file-row">
      <div>
        <code>${escapeHtml(file.name)}</code>
      </div>
      <span class="upload-status ${status}">${escapeHtml(t(`upload.${status}`))}</span>
      <strong>${count === "" ? "-" : formatNumber(count)}</strong>
    </div>
  `;
}

function renderUploadedCounts() {
  return `
    <section class="panel upload-counts">
      <div class="panel-heading">
        <span class="card-label">${escapeHtml(t("upload.loadedCountsTitle"))}</span>
        <h3>${escapeHtml(t("upload.loadedCountsSubtitle"))}</h3>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${escapeHtml(t("upload.file"))}</th>
              <th>${escapeHtml(t("upload.rows"))}</th>
              <th>${escapeHtml(t("upload.status"))}</th>
            </tr>
          </thead>
          <tbody>
            ${[...requiredUploadFiles, ...optionalUploadFiles]
              .filter((file) => state.uploadedFiles[file.name])
              .map((file) => `
                <tr>
                  <td><code>${escapeHtml(file.name)}</code></td>
                  <td>${formatNumber(uploadFileCount(file))}</td>
                  <td><span class="upload-status loaded">${escapeHtml(t("upload.loaded"))}</span></td>
                </tr>
              `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function getFilteredReviewRows() {
  const search = state.reviewSearch.trim().toLowerCase();
  return state.model.reviewQueue.filter((row) => {
    const matchesType = state.reviewType === "all" || row.violation_type === state.reviewType;
    const matchesSeverity = state.reviewSeverity === "all" || row.severity === state.reviewSeverity;
    const haystack = `${row.conversation_id} ${row.scenario} ${row.violation_type} ${row.evidence} ${row.suggested_fix}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    return matchesType && matchesSeverity && matchesSearch;
  });
}

function renderConversationDetail(detail, selectedRow) {
  const relatedViolations = state.model.reviewQueue.filter((row) => row.conversation_id === selectedRow.conversation_id);
  const messages = detail.messages.slice(0, 14);
  const events = detail.events.filter((event) => [
    "intent_detected",
    "scenario_selected",
    "field_collected",
    "fallback_triggered",
    "question_asked",
    "handoff_ready",
    "handoff_sent",
    "bot_replied_after_handoff",
    "bot_claims_cancel_completed",
    "new_service_intent_detected",
    "request_closed"
  ].includes(event.event_type));

  return `
    <section class="panel detail-panel">
      <div class="panel-heading">
        <span class="card-label">${escapeHtml(t("review.detailsTitle", { id: selectedRow.conversation_id }))}</span>
        <h3>${escapeHtml(t("review.detailsSubtitle", {
          scenario: labelForScenario(detail.conversation.scenario),
          state: detail.conversation.final_state
        }))}</h3>
      </div>
      <div class="review-detail-hero">
        <div>
          <span class="severity ${selectedRow.severity}">${escapeHtml(labelForSeverity(selectedRow.severity))}</span>
          <h4>${escapeHtml(t("review.selectedFinding"))}: ${escapeHtml(labelForViolation(selectedRow.violation_type))}</h4>
          <p>${escapeHtml(labelForEvidence(selectedRow.evidence))}</p>
        </div>
        <div class="rule-box">
          <span>${escapeHtml(t("review.relatedRule"))}</span>
          <p>${escapeHtml(contractRuleFor(selectedRow, detail))}</p>
          <small>${escapeHtml(t("review.generatedNote"))}</small>
        </div>
      </div>
      <div class="detail-grid">
        <div>
          <h4>${escapeHtml(t("review.contractFindings"))}</h4>
          <ul class="compact-list">
            ${relatedViolations.map((row) => `
              <li>
                <strong>${escapeHtml(labelForViolation(row.violation_type))}</strong>
                <code>${escapeHtml(row.violation_type)}</code>
                <span>${escapeHtml(labelForEvidence(row.evidence))}</span>
              </li>
            `).join("")}
          </ul>
          <h4>${escapeHtml(t("review.requestSnapshot"))}</h4>
          <dl class="snapshot">
            <dt>${escapeHtml(t("review.service"))}</dt><dd>${escapeHtml(detail.request?.service || t("review.notAvailable"))}</dd>
            <dt>${escapeHtml(t("review.missingFields"))}</dt><dd>${escapeHtml(detail.request?.missing_fields || t("review.none"))}</dd>
            <dt>handoff_ready</dt><dd>${escapeHtml(detail.request?.handoff_ready || t("review.notAvailable"))}</dd>
            <dt>handoff_sent</dt><dd>${escapeHtml(detail.request?.handoff_sent || t("review.notAvailable"))}</dd>
          </dl>
        </div>
        <div>
          <h4>${escapeHtml(t("review.eventEvidence"))}</h4>
          <ul class="timeline">
            ${events.map((event) => `
              <li>
                <time>${escapeHtml(event.timestamp)}</time>
                <strong>${escapeHtml(event.event_type)}</strong>
                <span>${escapeHtml(JSON.stringify(event.payload_json))}</span>
              </li>
            `).join("")}
          </ul>
        </div>
        <div>
          <h4>${escapeHtml(t("review.messageContext"))}</h4>
          <ul class="messages">
            ${messages.map((message) => `
              <li class="${escapeHtml(message.direction)}">
                <span>${escapeHtml(message.sender_type)}</span>
                <p>${escapeHtml(message.text)}</p>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function buildFallbackHypotheses(violations) {
  const counts = violationTypes.reduce((acc, type) => {
    acc[type] = violations.filter((violation) => violation.violation_type === type).length;
    return acc;
  }, {});
  return [
    {
      hypothesis_id: "ab_auto_001",
      problem: "missing_required_field / early_handoff",
      hypothesis: "Blocking handoff until required fields are collected should reduce incomplete manager transfers.",
      test_a: "Current flow.",
      test_b: "Hard gate handoff_ready on required contract fields.",
      metric: "handoff completeness rate",
      expected_impact: "fewer incomplete handoffs",
      pattern_count: (counts.missing_required_field || 0) + (counts.early_handoff || 0)
    }
  ];
}

function renderPipelineSteps() {
  return t("overview.pipeline").split("→").map((item, index) => {
    return `<span>${iconImg("inline-section-icon", pipelineIconFiles[index])}${escapeHtml(item.trim())}</span>`;
  }).join("");
}

function iconImg(className, iconFile) {
  if (!iconFile) {
    return "";
  }
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(`${iconBasePath}${iconFile}`)}" alt="" aria-hidden="true">`;
}

function metricCard(label, value, meta, tone = "", iconFile = "") {
  const title = iconFile
    ? `<div class="section-title-with-icon">${iconImg("kpi-icon", iconFile)}<span>${escapeHtml(label)}</span></div>`
    : `<span>${escapeHtml(label)}</span>`;
  return `
    <article class="metric-card ${tone}">
      ${title}
      <strong>${formatNumber(value)}</strong>
      <p>${escapeHtml(meta)}</p>
    </article>
  `;
}

function explainCard(title, text) {
  return `
    <article class="explain-card">
      <span>${escapeHtml(title)}</span>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function abRow(label, text, iconFile = "") {
  const title = iconFile
    ? `<span class="section-title-with-icon">${iconImg("inline-section-icon", iconFile)}${escapeHtml(label)}</span>`
    : `<span>${escapeHtml(label)}</span>`;
  return `
    <div class="ab-row">
      ${title}
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function barRow(label, value, max, severity = "") {
  const rate = max ? Math.round((value / max) * 100) : 0;
  return `
    <div class="bar-row">
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${formatNumber(value)}</strong>
      </div>
      <div class="bar-track"><span class="${severity}" style="width:${Math.min(rate, 100)}%"></span></div>
    </div>
  `;
}

function funnelStep(step, total) {
  return `
    <article class="funnel-step">
      <span>${escapeHtml(t(`funnel.${step.id}`))}</span>
      <strong>${formatNumber(step.count)}</strong>
      <div class="bar-track"><span style="width:${Math.min(pct(step.count, total), 100)}%"></span></div>
      <small>${pct(step.count, total)}%</small>
    </article>
  `;
}

function countWithRate(value, total) {
  return `<strong>${formatNumber(value)}</strong><br><span>${pct(value, total)}%</span>`;
}

function formatNumber(value) {
  if (typeof value === "number") {
    return new Intl.NumberFormat(state.language === "ru" ? "ru-RU" : "en-US").format(value);
  }
  return escapeHtml(String(value ?? ""));
}

function pct(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function typeLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function t(key, vars = {}) {
  const text = translations[state.language]?.[key] ?? translations.en[key] ?? key;
  return Object.entries(vars).reduce((current, [name, value]) => {
    return current.replaceAll(`{${name}}`, String(value));
  }, text);
}

function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    return saved === "ru" ? "ru" : "en";
  } catch {
    return "en";
  }
}

function setLanguage(language) {
  state.language = language === "ru" ? "ru" : "en";
  try {
    localStorage.setItem(languageStorageKey, state.language);
  } catch {
    // Local storage can be blocked on some file:// contexts; the UI still switches for the session.
  }
  render();
}

function reviewKey(row) {
  return `${row.conversation_id}|${row.violation_type}|${row.evidence}`;
}

function labelForScenario(scenario) {
  return t(`scenario.${scenario}`) || typeLabel(scenario);
}

function labelForViolation(type) {
  return t(`violation.${type}`) || typeLabel(type);
}

function labelForSeverity(severity) {
  return t(`severity.${severity}`) || typeLabel(severity);
}

function labelForStatus(status) {
  return t(`status.${status}`) || typeLabel(status);
}

function labelForFile(name) {
  return t(`file.${name}`) || typeLabel(name);
}

function labelForEventType(type) {
  return t(`event.${type}`) || typeLabel(type);
}

function fixForViolation(type) {
  return t(`fix.${type}`) || typeLabel(type);
}

function labelForEvidence(evidence) {
  if (state.language !== "ru") {
    return evidence;
  }

  const direct = {
    "2 handoff_sent events in one request": "В одной заявке зафиксировано 2 события handoff_sent.",
    "3 fallback_triggered events": "Зафиксировано 3 события fallback_triggered.",
    "bot replied after handoff without opening/resetting request": "Бот продолжил старую заявку после передачи менеджеру.",
    "cancel/reschedule was handled as completed without manager confirmation": "Отмена или перенос были обработаны как завершённые без подтверждения менеджера.",
    "general question produced handoff without commercial intent": "Общий вопрос привёл к handoff без коммерческого intent.",
    "new service intent was attached to an already handed off request": "Новая услуга была привязана к уже переданной заявке.",
    "phone was requested twice in the same active request": "Телефон был запрошен дважды в одной активной заявке."
  };
  if (direct[evidence]) {
    return direct[evidence];
  }

  const beforeRequiredMatch = evidence.match(/^handoff_sent before required fields were collected: (.+)$/);
  if (beforeRequiredMatch) {
    return `Передача менеджеру произошла до сбора обязательного поля: ${beforeRequiredMatch[1]}.`;
  }

  const missingRequiredMatch = evidence.match(/^handoff_sent while missing required fields: (.+)$/);
  if (missingRequiredMatch) {
    return `Заявка передана менеджеру без обязательного поля: ${missingRequiredMatch[1]}.`;
  }

  const wrongServiceMatch = evidence.match(/^LLM\/service field collected as (.+), expected\/request service is (.+)$/);
  if (wrongServiceMatch) {
    return `Поле LLM/service собрано как ${wrongServiceMatch[1]}, а ожидаемая услуга в заявке: ${wrongServiceMatch[2]}.`;
  }

  return evidence;
}

function contractRuleFor(row, detail) {
  const base = t(`rule.${row.violation_type}`);
  const requiredFields = state.model.data.contracts.scenarios?.[detail.conversation.scenario]?.required_fields_before_handoff || [];
  if ((row.violation_type === "missing_required_field" || row.violation_type === "early_handoff") && requiredFields.length) {
    return `${base} required_fields_before_handoff: ${requiredFields.join(", ")}.`;
  }
  return base;
}

function hypothesisText(item, field, fallbackField = field) {
  if (state.language === "en" && (item[fallbackField] || item[field])) {
    return item[fallbackField] || item[field];
  }
  const translated = translations[state.language]?.[`ab.${item.hypothesis_id}.${field}`];
  if (translated) {
    return translated;
  }
  return item[fallbackField] || item[field] || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
