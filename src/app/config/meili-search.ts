import { Index, MeiliSearch } from "meilisearch";
import env from "./clean-env";

export class MeiliSearchClient {
  private client: MeiliSearch;
  private indexes: Map<string, Index> = new Map();

  constructor(config: { host: string; apiKey: string }) {
    this.client = new MeiliSearch({
      host: config.host,
      apiKey: config.apiKey,
    });
  }

  /**
   * Get or create a Meilisearch index
   * @param indexName Name of the index
   * @param settings Optional index settings
   */
  async getIndex(
    indexName: string,
    settings?: {
      searchableAttributes?: string[];
      displayedAttributes?: string[];
    },
  ): Promise<Index> {
    // Return cached index if available
    if (this.indexes.has(indexName)) {
      return this.indexes.get(indexName)!;
    }

    const index = this.client.index(indexName);

    try {
      await index.getRawInfo(); // check if exists
    } catch (err: any) {
      if (err.code === "index_not_found") {
        await this.client.createIndex(indexName);
      } else {
        throw err;
      }
    }

    // Configure index settings if provided
    if (settings) {
      await index.updateSettings({
        searchableAttributes: settings.searchableAttributes,
        displayedAttributes: settings.displayedAttributes,
      });
    }

    // Cache the index
    this.indexes.set(indexName, index);

    return index;
  }

  /**
   * Remove index from cache (useful for testing or when index is deleted)
   * @param indexName Name of the index to remove from cache
   */
  removeIndexFromCache(indexName: string): boolean {
    return this.indexes.delete(indexName);
  }

  /**
   * Clear all indexes from cache
   */
  clearCache(): void {
    this.indexes.clear();
  }

  /**
   * Get the underlying MeiliSearch client instance
   */
  getClient(): MeiliSearch {
    return this.client;
  }

  /**
   * Get all cached index names
   */
  getCachedIndexNames(): string[] {
    return Array.from(this.indexes.keys());
  }
}

// Create and export a default instance for backward compatibility
const meiliClient = new MeiliSearchClient({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_MASTER_KEY,
});

export default meiliClient;
