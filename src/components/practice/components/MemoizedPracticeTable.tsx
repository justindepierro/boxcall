import { Typography } from "../../design-system/Typography";
/**
 * Memoized Practice Block Table
 *
 * High-performance table component with React.memo optimization
 * Prevents unnecessary re-renders when practice data hasn't changed
 */
import { memo } from "react";
import { Tag, mapCategoryToTagVariant } from "../../ui/Tag";
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

const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  if (Number.isNaN(date.getTime())) return timeString; // fallback for invalid
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};

// Memoized row component to prevent unnecessary re-renders
const PracticeBlockRow = memo<{
  block: PracticeBlock;
  onEdit: (block: PracticeBlock) => void;
  onDelete: (blockId: string) => void;
  onDuplicate: (block: PracticeBlock) => void;
}>(({ block, onEdit, onDelete, onDuplicate }) => {
  return (
    <tr className="surface-subtle-hover transition-colors">
      <td className="px-4 py-3 text-sm text-text-secondary">
        {formatTime(block.startTime)} - {formatTime(block.endTime)}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-text-primary">
        {block.duration} min
      </td>
      <td className="px-4 py-3">
        <Tag variant={mapCategoryToTagVariant(block.category)} size="sm">
          {block.category}
        </Tag>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-text-primary">
        {block.title}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {block.location}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {block.assignedCoach || "Unassigned"}
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">
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
      <div className="surface-card rounded-lg shadow overflow-hidden border-subtle">
        <div className="px-4 py-3 surface-subtle border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-text-primary"
            >
              Practice Blocks
            </Typography>
            <span className="text-sm text-text-secondary">
              {blocks.length} blocks • {totalHours}h {totalMinutes}m total
            </span>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted">
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
            <table className="min-w-full divide-y divide-subtle">
              <thead className="surface-subtle">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Time</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Duration</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Category</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Title</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Location</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Coach</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Notes</Typography>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Typography variant="label-md" as="div" className="text-text-muted">Actions</Typography>
                  </th>
                </tr>
              </thead>
              <tbody className="surface-card divide-y divide-subtle">
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
