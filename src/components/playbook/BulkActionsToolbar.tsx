import React from "react";
import { Trash2, Tag, Download, Plus, Copy, Edit3, X } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkAction,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50">
      <div className="flex items-center space-x-4">
        {/* Selection Count */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-900">
            {selectedCount} play{selectedCount !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200"></div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onBulkAction("add-tags")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
            title="Add tags to selected plays"
          >
            <Tag className="h-4 w-4" />
            <span>Tag</span>
          </button>

          <button
            onClick={() => onBulkAction("duplicate")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
            title="Duplicate selected plays"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => onBulkAction("add-to-practice")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-jade-600 hover:text-jade-700 hover:bg-jade-50 rounded transition-colors"
            title="Add to practice script"
          >
            <Plus className="h-4 w-4" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => onBulkAction("batch-edit")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Batch edit properties"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onBulkAction("export")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
            title="Export selected plays"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200"></div>

          <button
            onClick={() => onBulkAction("delete")}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete selected plays"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
