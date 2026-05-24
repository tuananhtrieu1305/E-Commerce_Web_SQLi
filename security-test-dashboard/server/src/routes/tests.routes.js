import { Router } from "express";
import { payloads } from "../data/payloads.js";
import { testCases } from "../data/testCases.js";
import { addResults } from "../services/resultStore.js";
import { runAllTests, runTestAcrossTargets } from "../services/requestRunner.js";

export const testsRouter = Router();

testsRouter.get("/", (_request, response) => {
  response.json({
    items: testCases.map((testCase) => ({
      ...testCase,
      defaultPayload: payloads[testCase.payloadGroup]?.[0] ?? "",
    })),
  });
});

testsRouter.post("/run", async (request, response, next) => {
  try {
    const items = await runTestAcrossTargets({
      testId: request.body.testId,
      targetKeys: request.body.targetKey ? [request.body.targetKey] : request.body.targetKeys,
      payload: request.body.payload,
    });
    addResults(items);
    response.json({ items });
  } catch (error) {
    next(error);
  }
});

testsRouter.post("/run-all", async (request, response, next) => {
  try {
    const items = await runAllTests({
      targetKeys: request.body.targetKeys,
    });
    addResults(items);
    response.json({ items });
  } catch (error) {
    next(error);
  }
});
