import { useCallback, useEffect, useState } from "react";

import { PracticeService } from "@services/practiceService";

import type {
  CreatePracticeBlockData,
  CreatePracticeScheduleData,
  Equipment,
  PracticeAttendance,
  PracticeBlock,
  PracticeFilters,
  PracticeSchedule,
  PracticeTemplate,
} from "../types/practice";
// Practice Schedule Hook
export function usePracticeSchedule(teamId: string, filters?: PracticeFilters) {
  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchSchedules = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await PracticeService.getPracticeSchedules(teamId, filters);
      setSchedules(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch practice schedules"
      );
    } finally {
      setLoading(false);
    }
  }, [teamId, filters]);
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);
  const createSchedule = async (data: CreatePracticeScheduleData) => {
    try {
      const newSchedule = await PracticeService.createPracticeSchedule(data);
      setSchedules((prev) => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create practice schedule"
      );
      throw err;
    }
  };
  const updateSchedule = async (
    id: string,
    updates: Partial<PracticeSchedule>
  ) => {
    try {
      const updatedSchedule = await PracticeService.updatePracticeSchedule(
        id,
        updates
      );
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? updatedSchedule : schedule
        )
      );
      return updatedSchedule;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update practice schedule"
      );
      throw err;
    }
  };
  const deleteSchedule = async (id: string) => {
    try {
      await PracticeService.deletePracticeSchedule(id);
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete practice schedule"
      );
      throw err;
    }
  };
  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
  };
}
// Practice Block Management Hook
export function usePracticeBlocks(scheduleId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addBlock = async (blockData: CreatePracticeBlockData) => {
    try {
      setLoading(true);
      setError(null);
      const newBlock = await PracticeService.addPracticeBlock(
        scheduleId,
        blockData
      );
      return newBlock;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add practice block"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const updateBlock = async (
    blockId: string,
    updates: Partial<PracticeBlock>
  ) => {
    try {
      setLoading(true);
      setError(null);
      await PracticeService.updatePracticeBlock(scheduleId, blockId, updates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update practice block"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const reorderBlocks = async (blocks: PracticeBlock[]) => {
    try {
      setLoading(true);
      setError(null);
      await PracticeService.reorderPracticeBlocks(scheduleId, blocks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reorder practice blocks"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const deleteBlock = async (blockId: string) => {
    try {
      setLoading(true);
      setError(null);
      await PracticeService.deletePracticeBlock(scheduleId, blockId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete practice block"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    error,
    addBlock,
    updateBlock,
    reorderBlocks,
    deleteBlock,
  };
}
// Practice Templates Hook
export function usePracticeTemplates(teamId: string) {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTemplates = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await PracticeService.getPracticeTemplates(teamId);
      setTemplates(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch practice templates"
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  const createTemplate = async (
    template: Omit<PracticeTemplate, "id" | "createdAt" | "usageCount">
  ) => {
    try {
      const newTemplate =
        await PracticeService.createPracticeTemplate(template);
      setTemplates((prev) => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create practice template"
      );
      throw err;
    }
  };
  const createScheduleFromTemplate = async (
    templateId: string,
    scheduleData: CreatePracticeScheduleData
  ) => {
    try {
      const schedule = await PracticeService.createScheduleFromTemplate(
        templateId,
        scheduleData
      );
      return schedule;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create schedule from template"
      );
      throw err;
    }
  };
  return {
    templates,
    loading,
    error,
    createTemplate,
    createScheduleFromTemplate,
    refetch: fetchTemplates,
  };
}
// Practice Attendance Hook
export function usePracticeAttendance(practiceId: string) {
  const [attendance, setAttendance] = useState<PracticeAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAttendance = useCallback(async () => {
    if (!practiceId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await PracticeService.getPracticeAttendance(practiceId);
      setAttendance(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch practice attendance"
      );
    } finally {
      setLoading(false);
    }
  }, [practiceId]);
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
  const recordAttendance = async (
    playerId: string,
    status: "present" | "absent" | "late" | "excused",
    notes?: string
  ) => {
    try {
      const record = await PracticeService.recordAttendance(
        practiceId,
        playerId,
        status,
        notes
      );
      setAttendance((prev) => {
        const existing = prev.find((a) => a.playerId === playerId);
        if (existing) {
          return prev.map((a) => (a.playerId === playerId ? record : a));
        } else {
          return [...prev, record];
        }
      });
      return record;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to record attendance"
      );
      throw err;
    }
  };
  return {
    attendance,
    loading,
    error,
    recordAttendance,
    refetch: fetchAttendance,
  };
}
// Equipment Hook
export function useEquipment(teamId: string) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchEquipment = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await PracticeService.getAvailableEquipment(teamId);
      setEquipment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch equipment"
      );
    } finally {
      setLoading(false);
    }
  }, [teamId]);
  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);
  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment,
  };
}
// Practice Search Hook
export function usePracticeSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchPractices = async (query: string, teamId: string) => {
    try {
      setLoading(true);
      setError(null);
      const results = await PracticeService.searchPractices(query, teamId);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  return {
    searchPractices,
    loading,
    error,
  };
}
// Time Management Hook for Practice Blocks
export function usePracticeTimer() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);
  const startTimer = () => {
    setStartTime(new Date());
    setIsRunning(true);
  };
  const stopTimer = () => {
    setIsRunning(false);
  };
  const resetTimer = () => {
    setStartTime(null);
    setCurrentTime(new Date());
    setIsRunning(false);
  };
  const getElapsedTime = () => {
    if (!startTime) return 0;
    return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  };
  const getTimeRemaining = (endTime: Date) => {
    const remaining = Math.floor(
      (endTime.getTime() - currentTime.getTime()) / 1000
    );
    return Math.max(0, remaining);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return {
    currentTime,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    getElapsedTime,
    getTimeRemaining,
    formatTime,
  };
}
