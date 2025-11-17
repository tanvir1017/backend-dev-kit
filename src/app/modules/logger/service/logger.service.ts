import LogRepository from "../repository/logger.repository";
import {
  CreateLogParams,
  LogFilter,
  PaginatedLogs,
} from "../types/logger.types";

export class LogService {
  private logRepository: LogRepository;

  constructor() {
    this.logRepository = new LogRepository();
  }

  async createActivityLog(logData: CreateLogParams) {
    // Validate required fields
    if (
      !logData.operatorId ||
      !logData.module ||
      !logData.action ||
      !logData.description
    ) {
      console.warn("Missing required log fields:", {
        operatorId: logData.operatorId,
        module: logData.module,
        action: logData.action,
        description: logData.description,
      });
      return null;
    }

    try {
      return await this.logRepository.createLog(logData);
    } catch (error) {
      console.error("Log service error:", error);
      return null;
    }
  }

  async getActivityLogs(
    filter: LogFilter,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedLogs> {
    // Validate pagination
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 records per page

    return this.logRepository.getLogs(filter, validPage, validLimit);
  }

  async getLogById(id: string) {
    if (!id) {
      throw new Error("Log ID is required");
    }
    return this.logRepository.getLogById(id);
  }

  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    if (retentionDays < 1) {
      throw new Error("Retention days must be at least 1");
    }
    return this.logRepository.cleanupOldLogs(retentionDays);
  }

  // Utility method to extract changes between old and new data
  extractChanges(
    oldData: any,
    newData: any,
  ): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    if (!oldData || !newData) return changes;

    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {}),
    ]);

    allKeys.forEach((key) => {
      const oldValue = oldData[key];
      const newValue = newData[key];

      // Deep comparison for objects/arrays
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    return changes;
  }
}
