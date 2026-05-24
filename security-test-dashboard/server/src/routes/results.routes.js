import { Router } from "express";
import {
  buildMarkdownReport,
  clearResults,
  getStorageStatus,
  listResults,
  summarizeResults,
} from "../services/resultStore.js";

export const resultsRouter = Router();

resultsRouter.get("/summary", (_request, response) => {
  response.json(summarizeResults({
    category: _request.query.category,
  }));
});

resultsRouter.get("/evidence", (request, response) => {
  response.json({
    summary: summarizeResults({
      category: request.query.category,
    }),
    items: listResults({
      category: request.query.category,
    }),
  });
});

resultsRouter.get("/markdown", (request, response) => {
  response
    .type("text/markdown")
    .send(buildMarkdownReport({
      category: request.query.category,
    }));
});

resultsRouter.get("/storage", (_request, response) => {
  response.json(getStorageStatus());
});

resultsRouter.get("/", (request, response) => {
  response.json({
    items: listResults({
      category: request.query.category,
    }),
  });
});

resultsRouter.delete("/", (request, response) => {
  clearResults({
    category: request.query.category,
  });
  response.status(204).end();
});
