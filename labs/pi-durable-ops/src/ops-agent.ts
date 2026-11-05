import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { BACKGROUND_CONTEXT } from "@earendil-works/chord/context";
import { createModels } from "@earendil-works/pi-ai/models";
import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";
import { NodeExecutionEnv } from "@earendil-works/pi-durable/env/node";
import {
  AssistantEntry,
  createRegistry,
  defineDoc,
  defineExtension,
  Harness,
  hook,
  section,
  ToolTask,
} from "@earendil-works/pi-durable";
import { openNodeSqliteStorage } from "@earendil-works/pi-durable/storage/sqlite/node";
import { CodingTools } from "@earendil-works/pi-durable/tools";

type RequestRecord = {
  id: string;
  createdAt: string;
  status: "pending" | "done" | "failed";
};

const OpsRuns = defineDoc<{ requests: RequestRecord[] }>({
  kind: "lab.ops-runs",
  version: 1,
  scope: "conversation",
  history: "latest",
  fork: "initial",
  checkpointWhen: (value) => value.requests.length % 20 === 0,
  initial: () => ({ requests: [] }),
});

const context = BACKGROUND_CONTEXT;
const prompt = process.argv.slice(2).join(" ").trim();
if (!prompt) {
  throw new Error('Usage: npm run agent -- "inspect this repository and report the failing checks"');
}
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required for the real-model agent; npm test remains fully offline");
}

const cwd = resolve(process.env.AGENT_CWD ?? process.cwd());
const dataDirectory = resolve(process.env.DURABLE_DATA_DIR ?? ".data");
await mkdir(dataDirectory, { recursive: true });
const databasePath = resolve(dataDirectory, "ops-agent.sqlite");
const requestId =
  process.env.REQUEST_ID ?? `ops:${createHash("sha256").update(`${cwd}\n${prompt}`).digest("hex").slice(0, 16)}`;

const Safety = defineExtension({
  name: "ops-safety",
  sections: [
    section(
      "preamble",
      () =>
        "You are a durable operations assistant. Inspect before acting, prefer read-only evidence, and never claim success without command output.",
      { tag: false },
    ),
  ],
  hooks: [
    hook(ToolTask, {
      beforeTool: (call) =>
        call.name === "bash" && process.env.ALLOW_BASH !== "1"
          ? { block: "bash is disabled; set ALLOW_BASH=1 only for a reviewed low-risk workspace" }
          : undefined,
    }),
  ],
});

const models = createModels();
models.setProvider(openaiProvider());
const registry = createRegistry();
registry.install(CodingTools);
registry.install(Safety);

const harness = await Harness.open(
  await openNodeSqliteStorage(databasePath),
  {
    models,
    registry,
    settings: { restartLimit: 3 },
    env: ({ cwd: agentCwd }) => new NodeExecutionEnv({ cwd: agentCwd ?? cwd }),
  },
  context,
);

try {
  const root = await harness.root(context, {
    agent: {
      model: { provider: "openai", modelId: process.env.PI_DURABLE_MODEL ?? "gpt-6-sol" },
      thinkingLevel: "high",
      cwd,
    },
  });

  await root.commit(async (tx) => {
    const state = await tx.doc(OpsRuns, root.id);
    if (!state.requests.some((request) => request.id === requestId)) {
      state.requests.push({ id: requestId, createdAt: new Date().toISOString(), status: "pending" });
    }
  }, context);

  console.log("database:", databasePath);
  console.log("conversation:", root.id);
  console.log("requestId:", requestId);

  const submission = await root.submit({ type: "input", content: prompt, requestId }, context);
  const settled = await submission.wait(context);

  if (settled.status === "done" && settled.type === "input") {
    const answerEntry = await root.commit(async (tx) => {
      const entry = await tx.entry(AssistantEntry, settled.answer);
      const state = await tx.doc(OpsRuns, root.id);
      const stored = state.requests.find((request) => request.id === requestId);
      if (stored) stored.status = "done";
      return entry;
    }, context);
    const message = answerEntry?.model?.[0];
    const text =
      message?.role === "assistant"
        ? message.content.filter((part) => part.type === "text").map((part) => part.text).join("\n")
        : "";
    console.log("answer:\n" + text);
  } else {
    await root.commit(async (tx) => {
      const state = await tx.doc(OpsRuns, root.id);
      const stored = state.requests.find((request) => request.id === requestId);
      if (stored) stored.status = "failed";
    }, context);
    console.error("unanswered:", settled.reason, settled.detail);
    process.exitCode = 1;
  }

  console.log("usage:", JSON.stringify(await harness.usage(context), null, 2));
  console.log("runbook:", await harness.snapshot(OpsRuns, root.id, context));
} finally {
  await harness.close(context);
}
