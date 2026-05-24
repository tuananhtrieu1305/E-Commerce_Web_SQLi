import { Router } from "express";
import {
  getAuditLog,
  getRejectLog,
  listDbChecks,
  runAllDbChecks,
  runDbCheck,
} from "../services/databaseSecurityService.js";
import { addResults } from "../services/resultStore.js";

export const databaseRouter = Router();

databaseRouter.get("/checks", (_request, response) => {
  response.json({
    items: listDbChecks(),
  });
});

databaseRouter.post("/checks/run", async (request, response, next) => {
  try {
    if (request.body?.checkId) {
      const items = [await runDbCheck(request.body.checkId)];
      addResults(items, "DATABASE");
      response.json({
        items,
      });
      return;
    }

    const items = await runAllDbChecks();
    addResults(items, "DATABASE");
    response.json({
      items,
    });
  } catch (error) {
    next(error);
  }
});

databaseRouter.get("/audit-log", async (request, response, next) => {
  try {
    response.json({
      items: await getAuditLog(request.query.limit),
    });
  } catch (error) {
    next(error);
  }
});

databaseRouter.get("/reject-log", async (request, response, next) => {
  try {
    response.json({
      items: await getRejectLog(request.query.limit),
    });
  } catch (error) {
    next(error);
  }
});
