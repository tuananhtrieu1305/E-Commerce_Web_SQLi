export function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function extractRecordCount(payload) {
  if (!payload) {
    return 0;
  }

  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (Array.isArray(payload.data)) {
    return payload.data.length;
  }

  if (payload.data && typeof payload.data === "object") {
    return 1;
  }

  return 0;
}

export function buildSnippet(text, maxLength = 420) {
  return text.replace(/\s+/g, " ").slice(0, maxLength);
}

