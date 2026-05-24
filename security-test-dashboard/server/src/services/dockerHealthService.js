import { execFile } from "node:child_process";

function execFileJson(command, args, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr?.trim() || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function toContainerStatus(state) {
  if (!state?.Running) {
    return "DOWN";
  }

  if (state.Health?.Status === "unhealthy") {
    return "DOWN";
  }

  return "UP";
}

function toMessage(state) {
  if (state.Health?.Status) {
    return `health=${state.Health.Status}; state=${state.Status}`;
  }
  return `state=${state.Status ?? "unknown"}`;
}

function normalizeDockerError(message) {
  if (message.includes("Access is denied") || message.includes("docker_engine")) {
    return "Docker access denied. Run the helper with Docker privileges.";
  }
  if (message.includes("executable file not found") || message.includes("ENOENT")) {
    return "Docker CLI not found.";
  }
  if (message.includes("No such object") || message.includes("No such container")) {
    return "Container not found.";
  }
  return message;
}

export async function checkDockerContainer(container) {
  const startedAt = Date.now();

  try {
    const rawState = await execFileJson("docker", [
      "inspect",
      "--format",
      "{{json .State}}",
      container.name,
    ]);
    const state = JSON.parse(rawState);

    return {
      id: container.id,
      label: container.label,
      type: container.type,
      name: container.name,
      status: toContainerStatus(state),
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      message: toMessage(state),
      snippet: "",
    };
  } catch (error) {
    const isMissing = error.message.includes("No such object") || error.message.includes("No such container");

    return {
      id: container.id,
      label: container.label,
      type: container.type,
      name: container.name,
      status: isMissing ? "DOWN" : "UNKNOWN",
      statusCode: null,
      latencyMs: Date.now() - startedAt,
      message: normalizeDockerError(error.message),
      detail: error.message,
      snippet: "",
    };
  }
}
