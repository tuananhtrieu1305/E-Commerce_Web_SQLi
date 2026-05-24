import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const results = [];
const maxResults = 500;
const storagePath = resolve(dirname(fileURLToPath(import.meta.url)), "../../data/results.json");
let lastPersistedAt = null;
let lastStorageError = null;

function normalizeCategory(category) {
  return String(category ?? "SQLI").toUpperCase();
}

function normalizeResult(item, category) {
  const normalizedCategory = normalizeCategory(item.category ?? category);
  const createdAt = item.createdAt ?? new Date().toISOString();

  return {
    ...item,
    category: normalizedCategory,
    evidenceId: item.evidenceId ?? `${normalizedCategory}-${item.id ?? "item"}-${createdAt}`,
    createdAt,
  };
}

function loadStoredResults() {
  if (!existsSync(storagePath)) {
    return;
  }

  try {
    const raw = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(raw);
    const storedResults = Array.isArray(parsed) ? parsed : parsed.results;

    if (!Array.isArray(storedResults)) {
      return;
    }

    results.unshift(...storedResults.slice(0, maxResults).map((item) => normalizeResult(item, item.category)));
    lastPersistedAt = parsed.updatedAt ?? null;
    lastStorageError = null;
  } catch (error) {
    lastStorageError = error.message ?? "Failed to load persisted evidence.";
  }
}

function persistResults() {
  try {
    mkdirSync(dirname(storagePath), { recursive: true });
    lastPersistedAt = new Date().toISOString();
    writeFileSync(storagePath, JSON.stringify({
      version: 1,
      updatedAt: lastPersistedAt,
      results,
    }, null, 2));
    lastStorageError = null;
  } catch (error) {
    lastStorageError = error.message ?? "Failed to persist evidence.";
  }
}

export function addResults(items, category = "SQLI") {
  results.unshift(...items.map((item) => normalizeResult(item, category)));
  if (results.length > maxResults) {
    results.length = maxResults;
  }
  persistResults();
}

export function listResults({ category } = {}) {
  const normalizedCategory = category ? normalizeCategory(category) : null;
  const filtered = normalizedCategory
    ? results.filter((item) => item.category === normalizedCategory)
    : results;

  return [...filtered];
}

export function clearResults({ category } = {}) {
  const normalizedCategory = category ? normalizeCategory(category) : null;
  if (!normalizedCategory) {
    results.length = 0;
    persistResults();
    return;
  }

  for (let index = results.length - 1; index >= 0; index -= 1) {
    if (results[index].category === normalizedCategory) {
      results.splice(index, 1);
    }
  }
  persistResults();
}

export function summarizeResults({ category } = {}) {
  const scopedResults = listResults({ category });
  const total = scopedResults.length;
  const passed = scopedResults.filter((item) => item.passed).length;
  const failed = total - passed;
  const blocked = scopedResults.filter((item) =>
    ["WAF_BLOCKED", "VALIDATION_BLOCKED", "DB_HARD_REJECTED"].includes(item.classification),
  ).length;
  const byCategory = scopedResults.reduce((accumulator, item) => {
    const current = accumulator[item.category] ?? { total: 0, passed: 0, failed: 0 };
    current.total += 1;
    if (item.passed) {
      current.passed += 1;
    } else {
      current.failed += 1;
    }
    accumulator[item.category] = current;
    return accumulator;
  }, {});

  return {
    total,
    passed,
    failed,
    blockRate: total === 0 ? 0 : Math.round((blocked / total) * 100),
    byCategory,
  };
}

export function buildMarkdownReport({ category } = {}) {
  const scopedResults = listResults({ category });
  const summary = summarizeResults({ category });
  const lines = [
    "# Security Test Evidence",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total checks: ${summary.total}`,
    `- Passed: ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    `- Block rate: ${summary.blockRate}%`,
    "",
    "## Results",
    "",
    "| Category | ID | Name | Classification | Pass | Reason |",
    "| --- | --- | --- | --- | --- | --- |",
  ];

  for (const item of scopedResults) {
    const reason = String(item.classificationReason ?? item.reason ?? "-").replace(/\|/g, "\\|");
    lines.push(`| ${item.category} | ${item.id ?? "-"} | ${item.name ?? "-"} | ${item.classification ?? "-"} | ${item.passed ? "Yes" : "No"} | ${reason} |`);
  }

  return `${lines.join("\n")}\n`;
}

export function getStorageStatus() {
  let fileSizeBytes = 0;
  let exists = false;

  try {
    exists = existsSync(storagePath);
    fileSizeBytes = exists ? statSync(storagePath).size : 0;
  } catch (error) {
    lastStorageError = error.message ?? "Failed to read evidence storage status.";
  }

  return {
    enabled: true,
    path: storagePath,
    exists,
    fileSizeBytes,
    resultCount: results.length,
    lastPersistedAt,
    error: lastStorageError,
  };
}

loadStoredResults();
