import { forwardRef, useImperativeHandle, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { 
  EventClickArg, 
  DateSelectArg, 
  EventDropArg,
  CalendarApi 
} from '@fullcalendar/core';
import type { CalendarEvent } from '../../services/calendarService';

interface BoxCallCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventDrop?: (dropInfo: EventDropArg) => void;
  editable?: boolean;
  selectable?: boolean;
  height?: string | number;
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  className?: string;
}

export interface BoxCallCalendarRef {
  getApi: () => CalendarApi | null;
  changeView: (viewName: string) => void;
  today: () => void;
  prev: () => void;
  next: () => void;
}

/**
 * BoxCallCalendar Component
 * 
 * A FullCalendar wrapper component styled for BoxCall's design system
 * Handles event display, interaction, and responsive design
 */
export const BoxCallCalendar = forwardRef<BoxCallCalendarRef, BoxCallCalendarProps>(({
  events,
  onEventClick,
  onDateSelect,
  onEventDrop,
  editable = false,
  selectable = false,
  height = 'auto',
  initialView = 'dayGridMonth',
  className = '',
}, ref) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Expose calendar API methods through ref
  useImperativeHandle(ref, () => ({
    getApi: () => calendarRef.current?.getApi() || null,
    changeView: (viewName: string) => {
      const api = calendarRef.current?.getApi();
      if (api) api.changeView(viewName);
    },
    today: () => {
      const api = calendarRef.current?.getApi();
      if (api) api.today();
    },
    prev: () => {
      const api = calendarRef.current?.getApi();
      if (api) api.prev();
    },
    next: () => {
      const api = calendarRef.current?.getApi();
      if (api) api.next();
    },
  }));

  // Convert CalendarEvent to FullCalendar format
  const fullCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: getEventColor(event.type),
    borderColor: getEventColor(event.type),
    textColor: '#FFFFFF',
    extendedProps: {
      type: event.type,
      team_id: event.team_id,
      team_name: event.team_name,
      location: event.location,
      description: event.description,
      is_home: event.is_home,
      opponent: event.opponent,
      rsvp_required: event.rsvp_required,
      tags: event.tags,
    },
  }));

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    if (onEventClick) {
      const originalEvent = events.find(e => e.id === clickInfo.event.id);
      if (originalEvent) {
        onEventClick(originalEvent);
      }
    }
  };

  // Handle date selection
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = (dropInfo: EventDropArg) => {
    if (onEventDrop) {
      onEventDrop(dropInfo);
    }
  };

  return (
    <div className={`boxcall-calendar ${className}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={fullCalendarEvents}
        editable={editable}
        selectable={selectable}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height={height}
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        // BoxCall styling
        themeSystem="standard"
        eventDisplay="block"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        // Responsive settings
        aspectRatio={1.35}
        handleWindowResize={true}
        // Custom styling
        eventClassNames={(arg) => {
          const type = arg.event.extendedProps.type;
          return [`event-${type}`, 'boxcall-event'];
        }}
      />
    </div>
  );
});

/**
 * Get event color based on event type
 */
function getEventColor(type: string): string {
  switch (type) {
    case 'game':
      return '#1E3A8A'; // Navy Blue
    case 'practice':
      return '#00A86B'; // Jade Green
    case 'meeting':
      return '#F59E0B'; // Amber
    case 'film':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

BoxCallCalendar.displayName = 'BoxCallCalendar';