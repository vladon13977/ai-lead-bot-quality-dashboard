import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDashboardModel,
  compareMetrics,
  inputFilePaths,
  qaFilePaths
} from "../src/lib/dataCore.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");

await build();

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await copyFile(path.join(rootDir, "index.html"), path.join(distDir, "index.html"));
  await copyDirectory(path.join(rootDir, "src"), path.join(distDir, "src"));
  await copyDirectory(path.join(rootDir, "assets"), path.join(distDir, "assets"));
  await copyDirectory(path.join(rootDir, "data", "input"), path.join(distDir, "data", "input"));
  await mkdir(path.join(distDir, "data", "expected"), { recursive: true });
  await copyFile(path.join(rootDir, qaFilePaths.expectedMetricsJson), path.join(distDir, qaFilePaths.expectedMetricsJson));
  await copyFile(path.join(rootDir, qaFilePaths.abHypothesesCsv), path.join(distDir, qaFilePaths.abHypothesesCsv));

  const inputTexts = {};
  for (const [key, relativePath] of Object.entries(inputFilePaths)) {
    inputTexts[key] = await readFile(path.join(rootDir, relativePath), "utf8");
  }

  const model = buildDashboardModel(inputTexts);
  const expectedMetrics = JSON.parse(await readFile(path.join(rootDir, qaFilePaths.expectedMetricsJson), "utf8"));
  const comparison = compareMetrics(model.metrics, expectedMetrics, {
    tolerances: {
      complete_handoff_count: 2
    }
  });

  const report = {
    generated_at: new Date().toISOString(),
    passed: comparison.passed,
    note: "Expected files are used only for build-time QA comparison, not for dashboard analytics.",
    actual_metrics: model.metrics,
    comparison: comparison.rows
  };
  await writeFile(path.join(distDir, "validation-report.json"), `${JSON.stringify(report, null, 2)}\n`);

  printSummary(model.metrics, comparison);

  if (!comparison.passed) {
    process.exitCode = 1;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await copyFile(sourcePath, targetPath);
    }
  }
}

function printSummary(metrics, comparison) {
  console.log("AI Lead Bot Quality Dashboard build");
  console.log("-----------------------------------");
  console.log(`conversations: ${metrics.records.conversations}`);
  console.log(`messages: ${metrics.records.messages}`);
  console.log(`bot_events: ${metrics.records.bot_events}`);
  console.log(`requests: ${metrics.records.requests}`);
  console.log(`handoffs: ${metrics.records.handoffs}`);
  console.log(`review conversations: ${metrics.review_conversations_count}`);
  console.log(`violations total: ${metrics.violations_total}`);
  console.log(`high severity violations: ${metrics.violations_by_severity.high}`);
  console.log(`medium severity violations: ${metrics.violations_by_severity.medium}`);
  console.log("");
  console.log("Expected vs actual:");
  for (const row of comparison.rows) {
    const delta = row.delta === null ? "" : ` delta=${row.delta}`;
    console.log(`${row.status.padEnd(16)} ${row.metric}: actual=${row.actual} expected=${row.expected}${delta}`);
  }
  console.log("");
  console.log(comparison.passed
    ? "Validation passed. dist/validation-report.json was written."
    : "Validation failed. See dist/validation-report.json for differences.");
}
