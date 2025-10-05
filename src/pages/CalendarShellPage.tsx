import { CalendarShell } from "../components/calendar/CalendarShell";
import { Aurora } from "../components/ui/Aurora";

export default function CalendarShellPage() {
  return (
    <Aurora variant="minimal" fullHeight>
      <CalendarShell />
    </Aurora>
  );
}
