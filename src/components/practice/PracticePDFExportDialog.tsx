/**
 * Practice PDF Export Dialog
 *
 * Advanced PDF export dialog with customizable options for practice plans.
 * Includes category filters, content options, and export settings.
 */
import React, { useState } from "react";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Button/Button";
import { Modal } from "../ui/Modal/Modal";
import { Typography } from "../design-system/Typography";
import { usePracticeScriptPDF } from "@services/pdf/usePracticeScriptPDF";
import { markFirstScriptExport } from "../onboarding/activationHelpers";
import type { PracticeBlock } from "./types";
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
  // Filter practice blocks based on selected options
  const getFilteredBlocks = (): PracticeBlock[] => {
    if (!practiceData.blocks) return [];
    if (exportOptions.includeEverything) {
      return practiceData.blocks;
    }
    return practiceData.blocks.filter((block) => {
      switch (block.category) {
        case "offense":
          return exportOptions.includeOffense;
        case "defense":
          return exportOptions.includeDefense;
        case "special-teams":
          return exportOptions.includeSpecial;
        default:
          // Include non-specific categories like meeting, weight-room, etc.
          return true;
      }
    });
  };
  // Process blocks for PDF generation
  const processPracticeData = () => {
    const filteredBlocks = getFilteredBlocks();
    // Calculate category breakdown for filtered blocks
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
    // Convert blocks to PDF format
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
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const processedData = processPracticeData();
      // Generate filename based on what's included
      const filenameParts = ["practice"];
      if (practiceData.title) {
        filenameParts.push(practiceData.title.replace(/\s+/g, "_"));
      }
      if (practiceData.date) {
        filenameParts.push(practiceData.date.replace(/\//g, "-"));
      }
      // Add category filters to filename
      if (!exportOptions.includeEverything) {
        const categories = [];
        if (exportOptions.includeOffense) categories.push("offense");
        if (exportOptions.includeDefense) categories.push("defense");
        if (exportOptions.includeSpecial) categories.push("special");
        if (categories.length > 0) {
          filenameParts.push(categories.join("_"));
        }
      }
      const filename = `${filenameParts.join("_")}.pdf`;
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
// console.error("PDF export failed:", error);
      // You could add error handling/notification here
    } finally {
      setIsExporting(false);
    }
  };
  const handleOptionChange = (option: keyof PDFExportOptions) => {
    setExportOptions((prev) => {
      const newOptions = { ...prev, [option]: !prev[option] };
      // If "Everything" is checked, uncheck specific categories
      if (option === "includeEverything" && !prev.includeEverything) {
        newOptions.includeOffense = false;
        newOptions.includeDefense = false;
        newOptions.includeSpecial = false;
      }
      // If any specific category is checked, uncheck "Everything"
      if (
        ["includeOffense", "includeDefense", "includeSpecial"].includes(
          option
        ) &&
        !prev[option]
      ) {
        newOptions.includeEverything = false;
      }
      return newOptions;
    });
  };
  const getSelectedCategoriesText = () => {
    if (exportOptions.includeEverything) return "All categories";
    const categories = [];
    if (exportOptions.includeOffense) categories.push("Offense");
    if (exportOptions.includeDefense) categories.push("Defense");
    if (exportOptions.includeSpecial) categories.push("Special Teams");
    if (categories.length === 0)
      return "Meeting, Weight Room, Transitions only";
    return categories.join(", ") + " + General activities";
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bc-card-padding">
        <div className="flex items-center space-x-3 mb-6">
          <Icon name="file" size="xl" className="text-text-secondary" />
          <div>
            <Typography variant="headline-md" className="text-navy-900">
              Print Practice to PDF
            </Typography>
            <Typography variant="body-sm" color="muted">
              Customize your practice plan export
            </Typography>
          </div>
        </div>
        {/* Practice Info Preview */}
        <div className="surface-subtle rounded-lg p-4 mb-6">
          <Typography
            variant="body-sm"
            className="font-medium text-text-primary mb-2"
          >
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
        {/* Export Options */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <Typography
              variant="body-md"
              className="font-medium text-text-primary mb-3"
            >
              Select Categories to Include:
            </Typography>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeEverything}
                  onChange={() => handleOptionChange("includeEverything")}
                  className="h-4 w-4 focus:ring-jade-500 border-gray-300 rounded"
                />
                <Typography variant="body-sm" as="span" className="font-medium">
                  Everything
                </Typography>
                <span className="text-xs text-text-muted">
                  (All practice blocks and activities)
                </span>
              </label>
              <div className="ml-4 space-y-2 border-l-2 border-subtle pl-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeOffense}
                    onChange={() => handleOptionChange("includeOffense")}
                    disabled={exportOptions.includeEverything}
                    className="h-4 w-4 focus:ring-jade-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm">Offense</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    <Icon name="award" className="w-4 h-4 inline" /> Offensive
                    drills and plays
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDefense}
                    onChange={() => handleOptionChange("includeDefense")}
                    disabled={exportOptions.includeEverything}
                    className="h-4 w-4 focus:ring-red-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm">Defense</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    <Icon name="shield" className="w-4 h-4 inline" /> Defensive
                    drills and schemes
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSpecial}
                    onChange={() => handleOptionChange("includeSpecial")}
                    disabled={exportOptions.includeEverything}
                    className="h-4 w-4 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm">Special Teams</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    <Icon name="zap" className="w-4 h-4 inline" /> Special teams
                    plays
                  </span>
                </label>
              </div>
            </div>
          </div>
          {/* Content Options */}
          <div>
            <Typography
              variant="body-md"
              className="font-medium text-text-primary mb-3"
            >
              Additional Content:
            </Typography>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.addScripts}
                  onChange={() => handleOptionChange("addScripts")}
                  className="h-4 w-4 focus:ring-jade-500 border-gray-300 rounded"
                />
                <span className="text-sm">Add Scripts</span>
                <span className="text-xs text-text-muted">
                  (Include attached practice scripts and play sheets)
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.addNotes}
                  onChange={() => handleOptionChange("addNotes")}
                  className="h-4 w-4 focus:ring-jade-500 border-gray-300 rounded"
                />
                <span className="text-sm">Add Notes</span>
                <span className="text-xs text-text-muted">
                  (Include coach notes and block instructions)
                </span>
              </label>
            </div>
          </div>
          {/* Preview Summary */}
          <div className="surface-subtle border border-subtle rounded-lg p-4">
            <Typography
              variant="body-sm"
              className="font-medium text-blue-900 mb-2"
            >
              Export Preview:
            </Typography>
            <div className="text-sm text-blue-800">
              <div>
                <Icon name="file" size="xs" className="inline" />{" "}
                <strong>Categories:</strong> {getSelectedCategoriesText()}
              </div>
              <div className="mt-1">
                <Icon name="file" size="xs" className="inline" />{" "}
                <strong>Content:</strong> Basic timeline
                {exportOptions.addScripts && ", Practice scripts"}
                {exportOptions.addNotes && ", Coach notes"}
              </div>
              <div className="mt-1">
                <Icon name="award" className="w-4 h-4 inline" />{" "}
                <strong>Blocks to export:</strong> {getFilteredBlocks().length}{" "}
                of {practiceData.blocks?.length || 0}
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || getFilteredBlocks().length === 0}
          >
            {isExporting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
    </Modal>
  );
};
