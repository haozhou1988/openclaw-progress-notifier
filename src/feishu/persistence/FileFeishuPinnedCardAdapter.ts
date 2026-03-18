import { promises as fs } from "node:fs";
import path from "node:path";
import type { FeishuPinnedCardRecordMap } from "../types.js";
import type { FeishuPinnedCardPersistenceAdapter } from "./FeishuPinnedCardPersistenceAdapter.js";

export class FileFeishuPinnedCardAdapter implements FeishuPinnedCardPersistenceAdapter {
  private filePath: string;

  constructor(
    private baseDir: string,
    options: { fileName?: string } = {}
  ) {
    this.filePath = path.join(baseDir, options.fileName ?? "feishu-pinned-cards.json");
  }

  private async ensureBaseDir(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
  }

  private async readAll(): Promise<FeishuPinnedCardRecordMap> {
    try {
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as FeishuPinnedCardRecordMap;
    } catch {
      return {};
    }
  }

  private async writeAll(records: FeishuPinnedCardRecordMap): Promise<void> {
    await this.ensureBaseDir();
    const temp = `${this.filePath}.tmp`;
    await fs.writeFile(temp, JSON.stringify(records, null, 2), "utf-8");
    await fs.rename(temp, this.filePath);
  }

  async loadConversation(_conversationId: string): Promise<FeishuPinnedCardRecordMap> {
    return this.readAll();
  }

  async saveConversation(_conversationId: string, records: FeishuPinnedCardRecordMap): Promise<void> {
    // Merge with existing records (conversationId is ignored - single file for all)
    const existing = await this.readAll();
    const merged = { ...existing, ...records };
    await this.writeAll(merged);
  }

  async deleteConversation(_conversationId: string): Promise<void> {
    // Don't delete file, just clear all records
    await this.writeAll({});
  }

  async listConversations(): Promise<string[]> {
    return ["feishu"];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureBaseDir();
      const probeFile = path.join(path.dirname(this.filePath), ".healthcheck.tmp");
      await fs.writeFile(probeFile, "ok", "utf-8");
      await fs.unlink(probeFile);
      return true;
    } catch {
      return false;
    }
  }
}
