import { useEffect, useState } from "react";
import { Pencil, Play, RefreshCw, RotateCcw } from "lucide-react";
import { PageHeader } from "../../components/PageHeader.jsx";
import { ResultTable } from "../../components/ResultTable.jsx";
import { dashboardApi } from "../../services/dashboardApi.js";

export function SqliTestPage() {
  const [testCases, setTestCases] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [payloadDrafts, setPayloadDrafts] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      dashboardApi.testCases(),
      dashboardApi.results(),
    ]).then(([testsData, resultsData]) => {
      const items = testsData.items ?? [];
      setTestCases(items);
      setPayloadDrafts(Object.fromEntries(
        items.map((test) => [test.id, test.defaultPayload ?? ""]),
      ));
      setResults(resultsData.items ?? []);
    }).catch((err) => {
      setError(err.message);
    });
  }, []);

  function updatePayload(testId, value) {
    setPayloadDrafts((current) => ({
      ...current,
      [testId]: value,
    }));
  }

  function resetPayload(test) {
    updatePayload(test.id, test.defaultPayload ?? "");
  }

  async function runTest(testId, options = {}) {
    setIsRunning(true);
    setError(null);
    try {
      const payload = options.useCustom ? payloadDrafts[testId] : undefined;
      const data = await dashboardApi.runTest({ testId, payload });
      setResults((current) => [...data.items, ...current]);
      setSelectedResult(data.items[0] ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  async function runAll() {
    setIsRunning(true);
    setError(null);
    try {
      const data = await dashboardApi.runAllTests();
      setResults((current) => [...data.items, ...current]);
      setSelectedResult(data.items[0] ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="SQL Injection"
        actions={
          <button className="primary-button" type="button" onClick={runAll} disabled={isRunning}>
            <Play size={16} aria-hidden="true" />
            Run all
          </button>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel">
        <div className="panel-header">
          <h2>Test cases</h2>
          {isRunning ? <div className="run-state"><RefreshCw size={15} aria-hidden="true" /> Running</div> : null}
        </div>
        <div className="test-case-grid">
          {testCases.map((test) => {
            const payloadDraft = payloadDrafts[test.id] ?? test.defaultPayload ?? "";
            const isEditing = editingTestId === test.id;
            const isCustomPayload = payloadDraft !== (test.defaultPayload ?? "");

            return (
              <article className="test-card" key={test.id}>
                <div className="test-id">{test.id}</div>
                <h3>{test.name}</h3>
                <div className="test-meta">{test.method} {test.path}</div>
                <div className="payload-preview">{test.defaultPayload || "No default payload"}</div>

                {isEditing ? (
                  <label className="payload-editor">
                    <span>Custom payload</span>
                    <textarea
                      rows="4"
                      spellCheck="false"
                      value={payloadDraft}
                      onChange={(event) => updatePayload(test.id, event.target.value)}
                    />
                  </label>
                ) : null}

                {isCustomPayload ? (
                  <div className="payload-state">Custom payload is ready for this test case.</div>
                ) : null}

                <div className="test-card-actions">
                  <button className="secondary-button" type="button" onClick={() => runTest(test.id)} disabled={isRunning}>
                    <Play size={15} aria-hidden="true" />
                    Default
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setEditingTestId(isEditing ? null : test.id)}
                    disabled={isRunning}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Edit
                  </button>
                  {isEditing ? (
                    <>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => runTest(test.id, { useCustom: true })}
                        disabled={isRunning}
                      >
                        <Play size={15} aria-hidden="true" />
                        Run custom
                      </button>
                      <button className="icon-button" type="button" title="Reset payload" onClick={() => resetPayload(test)} disabled={isRunning}>
                        <RotateCcw size={15} aria-hidden="true" />
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ResultTable rows={results} onSelect={setSelectedResult} />

      {selectedResult ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Response detail</h2>
          </div>
          <div className="detail-grid">
            <div>
              <div className="detail-label">Classification reason</div>
              <div className="detail-snippet">{selectedResult.classificationReason}</div>
            </div>
            {selectedResult.baseline ? (
              <div>
                <div className="detail-label">Baseline</div>
                <div className="detail-mono">
                  HTTP {selectedResult.baseline.statusCode ?? "-"} - {selectedResult.baseline.responseTimeMs ?? "-"} ms - records {selectedResult.baseline.recordCount ?? 0}
                </div>
              </div>
            ) : null}
            <div>
              <div className="detail-label">Payload source</div>
              <div className="detail-mono">{selectedResult.payloadSource ?? "DEFAULT"}</div>
            </div>
            {selectedResult.payloadWarning ? (
              <div>
                <div className="detail-label">Payload warning</div>
                <div className="detail-snippet">{selectedResult.payloadWarning}</div>
              </div>
            ) : null}
            <div>
              <div className="detail-label">URL</div>
              <div className="detail-mono">{selectedResult.url}</div>
            </div>
            <div>
              <div className="detail-label">Payload</div>
              <div className="detail-mono">{selectedResult.payload}</div>
            </div>
            <div>
              <div className="detail-label">Snippet</div>
              <div className="detail-snippet">{selectedResult.responseSnippet}</div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
