#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const statusUtils = require("../utils/status");

const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "public",
  "js",
  "utils",
  "status.js"
);

const { STATUS_LABELS, STATUS_ORDER } = statusUtils;

const fileContents = `const STATUS_LABELS = ${JSON.stringify(
  STATUS_LABELS,
  null,
  2
)};
const STATUS_ORDER = ${JSON.stringify(STATUS_ORDER, null, 2)};
const STATUS_SYMBOL_MAP = ${JSON.stringify(
  statusUtils.STATUS_SYMBOL_MAP,
  null,
  2
)};
const ACTIVE_KEYWORDS = ${JSON.stringify(
  statusUtils.ACTIVE_KEYWORDS,
  null,
  2
)};
const INACTIVE_KEYWORDS = ${JSON.stringify(
  statusUtils.INACTIVE_KEYWORDS,
  null,
  2
)};
const PLACEHOLDER_TOKENS = new Set(${JSON.stringify(
  Array.from(statusUtils.PLACEHOLDER_TOKENS),
  null,
  2
)});

function determineStatus(statusValue) {
  const base = { state: "unknown", label: "Unknown" };
  if (!statusValue) return base;

  const trimmed = String(statusValue).trim();
  if (!trimmed) return base;

  const normalized = trimmed.toLowerCase();
  const symbolMatch = STATUS_SYMBOL_MAP[trimmed.toUpperCase()];
  if (symbolMatch) {
    return symbolMatch;
  }
  if (normalized === "unknown") return base;

  if (ACTIVE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { state: "active", label: trimmed };
  }

  if (INACTIVE_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return { state: "inactive", label: trimmed };
  }

  return {
    state: "unknown",
    label: PLACEHOLDER_TOKENS.has(normalized) ? "Unknown" : trimmed,
  };
}

const STATUS_OPTIONS = STATUS_ORDER.map((state) => ({
  value: state,
  label: STATUS_LABELS[state] || state,
}));

export {
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_OPTIONS,
  determineStatus,
};

export default {
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_OPTIONS,
  determineStatus,
};
`;

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, fileContents, "utf8");
console.log(`[generate-status-client] Updated ${path.relative(process.cwd(), OUTPUT_PATH)}`);
