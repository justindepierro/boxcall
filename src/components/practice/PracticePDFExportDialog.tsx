/**
 * Practice PDF Export Dialog
 *
 * Advanced PDF export dialog with customizable options for practice plans.
 * Includes category filters, content options, and export settings.
 */
import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Modal } from "../ui/Modal/Modal";
import { Typography } from "../design-system/Typography";
import { usePracticeScriptPDF } from "@services/pdf/usePracticeScriptPDF";
import { markFirstScriptExport } from "../onboarding/activationHelpers";
import type { PracticeBlock } from "./types";
import { logError } from "../../utils/logger";

interface PDFExportOptions {
  includeEverything: boolean;
  includeOffense: boolean;
  includeDefense: boolean;
  includeSpecial: boolean;
  addScripts: boolean;
  addNotes: boolean;
}
interface PracticePDFExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  practiceData: {
    title?: string;
    date?: string;
    duration?: number;
    location?: string;
    weather?: string;
    blocks?: PracticeBlock[];
    coaches?: Array<{
      id: string;
      name: string;
      role: string;
      assignments?: string[];
    }>;
    equipment?: Array<{
      item: string;
      quantity?: number;
      location?: string;
    }>;
    summary?: {
      categoryBreakdown: Record<string, number>;
      objectives?: string[];
    };
  };
}

const getFilteredPracticeBlocks = (
  blocks: PracticeBlock[] | undefined,
  exportOptions: PDFExportOptions
): PracticeBlock[] => {
  if (!blocks) return [];
  if (exportOptions.includeEverything) return blocks;

  return blocks.filter((block) => {
    switch (block.category) {
      case "offense":
        return exportOptions.includeOffense;
      case "defense":
        return exportOptions.includeDefense;
      case "special-teams":
        return exportOptions.includeSpecial;
      default:
        return true;
    }
  });
};

const processPracticeDataForExport = (params: {
  practiceData: PracticePDFExportDialogProps["practiceData"];
  exportOptions: PDFExportOptions;
}) => {
  const { practiceData, exportOptions } = params;
  const filteredBlocks = getFilteredPracticeBlocks(
    practiceData.blocks,
    exportOptions
  );

  const categoryBreakdown: Record<string, number> = {};
  let totalMinutes = 0;
  const coachUtilization: Record<string, number> = {};

  filteredBlocks.forEach((block) => {
    const category = block.category || "other";
    categoryBreakdown[category] =
      (categoryBreakdown[category] || 0) + block.duration;
    totalMinutes += block.duration;

    if (block.assignedCoach) {
      coachUtilization[block.assignedCoach] =
        (coachUtilization[block.assignedCoach] || 0) + block.duration;
    }
  });

  const pdfBlocks = filteredBlocks.map((block) => ({
    id: block.id,
    title: block.title,
    category: block.category,
    duration: block.duration,
    startTime: block.startTime || "",
    endTime: block.endTime || "",
    location: block.location || "",
    notes: exportOptions.addNotes ? block.notes || "" : "",
    assignedCoach: block.assignedCoach || "",
    scriptId: exportOptions.addScripts ? block.scriptId : undefined,
    scriptTitle: exportOptions.addScripts ? block.scriptTitle : undefined,
    groups: block.groups?.map((group) => ({
      ...group,
      notes: exportOptions.addNotes ? group.notes || "" : "",
      scriptId: exportOptions.addScripts ? group.scriptId : undefined,
      scriptTitle: exportOptions.addScripts ? group.scriptTitle : undefined,
    })),
  }));

  return {
    title: practiceData.title || "Practice Plan",
    date: practiceData.date || new Date().toLocaleDateString(),
    duration: filteredBlocks.reduce((sum, block) => sum + block.duration, 0),
    location: practiceData.location || "",
    weather: practiceData.weather || "",
    practiceBlocks: pdfBlocks,
    coaches: practiceData.coaches || [],
    equipment: practiceData.equipment || [],
    summary: {
      totalMinutes,
      categoryBreakdown,
      coachUtilization,
      objectives: practiceData.summary?.objectives || [],
    },
  };
};

