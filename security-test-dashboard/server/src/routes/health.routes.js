import { Router } from "express";
import { config } from "../config.js";
import { checkDockerContainer } from "../services/dockerHealthService.js";
import { checkHttpTarget } from "../services/httpHealthService.js";
import { summarizeChecks } from "../services/healthSummary.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response, next) => {
  try {
    const [services, containers] = await Promise.all([
      Promise.all(Object.values(config.targets).map((target) => checkHttpTarget(target))),
      Promise.all(Object.values(config.containers).map((container) => checkDockerContainer(container))),
    ]);
    const checks = [...services, ...containers];

    response.json({
      status: summarizeChecks(checks).overall,
      generatedAt: new Date().toISOString(),
      summary: summarizeChecks(checks),
      services,
      containers,
      checks,
    });
  } catch (error) {
    next(error);
  }
});
