/**
 * Dev Tools Logger - Centralized logging system for development tools
 */

import type { LogEntry } from "../../types/dev";

class DevLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  addLog(
    level: LogEntry["level"],
    message: string,
    module: string,
    data?: unknown
  ): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      module,
      message,
      data,
    };

    this.logs = [entry, ...this.logs.slice(0, this.maxLogs - 1)];

    // Console output for development
    if (import.meta.env.DEV) {
      const prefix = `[${module.toUpperCase()}]`;
      switch (level) {
        case "error":
          console.error(prefix, message, data || "");
          break;
        case "warning":
          console.warn(prefix, message, data || "");
          break;
        case "success":
          console.log(`✅ ${prefix}`, message, data || "");
          break;
        default:
          console.log(`ℹ️ ${prefix}`, message, data || "");
      }
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    this.addLog("info", "Logs cleared", "logger");
  }

  info(message: string, module: string, data?: unknown): void {
    this.addLog("info", message, module, data);
  }

  warning(message: string, module: string, data?: unknown): void {
    this.addLog("warning", message, module, data);
  }

  error(message: string, module: string, data?: unknown): void {
    this.addLog("error", message, module, data);
  }

  success(message: string, module: string, data?: unknown): void {
    this.addLog("success", message, module, data);
  }
}

export const devLogger = new DevLogger();
