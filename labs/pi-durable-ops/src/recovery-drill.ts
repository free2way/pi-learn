import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import { createModels } from "@earendil-works/pi-ai/models";
import { createRegistry, defineExtension, defineTask, Harness } from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";

const context = BACKGROUND_CONTEXT;
const directory = await mkdtemp(join(tmpdir(), "pi-durable-recovery-"));
const databasePath = join(directory, "session.sqlite");
const visibleEffects: number[] = [];

let reachedTick = (_n: number): void => {};
type TickerState = { phase: "tick"; n: number };

const Ticker = defineTask<{ to: number }, TickerState, string>({
  name: "lab.ticker",
  version: 1,
  initial: () => ({ phase: "tick", n: 1 }),
  phases: {
    tick: async (task, runtime, taskContext) => {
      const n = task.state.checkpoint.n;

      // The memo is the durable idempotency key. The phase may rerun after a
      // crash, but this visible effect is emitted only once.
      if ((await runtime.memo(`visible-${n}`, taskContext)) === undefined) {
        await runtime.memo(`visible-${n}`, true, taskContext);
        visibleEffects.push(n);
        console.log(`effect ${n}`);
      }
      reachedTick(n);

      if (n === task.input.to) {
        await runtime.commit(
          () => ({ status: "terminal", outcome: { status: "completed", result: `counted to ${n}` } }),
          taskContext,
        );
        return;
      }
      await runtime.sleepUntil(runtime.now() + 25, { phase: "tick", n: n + 1 }, taskContext);
    },
  },
  abort: async (_task, runtime, taskContext) => {
    await runtime.commit(() => ({ status: "terminal", outcome: { status: "aborted" } }), taskContext);
  },
});

const registry = createRegistry();
registry.install(defineExtension({ name: "recovery-drill", tasks: [Ticker] }));
const open = async () =>
  Harness.open(await openNodeSqliteStorage(databasePath), { models: createModels(), registry }, context);

try {
  const firstRun = await open();
  const tickerId = await (await firstRun.root(context)).commit(
    (tx) => tx.createTask(Ticker, { to: 5 }, { ownership: { kind: "conversation" } }),
    context,
  );
  const tickTwo = new Promise<void>((resolve) => {
    reachedTick = (n) => n === 2 && resolve();
  });

  firstRun.resume();
  await tickTwo;
  await firstRun.close(context);
  reachedTick = () => {};

  const reader = await open();
  const saved = await reader.getTask(tickerId, context);
  assert.ok(saved, "the interrupted task must exist in SQLite");
  console.log("saved checkpoint:", saved.state);
  await reader.close(context);

  const secondRun = await open();
  const finished = await secondRun.waitForTask(tickerId, context);
  assert.deepEqual(visibleEffects, [1, 2, 3, 4, 5], "a resumed phase must not repeat its visible effect");
  assert.deepEqual(finished.state.outcome, { status: "completed", result: "counted to 5" });
  console.log("resumed outcome:", finished.state.outcome);
  console.log("visible effects:", visibleEffects.join(","));
  await secondRun.close(context);
} finally {
  await rm(directory, { recursive: true, force: true });
}
