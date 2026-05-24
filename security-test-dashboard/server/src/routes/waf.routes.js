import { Router } from "express";
import {
  getWafLogs,
  listWafScenarios,
  runFalseNegativeChecks,
  runFalsePositiveChecks,
  runWafScenario,
  runWafScenarios,
} from "../services/wafTestService.js";
import { addResults } from "../services/resultStore.js";

export const wafRouter = Router();

wafRouter.get("/scenarios", (_request, response) => {
  response.json({
    items: listWafScenarios(),
  });
});

wafRouter.get("/logs", async (request, response, next) => {
  try {
    response.json(await getWafLogs({ tail: request.query.tail }));
  } catch (error) {
    next(error);
  }
});

wafRouter.post("/test", async (request, response, next) => {
  try {
    if (request.body?.scenarioId) {
      const items = [await runWafScenario(request.body.scenarioId)];
      addResults(items, "WAF");
      response.json({
        items,
      });
      return;
    }

    const items = await runWafScenarios(request.body?.scenarioIds);
    addResults(items, "WAF");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});

wafRouter.post("/false-positive-test", async (_request, response, next) => {
  try {
    const items = await runFalsePositiveChecks();
    addResults(items, "WAF");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});

wafRouter.post("/false-negative-test", async (_request, response, next) => {
  try {
    const items = await runFalseNegativeChecks();
    addResults(items, "WAF");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});
