const STATUS_LABELS = {
  "active": "Active",
  "inactive": "Inactive",
  "unknown": "Unknown"
};
const STATUS_ORDER = [
  "active",
  "inactive",
  "unknown"
];
const STATUS_SYMBOL_MAP = {
  "+": {
    "state": "active",
    "label": "Operational"
  },
  "P": {
    "state": "active",
    "label": "Partially Operational"
  },
  "B": {
    "state": "active",
    "label": "Backup"
  },
  "X": {
    "state": "active",
    "label": "Extended Mission"
  },
  "-": {
    "state": "inactive",
    "label": "Inactive"
  },
  "S": {
    "state": "inactive",
    "label": "Spare"
  },
  "D": {
    "state": "inactive",
    "label": "Decayed"
  },
  "?": {
    "state": "unknown",
    "label": "Unknown"
  }
};
const ACTIVE_KEYWORDS = [
  "active",
  "operational",
  "operating",
  "alive",
  "commissioned",
  "on-orbit",
  "in orbit"
];
const INACTIVE_KEYWORDS = [
  "inactive",
  "retired",
  "decommissioned",
  "decayed",
  "failed",
  "lost",
  "planned",
  "non-operational",
  "dead"
];
const PLACEHOLDER_TOKENS = new Set([
  "+",
  "-",
  "?",
  "n/a"
]);

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
