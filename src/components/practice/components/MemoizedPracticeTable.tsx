/**
 * Memoized Practice Block Table
 *
 * High-performance table component with React.memo optimization
 * Prevents unnecessary re-renders when practice data hasn't changed
 */
import { memo } from "react";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";

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

interface PracticeBlockTableProps {
  blocks: PracticeBlock[];
  onEditBlock: (block: PracticeBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (block: PracticeBlock) => void;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    offense: "bg-green-100 text-green-800",
    defense: "bg-red-100 text-red-800",
    "special-teams": "bg-yellow-100 text-yellow-800",
    meeting: "bg-blue-100 text-blue-800",
    "weight-room": "bg-purple-100 text-purple-800",
    conditioning: "bg-orange-100 text-orange-800",
    break: "bg-gray-100 text-gray-800",
    transition: "bg-indigo-100 text-indigo-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

// Memoized row component to prevent unnecessary re-renders
const PracticeBlockRow = memo<{
  block: PracticeBlock;
  onEdit: (block: PracticeBlock) => void;
  onDelete: (blockId: string) => void;
  onDuplicate: (block: PracticeBlock) => void;
}>(({ block, onEdit, onDelete, onDuplicate }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatTime(block.startTime)} - {formatTime(block.endTime)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {block.duration} min
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(block.category)}`}
        >
          {block.category}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {block.title}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{block.location}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {block.assignedCoach || "Unassigned"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {block.notes && block.notes.length > 50
          ? `${block.notes.substring(0, 50)}...`
          : block.notes}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(block)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Icon name="edit" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(block)}
            className="text-green-600 hover:text-green-700"
          >
            <Icon name="copy" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(block.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Icon name="delete" size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
});

PracticeBlockRow.displayName = "PracticeBlockRow";

// Main memoized table component
export const PracticeBlockTable = memo<PracticeBlockTableProps>(
  ({ blocks, onEditBlock, onDeleteBlock, onDuplicateBlock }) => {
    const totalDuration = blocks.reduce(
      (sum, block) => sum + block.duration,
      0
    );
    const totalHours = Math.floor(totalDuration / 60);
    const totalMinutes = totalDuration % 60;

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">
              Practice Blocks
            </h3>
            <span className="text-sm text-gray-600">
              {blocks.length} blocks • {totalHours}h {totalMinutes}m total
            </span>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Icon
              name="calendar"
              size={24}
              className="mx-auto mb-2 opacity-50"
            />
            <p>No practice blocks added yet</p>
            <p className="text-sm">Start building your practice plan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coach
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blocks.map((block) => (
                  <PracticeBlockRow
                    key={block.id}
                    block={block}
                    onEdit={onEditBlock}
                    onDelete={onDeleteBlock}
                    onDuplicate={onDuplicateBlock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
);

PracticeBlockTable.displayName = "PracticeBlockTable";
