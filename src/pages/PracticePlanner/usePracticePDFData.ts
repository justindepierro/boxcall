import { format } from "date-fns";
import type { PracticeBlock, PracticeSchedule } from "../../types/practice";

interface UsePracticePDFDataProps {
  selectedSchedule: PracticeSchedule | undefined;
  currentBlocks: PracticeBlock[];
}

export function usePracticePDFData({
  selectedSchedule,
  currentBlocks,
}: UsePracticePDFDataProps) {
  const preparePracticeDataForPDF = () => {
    if (!selectedSchedule) return null;

    // Convert practice blocks to PDF format and categorize them
    const pdfBlocks = currentBlocks.map((block) => {
      // Infer category from title/description or default to 'meeting'
      let category:
        | "offense"
        | "defense"
        | "special-teams"
        | "meeting"
        | "weight-room"
        | "transition"
        | "break" = "meeting";

      const titleLower = block.title.toLowerCase();
      const descLower = (block.description || "").toLowerCase();
      const combined = `${titleLower} ${descLower}`;

      if (combined.includes("offense") || combined.includes("offensive")) {
        category = "offense";
      } else if (
        combined.includes("defense") ||
        combined.includes("defensive")
      ) {
        category = "defense";
      } else if (combined.includes("special") || combined.includes("st ")) {
        category = "special-teams";
      } else if (combined.includes("weight") || combined.includes("strength")) {
        category = "weight-room";
      } else if (
        combined.includes("transition") ||
        combined.includes("break")
      ) {
        category = "transition";
      }

      return {
        id: block.id,
        title: block.title,
        category,
        duration: block.duration,
        startTime: block.startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: block.endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        location: "",
        notes: block.notes || "",
        assignedCoach: "",
        scriptId: block.practiceScriptId,
        scriptTitle: block.practiceScriptId ? "Practice Script" : undefined,
      };
    });

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {};
    pdfBlocks.forEach((block) => {
      categoryBreakdown[block.category] =
        (categoryBreakdown[block.category] || 0) + block.duration;
    });

    return {
      title: selectedSchedule.title || "Practice Plan",
      date: format(selectedSchedule.date, "MMM d, yyyy"),
      duration: currentBlocks.reduce((sum, block) => sum + block.duration, 0),
      location: selectedSchedule.location,
      weather: undefined, // Could be added from weather data if available
      blocks: pdfBlocks,
      coaches: [
        // Mock coach data - in real app this would come from team data
        {
          id: "1",
          name: "Head Coach",
          role: "Head Coach",
          assignments: ["Overall direction"],
        },
        {
          id: "2",
          name: "Offensive Coordinator",
          role: "OC",
          assignments: ["Offense blocks"],
        },
        {
          id: "3",
          name: "Defensive Coordinator",
          role: "DC",
          assignments: ["Defense blocks"],
        },
        {
          id: "4",
          name: "Special Teams Coach",
          role: "STC",
          assignments: ["Special teams"],
        },
      ],
      equipment: [
        // Mock equipment data - could be extracted from block notes or separate equipment list
        { item: "Cones", quantity: 20, location: "Equipment shed" },
        { item: "Footballs", quantity: 10, location: "Equipment room" },
        { item: "Blocking pads", quantity: 8, location: "Field storage" },
      ],
      summary: {
        categoryBreakdown,
        objectives: [
          "Improve offensive line blocking",
          "Practice red zone defense",
          "Special teams coordination",
        ],
      },
    };
  };

  return {
    preparePracticeDataForPDF,
  };
}
