import { Router } from "express";
import { runDemoSuite } from "../services/demoRunnerService.js";

export const demoRouter = Router();

demoRouter.post("/run", async (request, response, next) => {
  try {
    response.json(await runDemoSuite({
      requestCount: request.body?.requestCount,
    }));
  } catch (error) {
    next(error);
  }
});
