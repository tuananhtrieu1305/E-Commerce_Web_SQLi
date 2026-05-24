import { execFile } from "node:child_process";

function normalizeContainerError(error, stderr) {
  const message = String(stderr?.trim() || error?.message || "Container command failed");
  if (/No such container/i.test(message)) {
    return "Container is not available. Start Docker Compose before running this check.";
  }
  if (/is not running/i.test(message)) {
    return "Container is not running.";
  }
  if (/permission denied|access is denied/i.test(message)) {
    return "Docker denied access to execute inside the container.";
  }
  return message;
}

export async function runContainerCommand({ containerName, args, timeoutMs = 10000 }) {
  return new Promise((resolve) => {
    execFile("docker", ["exec", containerName, ...args], {
      timeout: timeoutMs,
      windowsHide: true,
    }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          ok: false,
          stdout: stdout?.trim() ?? "",
          stderr: stderr?.trim() ?? "",
          error: normalizeContainerError(error, stderr),
        });
        return;
      }

      resolve({
        ok: true,
        stdout: stdout?.trim() ?? "",
        stderr: stderr?.trim() ?? "",
        error: null,
      });
    });
  });
}
