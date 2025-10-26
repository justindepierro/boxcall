import React from "react";

import "./CalendarShell.css";
// (migrated logic now inside controller hook)
import { Card } from "../ui"; // adjust relative path if needed
import Icon from "../ui/Icon/Icon";

import { BoxCallCalendar } from "./BoxCallCalendar";
import { CalendarFiltersPanel } from "./CalendarFiltersPanel";
import { CalendarHeader } from "./CalendarHeader";
import {
  CalendarPageSkeleton,
  CalendarErrorSkeleton,
} from "./CalendarSkeletons";
import { AISuggestionsPanel } from "./AISuggestionsPanel";
import { ConflictsPanel } from "./ConflictsPanel";
import { CalendarStats } from "./CalendarStats";
import { CalendarToolbar } from "./CalendarToolbar";
import { EventModal } from "./EventModal";
// url state handled inside controller
// Consolidated controller hook (data, filters, selection, navigation, url, mutations)
import { useCalendarShellController } from "./hooks/useCalendarShellController";

// Final CalendarShell: legacy CalendarPage removed.
export const CalendarShell: React.FC = () => {
  const controller = useCalendarShellController();
  const {
    calendarRef,
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    events,
    loading,
    error,
    selectedEvent,
    showEventModal,
    isCreatingEvent,
    isEditingEvent,
    setSelectedEvent,
    setIsCreatingEvent,
    setIsEditingEvent,
    resetSelection,
    navigation,
    canAddEvent,
    handleAddEvent,
    handleExportCalendar,
    handleApplySuggestion,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    suggestions,
    hasSuggestions,
    conflicts,
    hasConflicts,
    setUrlState,
    profile,
    user,
  } = controller;

  if (loading) return <CalendarPageSkeleton />;
  if (error) return <CalendarErrorSkeleton message={error} />;

  return (
    <div className="calendar-shell-root space-y-spacing-lg">
      <CalendarHeader
        canAddEvent={canAddEvent}
        onExport={handleExportCalendar}
        onAddEvent={handleAddEvent}
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-spacing-md">
        <div className="lg:col-span-1 space-y-spacing-md">
          <CalendarFiltersPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={() => Promise.resolve()}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <Card className="calendar-card">
            <div className="flex items-center gap-spacing-xs mb-spacing-md">
              <Icon name="bar-chart" size="lg" className="text-navy-600" />
              <span className="Typography typography-label-lg text-text-primary">
                Stats
              </span>
            </div>
            <CalendarStats events={events} />
          </Card>
          {hasSuggestions && (
            <AISuggestionsPanel
              suggestions={suggestions}
              onApplySuggestion={handleApplySuggestion}
            />
          )}
          {hasConflicts && <ConflictsPanel conflicts={conflicts} />}
        </div>
        <div className="lg:col-span-3">
          <Card className="calendar-card">
            <CalendarToolbar
              currentView={navigation.currentView}
              onViewChange={navigation.handleViewChange}
              onToday={() => calendarRef.current?.today()}
              onPrev={() => calendarRef.current?.prev()}
              onNext={() => calendarRef.current?.next()}
            />
            {/* eslint-disable-next-line boxcall-design/no-arbitrary-spacing, boxcall-design/no-raw-tailwind-colors -- FullCalendar requires fixed height */}
            <div className="h-[600px]">
              <BoxCallCalendar
                ref={calendarRef}
                events={events}
                highlightQuery={searchQuery}
                onEventClick={navigation.handleEventClick}
                // FullCalendar DateSelectArg includes additional fields; we only need start/end ISO strings.
                onDateSelect={(arg) =>
                  navigation.handleDateSelect({
                    startStr: arg.startStr,
                    endStr: arg.endStr,
                  })
                }
                editable={
                  profile?.role === "coach" || profile?.role === "admin"
                }
                selectable={
                  profile?.role === "coach" || profile?.role === "admin"
                }
                height="100%"
                initialView={navigation.currentView}
                className="h-full"
              />
            </div>
          </Card>
        </div>
      </div>
      <EventModal
        isOpen={showEventModal && !!selectedEvent}
        onClose={() => {
          resetSelection();
          setUrlState({ event: undefined }, true);
        }}
        event={selectedEvent}
        setEvent={setSelectedEvent}
        isCreating={isCreatingEvent}
        setIsCreating={setIsCreatingEvent}
        isEditing={isEditingEvent}
        setIsEditing={setIsEditingEvent}
        profile={profile}
        userId={user?.id}
        createEventMutation={createEventMutation}
        updateEventMutation={updateEventMutation}
        deleteEventMutation={deleteEventMutation}
        onOpenPracticePlanner={() => {
          /* future practice planner integration */
        }}
      />
    </div>
  );
};

export default CalendarShell;
