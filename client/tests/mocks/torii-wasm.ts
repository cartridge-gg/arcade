export class ToriiClient {
  async getTokens(): Promise<{ items: unknown[]; next_cursor?: string }> {
    return { items: [], next_cursor: undefined };
  }
}
