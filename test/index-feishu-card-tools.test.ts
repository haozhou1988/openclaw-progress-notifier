import { describe, expect, it, vi } from "vitest";
import register from "../src/index.js";

function createMockApi(config: Record<string, any> = {}) {
  const tools: any[] = [];
  const hooks = new Map<string, Function>();
  return {
    logger: { info: vi.fn() },
    config,
    registerTool: vi.fn((tool) => tools.push(tool)),
    registerHook: vi.fn((name, fn) => hooks.set(name, fn)),
    _tools: tools,
    _hooks: hooks,
  };
}

describe("index feishu card tools", () => {
  it("registers progress_pin_card, progress_refresh_card, progress_unpin_card, progress_card_status", () => {
    const api = createMockApi({
      injectPromptContext: false,
      feishuAppId: "app-id",
      feishuAppSecret: "app-secret",
    });
    register(api);
    const names = api._tools.map((t: any) => t.name);
    expect(names).toContain("progress_pin_card");
    expect(names).toContain("progress_refresh_card");
    expect(names).toContain("progress_unpin_card");
    expect(names).toContain("progress_card_status");
  });

  it("progress_pin_card returns config error when Feishu is not configured", async () => {
    const api = createMockApi({ injectPromptContext: false, persistenceMode: "memory" });
    register(api);
    const pinTool = api._tools.find((t: any) => t.name === "progress_pin_card");
    const result = await pinTool.execute("1", { taskId: "paper-1", receiveId: "chat-1" }, { conversation: { id: "conv-1" } });
    expect(result.content[0].text).toContain("当前未配置飞书卡片服务");
  });

  it("progress_refresh_card returns config error when Feishu is not configured", async () => {
    const api = createMockApi({ injectPromptContext: false, persistenceMode: "memory" });
    register(api);
    const refreshTool = api._tools.find((t: any) => t.name === "progress_refresh_card");
    const result = await refreshTool.execute("1", { taskId: "paper-1" }, { conversation: { id: "conv-1" } });
    expect(result.content[0].text).toContain("当前未配置飞书卡片服务");
  });

  it("progress_unpin_card returns config error when Feishu is not configured", async () => {
    const api = createMockApi({ injectPromptContext: false, persistenceMode: "memory" });
    register(api);
    const unpinTool = api._tools.find((t: any) => t.name === "progress_unpin_card");
    const result = await unpinTool.execute("1", { taskId: "paper-1" }, { conversation: { id: "conv-1" } });
    expect(result.content[0].text).toContain("当前未配置飞书卡片服务");
  });

  it("progress_card_status returns config error when Feishu is not configured", async () => {
    const api = createMockApi({ injectPromptContext: false, persistenceMode: "memory" });
    register(api);
    const statusTool = api._tools.find((t: any) => t.name === "progress_card_status");
    const result = await statusTool.execute("1", {}, { conversation: { id: "conv-1" } });
    expect(result.content[0].text).toContain("当前未配置飞书卡片服务");
  });
});
