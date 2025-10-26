/**
 * Bundle Size Monitoring & Performance Regression Detection
 * Phase 3: Build Pipeline Enhancement
 */

import fs from 'fs';
import path from 'path';

interface BundleStats {
  timestamp: string;
  totalSize: number;
  gzipSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize: number;
  }>;
  buildTime: number;
}

interface SizeThresholds {
  total: number; // bytes
  largestChunk: number; // bytes
  warningThreshold: number; // percentage increase
}

class BundleMonitor {
  private static readonly STATS_FILE = '.bundle-stats.json';
  private static readonly THRESHOLDS: SizeThresholds = {
    total: 3 * 1024 * 1024, // 3MB
    largestChunk: 600 * 1024, // 600KB
    warningThreshold: 5, // 5% increase
  };

  static analyzeBuild(): void {
    const distPath = path.join(process.cwd(), 'dist');
    const statsPath = path.join(process.cwd(), BundleMonitor.STATS_FILE);

    if (!fs.existsSync(distPath)) {
      console.warn('⚠️  Dist directory not found. Run build first.');
      return;
    }

    // Read previous stats
    let previousStats: BundleStats | null = null;
    if (fs.existsSync(statsPath)) {
      try {
        previousStats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      } catch (error) {
        console.warn('⚠️  Could not read previous bundle stats');
      }
    }

    // Analyze current build
    const currentStats = BundleMonitor.collectStats(distPath);

    // Compare with previous
    if (previousStats) {
      BundleMonitor.compareStats(previousStats, currentStats);
    }

    // Check thresholds
    BundleMonitor.checkThresholds(currentStats);

    // Save current stats
    fs.writeFileSync(statsPath, JSON.stringify(currentStats, null, 2));
    console.log('📊 Bundle stats saved to', BundleMonitor.STATS_FILE);
  }

  private static collectStats(distPath: string): BundleStats {
    const assetsPath = path.join(distPath, 'assets');
    const chunks: BundleStats['chunks'] = [];

    if (fs.existsSync(assetsPath)) {
      const files = fs.readdirSync(assetsPath);

      files.forEach(file => {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);

        // Extract gzip size from filename if available (vite adds it)
        const gzipMatch = file.match(/\.(\w+)\.(\w+)\.js$/);
        let gzipSize = stats.size * 0.3; // Rough estimate

        chunks.push({
          name: file,
          size: stats.size,
          gzipSize: Math.round(gzipSize),
        });
      });
    }

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);

    return {
      timestamp: new Date().toISOString(),
      totalSize,
      gzipSize,
      chunks,
      buildTime: Date.now(), // This would be set by the build script
    };
  }

  private static compareStats(previous: BundleStats, current: BundleStats): void {
    const totalIncrease = ((current.totalSize - previous.totalSize) / previous.totalSize) * 100;
    const gzipIncrease = ((current.gzipSize - previous.gzipSize) / previous.gzipSize) * 100;

    console.log('\n📈 Bundle Size Comparison:');
    console.log(`Total Size: ${BundleMonitor.formatBytes(previous.totalSize)} → ${BundleMonitor.formatBytes(current.totalSize)} (${totalIncrease >= 0 ? '+' : ''}${totalIncrease.toFixed(1)}%)`);
    console.log(`Gzip Size: ${BundleMonitor.formatBytes(previous.gzipSize)} → ${BundleMonitor.formatBytes(current.gzipSize)} (${gzipIncrease >= 0 ? '+' : ''}${gzipIncrease.toFixed(1)}%)`);

    if (Math.abs(totalIncrease) > BundleMonitor.THRESHOLDS.warningThreshold) {
      const emoji = totalIncrease > 0 ? '⚠️' : '✅';
      console.log(`${emoji} Significant bundle size change detected!`);
    }
  }

  private static checkThresholds(stats: BundleStats): void {
    console.log('\n🔍 Bundle Size Analysis:');

    // Check total size
    if (stats.totalSize > BundleMonitor.THRESHOLDS.total) {
      console.warn(`⚠️  Total bundle size (${BundleMonitor.formatBytes(stats.totalSize)}) exceeds threshold (${BundleMonitor.formatBytes(BundleMonitor.THRESHOLDS.total)})`);
    } else {
      console.log(`✅ Total bundle size: ${BundleMonitor.formatBytes(stats.totalSize)}`);
    }

    // Check largest chunk
    const largestChunk = stats.chunks.reduce((max, chunk) =>
      chunk.size > max.size ? chunk : max, stats.chunks[0]);

    if (largestChunk.size > BundleMonitor.THRESHOLDS.largestChunk) {
      console.warn(`⚠️  Largest chunk "${largestChunk.name}" (${BundleMonitor.formatBytes(largestChunk.size)}) exceeds threshold (${BundleMonitor.formatBytes(BundleMonitor.THRESHOLDS.largestChunk)})`);
    } else {
      console.log(`✅ Largest chunk: ${largestChunk.name} (${BundleMonitor.formatBytes(largestChunk.size)})`);
    }

    // Show top 5 chunks
    console.log('\n📦 Top 5 Chunks:');
    stats.chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)
      .forEach((chunk, index) => {
        console.log(`  ${index + 1}. ${chunk.name}: ${BundleMonitor.formatBytes(chunk.size)} (${BundleMonitor.formatBytes(chunk.gzipSize)} gzipped)`);
      });
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static getStats(): BundleStats | null {
    const statsPath = path.join(process.cwd(), BundleMonitor.STATS_FILE);
    if (fs.existsSync(statsPath)) {
      try {
        return JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  BundleMonitor.analyzeBuild();
}

export { BundleMonitor };
export type { BundleStats, SizeThresholds };