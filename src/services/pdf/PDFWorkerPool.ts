/**
 * PDF Worker Pool
 *
 * Manages a pool of reusable PDF workers to improve performance
 * and reduce the overhead of creating/terminating workers for each PDF generation
 */

import { wrap, type Remote } from "comlink";
import type { PDFWorkerAPI } from "../../workers/types/pdfWorkerTypes";

interface WorkerPoolItem {
  worker: Worker;
  api: Remote<PDFWorkerAPI>;
  busy: boolean;
}

class PDFWorkerPool {
  private pool: WorkerPoolItem[] = [];
  private readonly maxWorkers = 2; // Limit concurrent PDF generations

  /**
   * Get an available worker from the pool
   */
  private async getWorker(): Promise<WorkerPoolItem> {
    // Find available worker
    const available = this.pool.find((item) => !item.busy);
    if (available) {
      available.busy = true;
      return available;
    }

    // Create new worker if under limit
    if (this.pool.length < this.maxWorkers) {
      const worker = new Worker(
        new URL("../../workers/pdfWorker.ts", import.meta.url),
        {
          type: "module",
        }
      );
      const api = wrap<PDFWorkerAPI>(worker);
      const item: WorkerPoolItem = { worker, api, busy: true };
      this.pool.push(item);
      return item;
    }

    // Wait for available worker
    return new Promise((resolve) => {
      const checkForAvailable = () => {
        const available = this.pool.find((item) => !item.busy);
        if (available) {
          available.busy = true;
          resolve(available);
        } else {
          setTimeout(checkForAvailable, 10);
        }
      };
      checkForAvailable();
    });
  }

  /**
   * Release worker back to pool
   */
  private releaseWorker(item: WorkerPoolItem): void {
    item.busy = false;
  }

  /**
   * Execute PDF generation with pooled worker
   */
  async generatePDF<T>(
    operation: (api: Remote<PDFWorkerAPI>) => Promise<T>
  ): Promise<T> {
    const workerItem = await this.getWorker();
    try {
      return await operation(workerItem.api);
    } finally {
      this.releaseWorker(workerItem);
    }
  }

  /**
   * Terminate all workers and clear pool
   */
  dispose(): void {
    this.pool.forEach((item) => item.worker.terminate());
    this.pool = [];
  }
}

// Global singleton instance
export const pdfWorkerPool = new PDFWorkerPool();

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    pdfWorkerPool.dispose();
  });
}
