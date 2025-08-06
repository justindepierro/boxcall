/**
 * Optimized Practice Data Hook
 *
 * High-performance hook with useMemo optimizations to prevent expensive
 * recalculations of practice data, statistics, and derived state
 */
import { useMemo, useCallback } from "react";

interface PracticeBlock {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  category: string;
  title: string;
  location: string;
  notes: string;
  assignedCoach?: string;
}

interface PracticeStatistics {
  totalDuration: number;
  totalHours: number;
  totalMinutes: number;
  categoryBreakdown: Record<string, number>;
  categoryPercentages: Record<string, number>;
  blockCount: number;
  averageBlockDuration: number;
  longestBlock: PracticeBlock | null;
  shortestBlock: PracticeBlock | null;
  timeGaps: Array<{ start: string; end: string; duration: number }>;
}

export const useOptimizedPracticeData = (
  blocks: PracticeBlock[],
  filterCategory?: string,
  filterCoach?: string,
  searchTerm?: string
) => {
  // Memoized filtered blocks
  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesCategory =
        !filterCategory || block.category === filterCategory;
      const matchesCoach = !filterCoach || block.assignedCoach === filterCoach;
      const matchesSearch =
        !searchTerm ||
        block.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.location.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesCoach && matchesSearch;
    });
  }, [blocks, filterCategory, filterCoach, searchTerm]);

  // Memoized statistics calculation
  const statistics = useMemo((): PracticeStatistics => {
    if (filteredBlocks.length === 0) {
      return {
        totalDuration: 0,
        totalHours: 0,
        totalMinutes: 0,
        categoryBreakdown: {},
        categoryPercentages: {},
        blockCount: 0,
        averageBlockDuration: 0,
        longestBlock: null,
        shortestBlock: null,
        timeGaps: [],
      };
    }

    const totalDuration = filteredBlocks.reduce(
      (sum, block) => sum + block.duration,
      0
    );
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    filteredBlocks.forEach((block) => {
      categoryBreakdown[block.category] =
        (categoryBreakdown[block.category] || 0) + block.duration;
    });

    // Category percentages
    const categoryPercentages: Record<string, number> = {};
    Object.keys(categoryBreakdown).forEach((category) => {
      categoryPercentages[category] =
        totalDuration > 0
          ? Math.round((categoryBreakdown[category] / totalDuration) * 100)
          : 0;
    });

    // Find longest and shortest blocks
    const longestBlock = filteredBlocks.reduce((longest, current) =>
      current.duration > longest.duration ? current : longest
    );
    const shortestBlock = filteredBlocks.reduce((shortest, current) =>
      current.duration < shortest.duration ? current : shortest
    );

    // Calculate time gaps
    const sortedBlocks = [...filteredBlocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const timeGaps: Array<{ start: string; end: string; duration: number }> =
      [];
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const currentEnd = sortedBlocks[i].endTime;
      const nextStart = sortedBlocks[i + 1].startTime;

      if (currentEnd < nextStart) {
        const gapDuration = calculateTimeDifference(currentEnd, nextStart);
        if (gapDuration > 0) {
          timeGaps.push({
            start: currentEnd,
            end: nextStart,
            duration: gapDuration,
          });
        }
      }
    }

    return {
      totalDuration,
      totalHours,
      totalMinutes,
      categoryBreakdown,
      categoryPercentages,
      blockCount: filteredBlocks.length,
      averageBlockDuration: Math.round(totalDuration / filteredBlocks.length),
      longestBlock,
      shortestBlock,
      timeGaps,
    };
  }, [filteredBlocks]);

  // Memoized sorted blocks by different criteria
  const sortedByTime = useMemo(
    () =>
      [...filteredBlocks].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    [filteredBlocks]
  );

  const sortedByDuration = useMemo(
    () => [...filteredBlocks].sort((a, b) => b.duration - a.duration),
    [filteredBlocks]
  );

  const sortedByCategory = useMemo(
    () =>
      [...filteredBlocks].sort((a, b) => a.category.localeCompare(b.category)),
    [filteredBlocks]
  );

  // Memoized category list for filters
  const availableCategories = useMemo(
    () => Array.from(new Set(blocks.map((block) => block.category))).sort(),
    [blocks]
  );

  const availableCoaches = useMemo(
    () =>
      Array.from(
        new Set(blocks.map((block) => block.assignedCoach).filter(Boolean))
      ).sort(),
    [blocks]
  );

  // Memoized utility functions
  const getBlockById = useCallback(
    (id: string) => blocks.find((block) => block.id === id),
    [blocks]
  );

  const getBlocksByCategory = useCallback(
    (category: string) => blocks.filter((block) => block.category === category),
    [blocks]
  );

  const getBlocksByCoach = useCallback(
    (coach: string) => blocks.filter((block) => block.assignedCoach === coach),
    [blocks]
  );

  // Memoized validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for overlapping times
    const sortedBlocks = [...blocks].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      if (sortedBlocks[i].endTime > sortedBlocks[i + 1].startTime) {
        errors.push(
          `Time overlap between "${sortedBlocks[i].title}" and "${sortedBlocks[i + 1].title}"`
        );
      }
    }

    // Check for very short blocks
    blocks.forEach((block) => {
      if (block.duration < 5) {
        warnings.push(
          `Block "${block.title}" is very short (${block.duration} minutes)`
        );
      }
    });

    // Check for very long blocks
    blocks.forEach((block) => {
      if (block.duration > 120) {
        warnings.push(
          `Block "${block.title}" is very long (${block.duration} minutes)`
        );
      }
    });

    return { errors, warnings, isValid: errors.length === 0 };
  }, [blocks]);

  return {
    // Filtered data
    filteredBlocks,
    statistics,

    // Sorted data
    sortedByTime,
    sortedByDuration,
    sortedByCategory,

    // Filter options
    availableCategories,
    availableCoaches,

    // Utility functions
    getBlockById,
    getBlocksByCategory,
    getBlocksByCoach,

    // Validation
    validation,
  };
};

// Helper function to calculate time difference in minutes
function calculateTimeDifference(start: string, end: string): number {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return endMinutes - startMinutes;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
