/**
 * Practice Script PDF Service
 *
 * Specialized PDF service for generating practice script documents.
 * Handles practice planning exports with timeline visualization.
 */

import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { BasePDFService, PDFServiceFactory } from "./BasePDFService";
import type {
  PracticeScriptPDFData,
  PDFExportOptions,
  PDFBranding,
} from "./types";
import { PDFError } from "./types";
import {
  PDFBaseStyles,
  PDFColors,
  getCategoryColor,
  formatTimeForPDF,
} from "./styles";

export class PracticeScriptPDFService extends BasePDFService {
  /**
   * Export practice script to PDF blob
   */
  async exportToPDF(
    data: PracticeScriptPDFData,
    options: PDFExportOptions
  ): Promise<Blob> {
    this.validateOptions(options);
    this.validatePracticeData(data);

    const document = this.createPracticeDocument(data, options);
    return await this.generateBlob(document);
  }

  /**
   * Download practice script as PDF file
   */
  async downloadPDF(
    data: PracticeScriptPDFData,
    filename: string,
    options: PDFExportOptions
  ): Promise<void> {
    const blob = await this.exportToPDF(data, options);
    const finalFilename =
      filename ||
      this.generateFilename(`practice_${data.title.replace(/\s+/g, "_")}`);
    this.downloadBlob(blob, finalFilename);
  }

  /**
   * Generate preview URL for practice script PDF
   */
  async previewPDF(
    data: PracticeScriptPDFData,
    options: PDFExportOptions
  ): Promise<string> {
    const blob = await this.exportToPDF(data, options);
    return URL.createObjectURL(blob);
  }

  /**
   * Validate practice script data
   */
  private validatePracticeData(data: PracticeScriptPDFData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new PDFError(
        "Practice title is required",
        "VALIDATION_ERROR",
        "Title cannot be empty"
      );
    }

    if (!data.practiceBlocks || data.practiceBlocks.length === 0) {
      throw new PDFError(
        "Practice blocks are required",
        "VALIDATION_ERROR",
        "At least one practice block must be provided"
      );
    }

