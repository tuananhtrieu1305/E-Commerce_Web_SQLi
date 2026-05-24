import { Router } from "express";
import {
  getLoadBalancerLogs,
  listLoadBalancerScenarios,
  runAllLoadBalancerScenarios,
  runLoadBalancerDistributionTest,
  runLoadBalancerHealthCheck,
  runLoadBalancerScenario,
} from "../services/loadBalancerService.js";
import { addResults } from "../services/resultStore.js";

export const loadBalancerRouter = Router();

loadBalancerRouter.get("/scenarios", (_request, response) => {
  response.json({
    items: listLoadBalancerScenarios(),
  });
});

loadBalancerRouter.get("/logs", async (request, response, next) => {
  try {
    response.json(await getLoadBalancerLogs({
      tail: request.query.tail,
      probeId: request.query.probeId,
    }));
  } catch (error) {
    next(error);
  }
});

loadBalancerRouter.post("/test", async (request, response, next) => {
  try {
    if (request.body?.scenarioId) {
      const items = [await runLoadBalancerScenario(request.body.scenarioId, {
        requestCount: request.body.requestCount,
      })];
      addResults(items, "LOAD_BALANCER");
      response.json({
        items,
      });
      return;
    }

    const items = await runAllLoadBalancerScenarios({
      requestCount: request.body?.requestCount,
    });
    addResults(items, "LOAD_BALANCER");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});

loadBalancerRouter.post("/health-check", async (_request, response, next) => {
  try {
    const items = [await runLoadBalancerHealthCheck()];
    addResults(items, "LOAD_BALANCER");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});

loadBalancerRouter.post("/distribution-test", async (request, response, next) => {
  try {
    const items = [await runLoadBalancerDistributionTest({
      requestCount: request.body?.requestCount,
    })];
    addResults(items, "LOAD_BALANCER");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});
