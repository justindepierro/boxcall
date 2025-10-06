import React from "react";

import { Card, Button } from "../ui";

// Phase 3 Task 8: Loading & error UI skeleton components
// Provides layout-preserving placeholders to prevent layout shift.

export const CalendarSidebarSkeleton: React.FC = () => (
  <div className="space-y-6" aria-label="Loading calendar sidebar">
    <Card className="p-6 space-y-4 animate-pulse">
      <div className="h-5 w-40 rounded-lg surface-subtle" />
      <div className="h-9 w-full rounded-lg surface-subtle" />
      <div className="h-9 w-5/6 rounded-lg surface-subtle" />
      <div className="h-9 w-2/3 rounded-lg surface-subtle" />
    </Card>
    <Card className="p-6 space-y-4 animate-pulse">
      <div className="h-5 w-28 rounded-lg surface-subtle" />
      <div className="flex gap-3">
        <div className="h-6 w-12 rounded-lg surface-subtle" />
        <div className="h-6 w-10 rounded-lg surface-subtle" />
        <div className="h-6 w-14 rounded-lg surface-subtle" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-5/6 rounded-lg surface-subtle" />
        <div className="h-3 w-2/3 rounded-lg surface-subtle" />
        <div className="h-3 w-3/5 rounded-lg surface-subtle" />
      </div>
    </Card>
  </div>
);

export const CalendarGridSkeleton: React.FC = () => (
  <Card className="p-6 animate-pulse" aria-label="Loading calendar grid">
    <div className="flex items-center justify-between mb-6">
      <div className="h-9 w-56 rounded-lg surface-subtle" />
      <div className="flex gap-3">
        <div className="h-9 w-20 rounded-lg surface-subtle" />
        <div className="h-9 w-24 rounded-lg surface-subtle" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2 h-[37.5rem] select-none">
      {Array.from({ length: 35 }).map((_, i) => (
        <div
          key={`skel-${i}`}
          className="rounded border border-subtle/60 surface-subtle relative overflow-hidden"
        >
          <div className="h-4 w-8 surface-subtle rounded-lg mt-1 ml-1" />
          <div className="absolute inset-0 opacity-60" />
        </div>
      ))}
    </div>
  </Card>
);

export const CalendarPageSkeleton: React.FC = () => (
  <div className="min-h-screen surface-app">
    <div className="surface-header border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full surface-subtle" />
          <div className="space-y-2">
            <div className="h-6 w-56 rounded-lg surface-subtle" />
            <div className="h-4 w-72 rounded-lg surface-subtle" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CalendarSidebarSkeleton />
        </div>
        <div className="lg:col-span-3">
          <CalendarGridSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export const CalendarErrorSkeleton: React.FC<{ message?: string }> = ({
  message = "Failed to load calendar events",
}) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="mx-auto h-14 w-14 rounded-full bg-surface-error flex items-center justify-center animate-pulse">
        <div className="h-8 w-8 rounded-full bg-surface-error" />
      </div>
      <p className="text-text-error font-medium">Calendar Error</p>
      <p className="text-sm text-text-secondary max-w-sm mx-auto">{message}</p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => window.location.reload()}
      >
        Reload
      </Button>
    </div>
  </div>
);

export default CalendarPageSkeleton;