const buildPracticeExportFilename = (params: {
  practiceData: PracticePDFExportDialogProps["practiceData"];
  exportOptions: PDFExportOptions;
}) => {
  const { practiceData, exportOptions } = params;
  const filenameParts = ["practice"];

  if (practiceData.title) {
    filenameParts.push(practiceData.title.replace(/\s+/g, "_"));
  }
  if (practiceData.date) {
    filenameParts.push(practiceData.date.replace(/\//g, "-"));
  }

  if (!exportOptions.includeEverything) {
    const categories = [];
    if (exportOptions.includeOffense) categories.push("offense");
    if (exportOptions.includeDefense) categories.push("defense");
    if (exportOptions.includeSpecial) categories.push("special");
    if (categories.length > 0) {
      filenameParts.push(categories.join("_"));
    }
  }

  return `${filenameParts.join("_")}.pdf`;
};

const toggleExportOption = (
  prev: PDFExportOptions,
  option: keyof PDFExportOptions
): PDFExportOptions => {
  const newOptions = { ...prev, [option]: !prev[option] };

  if (option === "includeEverything" && !prev.includeEverything) {
    newOptions.includeOffense = false;
    newOptions.includeDefense = false;
    newOptions.includeSpecial = false;
  }

  if (
    ["includeOffense", "includeDefense", "includeSpecial"].includes(option) &&
    !prev[option]
  ) {
    newOptions.includeEverything = false;
  }

  return newOptions;
};

const getSelectedCategoriesText = (exportOptions: PDFExportOptions) => {
  if (exportOptions.includeEverything) return "All categories";
  const categories = [];
  if (exportOptions.includeOffense) categories.push("Offense");
  if (exportOptions.includeDefense) categories.push("Defense");
  if (exportOptions.includeSpecial) categories.push("Special Teams");
  if (categories.length === 0) return "Meeting, Weight Room, Transitions only";
  return `${categories.join(", ")} + General activities`;
};

interface PracticePDFExportDialogContentProps {
  practiceData: PracticePDFExportDialogProps["practiceData"];
  exportOptions: PDFExportOptions;
  filteredBlocksCount: number;
  selectedCategoriesText: string;
  isExporting: boolean;
  onClose: () => void;
  onExport: () => void;
  onOptionChange: (option: keyof PDFExportOptions) => void;
}

const PracticePDFExportDialogContent: React.FC<
  PracticePDFExportDialogContentProps
> = ({
  practiceData,
  exportOptions,
  filteredBlocksCount,
  selectedCategoriesText,
  isExporting,
  onClose,
  onExport,
  onOptionChange,
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Icon name="file" size="xl" className="text-secondary" />
        <div>
          <Typography variant="headline-md" className="text-navy-900">
            Print Practice to PDF
          </Typography>
          <Typography variant="body-sm" color="muted">
            Customize your practice plan export
          </Typography>
        </div>
      </div>

      <div className="bg-subtle rounded-lg p-4 mb-6">
        <Typography variant="body-sm" className="font-medium text-primary mb-2">
          Practice Details:
        </Typography>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Title:</span>{" "}
            {practiceData.title || "Practice Plan"}
          </div>
          <div>
            <span className="font-medium">Date:</span>{" "}
            {practiceData.date || "Today"}
          </div>
          <div>
            <span className="font-medium">Duration:</span>{" "}
            {practiceData.duration || 0} minutes
          </div>
          <div>
            <span className="font-medium">Blocks:</span>{" "}
            {practiceData.blocks?.length || 0}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Typography
            variant="body-md"
            className="font-medium text-primary mb-3"
          >
            Select Categories to Include:
          </Typography>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeEverything}
                onChange={() => onOptionChange("includeEverything")}
                className="h-4 w-4 focus:ring-jade-500 border-secondary rounded-lg"
              />
              <Typography variant="body-sm" as="span" className="font-medium">
                Everything
              </Typography>
              <span className="text-xs text-muted">
                (All practice blocks and activities)
              </span>
            </label>
            <div className="ml-4 space-y-2 border-l-2 border-muted pl-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeOffense}
                  onChange={() => onOptionChange("includeOffense")}
                  disabled={exportOptions.includeEverything}
                  className="h-4 w-4 focus:ring-jade-500 border-secondary rounded-lg disabled:opacity-50"
                />
                <span className="text-sm">Offense</span>
                <span className="px-2 py-1 bg-info/20 text-info text-xs rounded-lg">
                  <Icon name="award" className="w-4 h-4 inline" /> Offensive
                  drills and plays
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDefense}
                  onChange={() => onOptionChange("includeDefense")}
                  disabled={exportOptions.includeEverything}
                  className="h-4 w-4 focus:ring-text-error border-secondary rounded-lg disabled:opacity-50"
                />
                <span className="text-sm">Defense</span>
                <span className="px-2 py-1 bg-surface-error text-error text-xs rounded-lg">
                  <Icon name="shield" className="w-4 h-4 inline" /> Defensive
                  drills and schemes
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeSpecial}
                  onChange={() => onOptionChange("includeSpecial")}
                  disabled={exportOptions.includeEverything}
                  className="h-4 w-4 focus:ring-text-success border-secondary rounded-lg disabled:opacity-50"
                />
                <span className="text-sm">Special Teams</span>
                <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-lg">
                  <Icon name="zap" className="w-4 h-4 inline" /> Special teams
                  plays
                </span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <Typography
            variant="body-md"
            className="font-medium text-primary mb-3"
          >
            Additional Content:
          </Typography>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.addScripts}
                onChange={() => onOptionChange("addScripts")}
                className="h-4 w-4 focus:ring-jade-500 border-secondary rounded-lg"
              />
              <span className="text-sm">Add Scripts</span>
              <span className="text-xs text-muted">
                (Include attached practice scripts and play sheets)
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.addNotes}
                onChange={() => onOptionChange("addNotes")}
                className="h-4 w-4 focus:ring-jade-500 border-secondary rounded-lg"
              />
              <span className="text-sm">Add Notes</span>
              <span className="text-xs text-muted">
                (Include coach notes and block instructions)
              </span>
            </label>
          </div>
        </div>

        <div className="bg-subtle border border-muted rounded-lg p-4">
          <Typography variant="body-sm" className="font-medium text-info mb-2">
            Export Preview:
          </Typography>
          <div className="text-sm text-info">
            <div>
              <Icon name="file" size="xs" className="inline" />{" "}
              <strong>Categories:</strong> {selectedCategoriesText}
            </div>
            <div className="mt-1">
              <Icon name="file" size="xs" className="inline" />{" "}
              <strong>Content:</strong> Basic timeline
              {exportOptions.addScripts && ", Practice scripts"}
              {exportOptions.addNotes && ", Coach notes"}
            </div>
            <div className="mt-1">
              <Icon name="award" className="w-4 h-4 inline" />{" "}
              <strong>Blocks to export:</strong> {filteredBlocksCount} of{" "}
              {practiceData.blocks?.length || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <Button variant="ghost" onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onExport}
          disabled={isExporting || filteredBlocksCount === 0}
        >
          {isExporting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bg-primary"></div>
              <span>Generating PDF...</span>
            </div>
          ) : (
            <>
              <Icon name="file" size="sm" className="inline mr-1" /> Export to
              PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const PracticePDFExportDialog: React.FC<
  PracticePDFExportDialogProps
> = ({ isOpen, onClose, practiceData }) => {
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>({
    includeEverything: true,
    includeOffense: false,
    includeDefense: false,
    includeSpecial: false,
    addScripts: true,
    addNotes: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { downloadPDF } = usePracticeScriptPDF();

  const filteredBlocks = getFilteredPracticeBlocks(
    practiceData.blocks,
    exportOptions
  );

  const selectedCategoriesText = getSelectedCategoriesText(exportOptions);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const processedData = processPracticeDataForExport({
        practiceData,
        exportOptions,
      });

      const filename = buildPracticeExportFilename({
        practiceData,
        exportOptions,
      });

      await downloadPDF(processedData, filename, {
        format: "Letter",
        orientation: "portrait",
        template: {
          pageFormat: "Letter",
          pageOrientation: "portrait",
          margins: { top: 40, right: 40, bottom: 40, left: 40 },
        },
        includeHeader: true,
        includeFooter: true,
      });
      // Activation: mark first script export
      markFirstScriptExport(filename);
      onClose();
    } catch (error) {
      logError("PDF export failed:", error);
      // You could add error handling/notification here
    } finally {
      setIsExporting(false);
    }
  };
  const handleOptionChange = (option: keyof PDFExportOptions) => {
    setExportOptions((prev) => toggleExportOption(prev, option));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <PracticePDFExportDialogContent
        practiceData={practiceData}
        exportOptions={exportOptions}
        filteredBlocksCount={filteredBlocks.length}
        selectedCategoriesText={selectedCategoriesText}
        isExporting={isExporting}
        onClose={onClose}
        onExport={handleExport}
        onOptionChange={handleOptionChange}
      />
    </Modal>
  );
};
