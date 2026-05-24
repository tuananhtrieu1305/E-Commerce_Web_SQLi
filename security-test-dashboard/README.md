# Security Test Dashboard

Local-only dashboard for testing the E-Commerce Web SQLi lab.

## Services

- Client: `http://localhost:5174`
- Node helper API: `http://localhost:9090`

## Run

Install dependencies once:

```powershell
cd security-test-dashboard\server
npm.cmd install
```

```powershell
cd security-test-dashboard\client
npm.cmd install
```

Start the helper API:

```powershell
cd security-test-dashboard\server
npm.cmd run dev
```

Start the React client:

```powershell
cd security-test-dashboard\client
npm.cmd run dev
```

## Demo Flow

1. Start the project stack from the repository root:

```powershell
docker compose up -d
```

2. Open `http://localhost:5174`.
3. Use the Dashboard tab to check HTTP targets and Docker containers.
4. Click `Run demo suite` for a quick evidence run across:
   - SQL Injection before/after checks
   - WAF false positive and false negative checks
   - Database masking, least privilege, and hard-reject checks
   - Load Balancer health and distribution checks
5. Open the Evidence tab to review all collected records.
6. Click `Markdown` in Evidence to export a report-ready summary.

## Evidence Tabs

- SQLi: endpoint and payload test results, including baseline-aware classification.
- WAF: HTTP 403 checks plus parsed ModSecurity/OWASP CRS rule IDs.
- Database: masked view, safe stored procedure, least privilege, regex detector, hard-reject trigger.
- Load Balancer: health check, distribution check, upstream counts from Nginx access logs.
- Evidence: unified summary and export for report screenshots.

Evidence records are persisted locally at `security-test-dashboard/server/data/results.json`.
The file is ignored by Git and survives helper API restarts.

## Safety

This dashboard is for local lab/demo use only. Do not expose the helper API to a public network. The helper can read Docker logs and query the local MySQL lab database using configured demo credentials.
