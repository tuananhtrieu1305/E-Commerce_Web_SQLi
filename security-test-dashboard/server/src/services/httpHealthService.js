function buildUrl(target) {
  return new URL(target.healthPath, target.url).toString();
}

function normalizeError(error) {
  if (error.name === "AbortError") {
    return "Request timed out";
  }
  if (error.cause?.code === "ECONNREFUSED") {
    return "Connection refused";
  }
  if (error.cause?.code === "ENOTFOUND") {
    return "Host not found";
  }
  return error.message ?? "HTTP check failed";
}

export async function checkHttpTarget(target) {
  const url = buildUrl(target);
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), target.timeoutMs ?? 2500);

  try {
    const result = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
      },
      signal: controller.signal,
    });
    const body = await result.text();
    const latencyMs = Date.now() - startedAt;

    return {
      id: target.id,
      label: target.label,
      type: target.type,
      url,
      status: result.ok ? "UP" : "DOWN",
      statusCode: result.status,
      latencyMs,
      message: result.ok ? "HTTP check passed" : result.statusText,
      snippet: body.slice(0, 160),
    };
  } catch (error) {
    return {
      id: target.id,
      label: target.label,
      type: target.type,
      url,
      status: "DOWN",
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      message: normalizeError(error),
      snippet: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}
