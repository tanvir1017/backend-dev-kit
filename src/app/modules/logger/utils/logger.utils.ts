import { LogService } from "../service/logger.service";
import {
  CreateLogParams,
  LogAction,
  LogData,
  LogLevel,
  ModuleName,
} from "../types/logger.types";

export class Logger {
  private logService: LogService;
  private operatorInfo: {
    id: string;
    role: string;
    email: string;
  };

  constructor(operatorInfo: { id: string; role: string; email: string }) {
    this.logService = new LogService();
    this.operatorInfo = operatorInfo;
  }

  async log(data: Omit<LogData, "level"> & { level?: LogLevel }) {
    const logParams: CreateLogParams = {
      ...data,
      operatorId: this.operatorInfo.id,
      operatorRole: this.operatorInfo.role,
      operatorEmail: this.operatorInfo.email,
      level: data.level || LogLevel.INFO,
    };

    // Non-blocking log creation
    return this.logService.createActivityLog(logParams);
  }

  // Convenience methods for common actions
  async create({
    module,
    description,
    entityId,
    data,
  }: {
    module: ModuleName;
    description: string;
    entityId?: string;
    data?: any;
  }) {
    return this.log({
      action: LogAction.CREATE,
      module,
      description,
      entityId,
      newData: data,
    });
  }

  async update({
    description,
    module,
    entityId,
    oldData,
    newData,
  }: {
    module: ModuleName;
    description: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
  }) {
    console.log("🚀 ~ Logger ~ update ~ newData:", newData);
    const changes = this.logService.extractChanges(oldData, newData);
    console.log("🚀 ~ Logger ~ update ~ changes:", changes);

    return this.log({
      action: LogAction.UPDATE,
      module,
      description,
      entityId,
      oldData,
      newData,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });
  }

  async delete({
    description,
    module,
    entityId,
    deletedData,
  }: {
    module: ModuleName;
    description: string;
    entityId?: string;
    deletedData?: any;
  }) {
    return this.log({
      action: LogAction.DELETE,
      module,
      description,
      entityId,
      oldData: deletedData,
    });
  }

  async info(module: ModuleName, description: string, metadata?: any) {
    return this.log({
      action: LogAction.READ,
      module,
      description,
      level: LogLevel.INFO,
      metadata,
    });
  }

  async warn(module: ModuleName, description: string, metadata?: any) {
    return this.log({
      action: LogAction.UPDATE, // or appropriate action
      module,
      description,
      level: LogLevel.WARN,
      metadata,
    });
  }

  async error(
    module: ModuleName,
    description: string,
    error?: any,
    metadata?: any,
  ) {
    return this.log({
      action: LogAction.UPDATE, // or appropriate action
      module,
      description: `${description}: ${error?.message || "Unknown error"}`,
      level: LogLevel.ERROR,
      metadata: {
        ...metadata,
        error: error?.message,
        stack:
          process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
    });
  }

  // Method to create logger with request context
  static fromRequest(req: any) {
    // Extract operator info from authenticated request
    // Adjust this based on your auth middleware
    const operatorInfo = {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
    };

    // Extract request info
    const requestInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    const logger = new Logger(operatorInfo);

    // Return enhanced logger with request context
    return {
      ...logger,
      logWithContext: (data: LogData) => {
        return logger.log({
          ...data,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent,
        });
      },
    };
  }
}

// Export for easy use in other services
export { LogLevel, ModuleName };