    if (!data.date) {
      throw new PDFError(
        "Practice date is required",
        "VALIDATION_ERROR",
        "Date must be provided"
      );
    }
  }

  /**
   * Create the complete practice document
   */
  private createPracticeDocument(
    data: PracticeScriptPDFData,
    options: PDFExportOptions
  ): React.ReactElement {
    const branding = this.getBranding();
    const template = options.template || this.template;

    return React.createElement(
      Document,
      {
        title: `Practice Script - ${data.title}`,
        author: branding.teamName || "Practice Planner",
        subject: "Practice Script",
        creator: "Practice Planner App",
        producer: "React-PDF",
      },
      React.createElement(
        Page,
        {
          size: template.pageFormat as "A4" | "LETTER" | "LEGAL",
          orientation: template.pageOrientation,
          style: [
            PDFBaseStyles.page,
            {
              margin: template.margins.top,
              marginRight: template.margins.right,
              marginBottom: template.margins.bottom,
              marginLeft: template.margins.left,
            },
          ],
        },
        // Header
        options.includeHeader !== false && this.createHeader(data, branding),

        // Main Content
        React.createElement(
          View,
          { style: PDFBaseStyles.container },
          this.createPracticeInfo(data),
          this.createTimeline(data),
          this.createCoachAssignments(data),
          this.createEquipmentList(data),
          this.createSummaryStats(data)
        ),

        // Footer
        options.includeFooter !== false && this.createFooter(data)
      )
    );
  }

  /**
   * Create document header
   */
  private createHeader(data: PracticeScriptPDFData, branding: PDFBranding) {
    return React.createElement(
      View,
      { style: PDFBaseStyles.header, fixed: true },
      React.createElement(
        View,
        {},
        React.createElement(
          Text,
          { style: PDFBaseStyles.h2 },
          branding.teamName || "Practice Script"
        ),
        React.createElement(
          Text,
          { style: PDFBaseStyles.bodySmall },
          data.title
        )
      ),
      React.createElement(
        View,
        { style: PDFBaseStyles.textRight },
        React.createElement(
          Text,
          { style: PDFBaseStyles.bodySmall },
          data.date
        ),
        React.createElement(
          Text,
          { style: PDFBaseStyles.bodySmall },
          `Duration: ${this.formatDuration(data.duration)}`
        )
      )
    );
  }

  /**
   * Create document footer
   */
  private createFooter(_data: PracticeScriptPDFData) {
    return React.createElement(
      View,
      { style: PDFBaseStyles.footer, fixed: true },
      React.createElement(
        Text,
        {},
        `Generated: ${this.formatDate(new Date(), true)}`
      ),
      React.createElement(Text, {
        render: ({
          pageNumber,
          totalPages,
        }: {
          pageNumber: number;
          totalPages: number;
        }) => `Page ${pageNumber} of ${totalPages}`,
      })
    );
  }

  /**
   * Create practice information section
   */
  private createPracticeInfo(data: PracticeScriptPDFData) {
    return React.createElement(
      View,
      { style: PDFBaseStyles.section },
      React.createElement(
        Text,
        { style: PDFBaseStyles.h3 },
        "Practice Information"
      ),
      React.createElement(
        View,
        { style: PDFBaseStyles.row },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            { style: PDFBaseStyles.body },
            `Date: ${data.date}`
          ),
          React.createElement(
            Text,
            { style: PDFBaseStyles.body },
            `Duration: ${this.formatDuration(data.duration)}`
          )
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            { style: PDFBaseStyles.body },
            `Location: ${data.location}`
          ),
          data.weather &&
            React.createElement(
              Text,
              { style: PDFBaseStyles.body },
              `Weather: ${data.weather}`
            )
        )
      )
    );
  }

  /**
   * Create timeline section with practice blocks
   */
  private createTimeline(data: PracticeScriptPDFData) {
    return React.createElement(
      View,
      { style: PDFBaseStyles.section },
      React.createElement(
        Text,
        { style: PDFBaseStyles.h3 },
        "Practice Timeline"
      ),
      React.createElement(
        View,
        { style: PDFBaseStyles.table },
        // Table Header
        React.createElement(
          View,
          { style: PDFBaseStyles.tableHeader },
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 2 }] },
            "Time"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 3 }] },
            "Activity"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 2 }] },
            "Category"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 1 }] },
            "Duration"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 2 }] },
            "Coach"
          )
        ),

        // Table Rows
        ...data.practiceBlocks.map((block, index) =>
          React.createElement(
            View,
            {
              key: block.id,
              style: [
                PDFBaseStyles.tableRow,
                ...(index % 2 === 1 ? [PDFBaseStyles.tableRowAlt] : []),
              ],
            },
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 2 }] },
              `${block.startTime} - ${block.endTime}`
            ),
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 3 }] },
              block.title
            ),
            React.createElement(
              View,
              { style: [PDFBaseStyles.tableCell, { flex: 2 }] },
              React.createElement(
                View,
                {
                  style: [
                    PDFBaseStyles.badge,
                    { backgroundColor: getCategoryColor(block.category) },
                  ],
                },
                React.createElement(
                  Text,
                  { style: { fontSize: 7, color: PDFColors.white } },
                  block.category
                )
              )
            ),
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 1 }] },
              formatTimeForPDF(block.duration)
            ),
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 2 }] },
              block.assignedCoach || "-"
            )
          )
        )
      )
    );
  }

  /**
   * Create coach assignments section
   */
  private createCoachAssignments(data: PracticeScriptPDFData) {
    if (!data.coaches || data.coaches.length === 0) return null;

    return React.createElement(
      View,
      { style: PDFBaseStyles.section },
      React.createElement(
        Text,
        { style: PDFBaseStyles.h3 },
        "Coach Assignments"
      ),
      React.createElement(
        View,
        { style: PDFBaseStyles.table },
        React.createElement(
          View,
          { style: PDFBaseStyles.tableHeader },
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 2 }] },
            "Coach"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 1 }] },
            "Role"
          ),
          React.createElement(
            Text,
            { style: [PDFBaseStyles.tableCellHeader, { flex: 3 }] },
            "Assignments"
          )
        ),
        ...data.coaches.map((coach, index) =>
          React.createElement(
            View,
            {
              key: coach.id,
              style: [
                PDFBaseStyles.tableRow,
                ...(index % 2 === 1 ? [PDFBaseStyles.tableRowAlt] : []),
              ],
            },
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 2 }] },
              coach.name
            ),
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 1 }] },
              coach.role
            ),
            React.createElement(
              Text,
              { style: [PDFBaseStyles.tableCell, { flex: 3 }] },
              coach.assignments?.join(", ") || "-"
            )
          )
        )
      )
    );
  }

  /**
   * Create equipment list section
   */
  private createEquipmentList(data: PracticeScriptPDFData) {
    if (!data.equipment || data.equipment.length === 0) return null;

    return React.createElement(
      View,
      { style: PDFBaseStyles.section },
      React.createElement(
        Text,
        { style: PDFBaseStyles.h3 },
        "Equipment Needed"
      ),
      React.createElement(
        View,
        { style: PDFBaseStyles.list },
        ...data.equipment.map((item, index) =>
          React.createElement(
            View,
            { key: index, style: PDFBaseStyles.listItem },
            React.createElement(Text, { style: PDFBaseStyles.listBullet }, "•"),
            React.createElement(
              Text,
              { style: PDFBaseStyles.listContent },
              `${item.item}${item.quantity ? ` (${item.quantity})` : ""}${item.location ? ` - ${item.location}` : ""}`
            )
          )
        )
      )
    );
  }

  /**
   * Create summary statistics section
   */
  private createSummaryStats(data: PracticeScriptPDFData) {
    if (!data.summary) return null;

    return React.createElement(
      View,
      { style: PDFBaseStyles.section },
      React.createElement(
        Text,
        { style: PDFBaseStyles.h3 },
        "Practice Summary"
      ),

      React.createElement(
        View,
        { style: PDFBaseStyles.row },
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            { style: PDFBaseStyles.h4 },
            "Time Breakdown"
          ),
          ...Object.entries(data.summary.categoryBreakdown).map(
            ([category, minutes]) =>
              React.createElement(
                View,
                { key: category, style: PDFBaseStyles.row },
                React.createElement(
                  Text,
                  { style: [PDFBaseStyles.bodySmall, { flex: 1 }] },
                  `${category}:`
                ),
                React.createElement(
                  Text,
                  { style: PDFBaseStyles.bodySmall },
                  formatTimeForPDF(minutes)
                )
              )
          )
        ),

        data.summary.objectives &&
          React.createElement(
            View,
            { style: { flex: 1 } },
            React.createElement(
              Text,
              { style: PDFBaseStyles.h4 },
              "Objectives"
            ),
            React.createElement(
              View,
              { style: PDFBaseStyles.list },
              ...data.summary.objectives.map((objective, index) =>
                React.createElement(
                  View,
                  { key: index, style: PDFBaseStyles.listItem },
                  React.createElement(
                    Text,
                    { style: PDFBaseStyles.listBullet },
                    "•"
                  ),
                  React.createElement(
                    Text,
                    { style: PDFBaseStyles.listContent },
                    objective
                  )
                )
              )
            )
          )
      )
    );
  }
}

// Register the service with the factory
PDFServiceFactory.registerService("practice-script", PracticeScriptPDFService);
