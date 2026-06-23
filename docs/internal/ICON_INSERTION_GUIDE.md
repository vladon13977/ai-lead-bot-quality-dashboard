# Dashboard for Detail — icon insertion guide

## Что это
PNG-иконки для текущего dashboard `AI Lead Bot Quality`.

Стиль:
- прозрачный фон;
- 96×96 px;
- тонкая line-art графика;
- цвета под текущую тёмную систему: cyan / green / amber / red / blue;
- без декоративного шума.

## Куда положить

Рекомендуемый путь:

```text
/assets/icons/
```

Если текущий проект использует папку `src`, можно положить так:

```text
/src/assets/icons/
```

Главное — чтобы пути в `src/app.js` совпали с фактическим расположением.

## Где использовать

### Sidebar navigation

| Раздел | Иконка |
|---|---|
| Обзор | `nav_overview.png` |
| Воронка сценария | `nav_funnel.png` |
| Отклонения сценария | `nav_issues.png` |
| Диалоги на проверку | `nav_review_queue.png` |
| Гипотезы улучшений | `nav_ab_backlog.png` |
| Данные и проверка | `nav_data.png` |

Размер в сайдбаре:

```css
.nav-icon {
  width: 18px;
  height: 18px;
  opacity: 0.9;
  flex: 0 0 auto;
}
```

### Sidebar bottom card

`source_truth.png`

Использовать рядом с заголовком `Источник правды`.

### Overview KPI cards

| Карточка | Иконка |
|---|---|
| Всего диалогов | `kpi_total_dialogs.png` |
| Успешно / корректно закрыто | `kpi_success.png` |
| Handoff отправлен | `kpi_handoff.png` |
| Диалоги с проблемами | `kpi_issues.png` |
| Критичные проблемы | `kpi_critical.png` |
| Диалоги на проверку | `kpi_review.png` |

Размер:

```css
.kpi-icon {
  width: 28px;
  height: 28px;
}
```

### Pipeline / explanation block

| Шаг | Иконка |
|---|---|
| События | `section_events.png` |
| Правила сценария | `section_rules.png` |
| Проблемы | `section_problems.png` |
| Диалоги на проверку | `nav_review_queue.png` |
| Гипотезы улучшений | `section_hypothesis.png` |

### A/B backlog cards

| Блок | Иконка |
|---|---|
| Гипотеза | `section_hypothesis.png` |
| Тест A/B | `section_test_ab.png` |
| Метрика успеха | `section_metric.png` |
| Ожидаемый эффект | `section_impact.png` |

Размер:

```css
.inline-section-icon {
  width: 16px;
  height: 16px;
  opacity: 0.85;
}
```

## Важное правило

Не ставить иконки в каждую строку таблицы.  
Иконки нужны как навигация и смысловые якоря, а не как украшение.

## Как вставлять

Пример для sidebar:

```html
<img class="nav-icon" src="assets/icons/nav_overview.png" alt="" aria-hidden="true">
<span>Обзор</span>
```

Пример для KPI:

```html
<div class="kpi-card">
  <div class="kpi-card-top">
    <img class="kpi-icon" src="assets/icons/kpi_success.png" alt="" aria-hidden="true">
    <span>Успешно закрыто</span>
  </div>
  <strong>177</strong>
  <p>Без проблем, позитивный final state</p>
</div>
```

## Prompt для Codex

Скажи Codex:

```text
Use provided PNG icons from assets/icons. Do not draw new icons. Do not generate emoji icons. Insert icons only according to ICON_INSERTION_GUIDE.md and ICON_MANIFEST.json.
```
