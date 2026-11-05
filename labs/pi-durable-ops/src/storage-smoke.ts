import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import { createModels } from "@earendil-works/pi-ai/models";
import { fauxAssistantMessage, fauxProvider } from "@earendil-works/pi-ai/providers/faux";
import { AssistantEntry, createRegistry, defineDoc, Harness } from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";

const context = BACKGROUND_CONTEXT;
const directory = await mkdtemp(join(tmpdir(), "pi-durable-storage-"));
const databasePath = join(directory, "session.sqlite");

const RunBook = defineDoc<{ requestIds: string[] }>({
  kind: "lab.runbook",
  version: 1,
  scope: "conversation",
  history: "rewindable",
  fork: "asOf",
  checkpointWhen: () => false,
  initial: () => ({ requestIds: [] }),
});

const faux = fauxProvider();
faux.setResponses([fauxAssistantMessage("storage smoke passed")]);
const models = createModels();
models.setProvider(faux.provider);
const registry = createRegistry();
const open = async () => Harness.open(await openNodeSqliteStorage(databasePath), { models, registry }, context);

try {
  const first = await open();
  const root = await first.root(context, {
    agent: { model: { provider: "faux", modelId: "faux-1" } },
  });
  const requestId = "lab:storage-smoke:001";
  await root.commit(async (tx) => {
    (await tx.doc(RunBook, root.id)).requestIds.push(requestId);
  }, context);

  const submitted = await root.submit({ type: "input", content: "Run the offline smoke test", requestId }, context);
  const settled = await submitted.wait(context);
  assert.equal(settled.status, "done");
  if (settled.status === "done" && settled.type === "input") {
    await root.commit((tx) => tx.entry(AssistantEntry, settled.answer), context);
  }
  const firstRootId = root.id;
  const firstSubmissionId = submitted.id;
  await first.close(context);

  const reopened = await open();
  const sameRoot = await reopened.root(context);
  const duplicate = await sameRoot.submit(
    { type: "input", content: "Run the offline smoke test", requestId },
    context,
  );
  const state = await reopened.snapshot(RunBook, sameRoot.id, context);

  assert.equal(sameRoot.id, firstRootId, "SQLite reopen must recover the same root conversation");
  assert.equal(duplicate.id, firstSubmissionId, "requestId retry must find the admitted submission");
  assert.ok(state, "the runbook document must survive reopen");
  assert.deepEqual(state.requestIds, [requestId], "document state must survive reopen without duplication");

  console.log("root recovered:", sameRoot.id);
  console.log("submission deduplicated:", duplicate.id);
  console.log("document recovered:", state);
  await reopened.close(context);
} finally {
  await rm(directory, { recursive: true, force: true });
}
