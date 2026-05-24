import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.routes.js";
import { testsRouter } from "./routes/tests.routes.js";
import { resultsRouter } from "./routes/results.routes.js";
import { wafRouter } from "./routes/waf.routes.js";
import { databaseRouter } from "./routes/database.routes.js";
import { loadBalancerRouter } from "./routes/loadbalancer.routes.js";
import { demoRouter } from "./routes/demo.routes.js";

const app = express();

app.use(
  cors({
    origin: config.allowedOrigins,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api", (_request, response) => {
  response.json({
    service: "security-test-dashboard-server",
    status: "UP",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/tests", testsRouter);
app.use("/api/results", resultsRouter);
app.use("/api/waf", wafRouter);
app.use("/api/db", databaseRouter);
app.use("/api/lb", loadBalancerRouter);
app.use("/api/demo", demoRouter);

app.use((error, _request, response, _next) => {
  response.status(error.statusCode ?? 500).json({
    message: error.message ?? "Internal server error",
  });
});

app.listen(config.port, () => {
  console.log(`Security test helper listening on http://localhost:${config.port}`);
});
