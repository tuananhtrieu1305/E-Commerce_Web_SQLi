import { execFile } from "node:child_process";

function normalizeTail(tail) {
  const parsed = Number(tail);
  if (!Number.isFinite(parsed)) {
    return 80;
  }

  return Math.min(Math.max(Math.trunc(parsed), 1), 500);
}

function normalizeDockerError(error) {
  const message = String(error?.message ?? "Unable to read Docker logs");
  if (/No such container/i.test(message)) {
    return "Container is not available. Start Docker Compose before collecting log evidence.";
  }
  if (/permission denied|access is denied/i.test(message)) {
    return "Docker denied access to container logs.";
  }
  return message;
}

export async function readContainerLogs({ containerName, tail = 80 }) {
  return new Promise((resolve) => {
    execFile("docker", ["logs", containerName, "--tail", String(normalizeTail(tail))], {
      timeout: 8000,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          containerName,
          logs: "",
          error: normalizeDockerError(error),
        });
        return;
      }

      resolve({
        ok: true,
        containerName,
        logs: [stdout, stderr].filter(Boolean).join("\n"),
        error: null,
      });
    });
  });
}
