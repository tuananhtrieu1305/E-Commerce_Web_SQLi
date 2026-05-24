function joinPath(prefix, path) {
  const normalizedPrefix = prefix?.endsWith("/") ? prefix.slice(0, -1) : (prefix ?? "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedPrefix}${normalizedPath}`;
}

export function buildTestUrl(target, testCase, payload) {
  const path = joinPath(target.apiPrefix, testCase.path);
  const url = new URL(path, target.url);

  if (testCase.method === "GET" && testCase.param) {
    url.searchParams.set(testCase.param, payload);
  }

  return url.toString();
}

