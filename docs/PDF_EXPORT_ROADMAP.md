# 📄 PDF Export for Practice Scripts - Implementation Roadmap

## 🎯 Overview

Transform digital practice planning into professional, printable PDF documents that coaches can use on the field, share with staff, and archive for records.

## Phase 1: Dependencies & Setup

### Primary PDF Library Options

1. **@react-pdf/renderer** (Recommended)
   - React-native syntax for PDF generation
   - Great for complex layouts with components
   - Server-side rendering support

2. **jsPDF** (Alternative)
   - Simple API, smaller bundle
   - Better for basic layouts

3. **Puppeteer** (Server-side only)
   - HTML to PDF conversion
   - Requires backend infrastructure

### Recommended Stack

```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf
```

## Phase 2: Data Structure Analysis

### Current Practice Data to Export

```typescript
interface PracticeExportData {
  // Basic Info
  title: string;
  date: string;
  duration: number;
  location: string;

  // Timeline/Blocks
  practiceBlocks: PracticeBlock[];

  // Scripts & Details
  scripts: {
    blockId: string;
    groupId?: string;
    title: string;
    content: string;
    duration: number;
  }[];

  // Team/Groups
  groups: PracticeGroup[];
  coaches: CoachAssignment[];
}
```

## Phase 3: PDF Layout Design

### Professional Practice Script Layout

```
┌─────────────────────────────────────────┐
│  TEAM LOGO    PRACTICE SCRIPT    DATE   │
├─────────────────────────────────────────┤
│  Practice: vs. [Opponent] - [Duration]  │
│  Location: [Field/Facility]             │
│  Coaches: [Assigned Coaches]            │
├─────────────────────────────────────────┤
│  📅 TIMELINE OVERVIEW                   │
│  ┌───┬────┬─────────────────────────────┐│
│  │ T │Cat │ Activity                    ││
│  ├───┼────┼─────────────────────────────┤│
│  │3:00│MTG │Team Meeting - Objectives   ││
│  │3:15│OFF │Installation Practice       ││
│  └───┴────┴─────────────────────────────┘│
├─────────────────────────────────────────┤
│  📋 DETAILED SCRIPT                     │
│  [Block-by-block with scripts, times,  │
│   group assignments, coaching notes]    │
├─────────────────────────────────────────┤
│  📊 PRACTICE SUMMARY                    │
│  • Total Time: 120 minutes             │
│  • Offense: 45 min | Defense: 35 min   │
│  • Special Teams: 20 min | Other: 20   │
└─────────────────────────────────────────┘
```

## Phase 4: Implementation Strategy

### Step 1: Create PDF Components

```typescript
// src/components/practice/pdf/
├── PracticePDF.tsx           // Main PDF document
├── PDFHeader.tsx             // Header with logo/title
├── PDFTimeline.tsx           // Timeline overview table
├── PDFDetailedScript.tsx     // Block-by-block details
├── PDFSummary.tsx            // Statistics summary
└── PDFStyles.ts              // Shared styles
```

### Step 2: Export Service

```typescript
// src/services/pdfExportService.ts
export class PracticeScriptPDFExporter {
  async generatePDF(practiceData: PracticeExportData): Promise<Blob>;
  async downloadPDF(practiceData: PracticeExportData, filename: string);
  async printPDF(practiceData: PracticeExportData);
}
```

### Step 3: UI Integration

```typescript
// Add to PracticePlannerModalNew
<Button
  onClick={() => exportToPDF(practiceData)}
  variant="outline"
  size="sm"
>
  📄 Export PDF
</Button>
```

## Phase 5: Advanced Features

### Phase 5.1: Multi-Format Support

- Print-optimized version (B&W, condensed)
- Coach card format (pocket-sized)
- Player handout version (simplified)

### Phase 5.2: Template System

```typescript
interface PDFTemplate {
  id: string;
  name: string;
  layout: "standard" | "condensed" | "detailed";
  includeScripts: boolean;
  includeTimeline: boolean;
  pageOrientation: "portrait" | "landscape";
}
```

### Phase 5.3: Branding & Customization

- Team logo upload
- Custom color schemes
- Watermarks
- Coach signature blocks

## Phase 6: Technical Implementation Details

### PDF Component Example

```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const PracticePDF = ({ practiceData }: { practiceData: PracticeExportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader practiceData={practiceData} />
      <PDFTimeline blocks={practiceData.practiceBlocks} />
      <PDFDetailedScript
        blocks={practiceData.practiceBlocks}
        scripts={practiceData.scripts}
      />
      <PDFSummary practiceData={practiceData} />
    </Page>
  </Document>
);
```

### Export Hook

```typescript
const usePDFExport = () => {
  const exportPracticeScript = useCallback(async (practiceData: PracticeExportData) => {
    const blob = await pdf(<PracticePDF practiceData={practiceData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `practice-script-${practiceData.date}.pdf`;
    link.click();
  }, []);

  return { exportPracticeScript };
};
```

## Implementation Timeline

| Week       | Focus                                   | Deliverables                        |
| ---------- | --------------------------------------- | ----------------------------------- |
| **Week 1** | Setup dependencies, basic PDF structure | PDF generation working              |
| **Week 2** | Timeline overview and header components | Professional header, timeline table |
| **Week 3** | Detailed script section with formatting | Block-by-block script details       |
| **Week 4** | Summary stats and UI integration        | Complete PDF with export button     |
| **Week 5** | Template system and advanced formatting | Multiple template options           |
| **Week 6** | Polish, testing, and deployment         | Production-ready feature            |

## Benefits of This Approach

✅ **Professional Output**: Clean, printable practice scripts  
✅ **Coaching Workflow**: Easy to bring to field, share with staff  
✅ **Customizable**: Different formats for different needs  
✅ **Brand Consistent**: Team logos and colors  
✅ **Archive Ready**: PDF files for season records

## Example PDF Sections

### 1. Header Section

- Team logo and branding
- Practice title and date
- Duration and location
- Weather conditions (if applicable)

### 2. Timeline Overview

- Minute-by-minute breakdown
- Category color coding
- Coach assignments
- Equipment needs

### 3. Detailed Script Blocks

```
🏈 OFFENSE INSTALLATION (3:15 PM - 3:45 PM)
Duration: 30 minutes
Groups: Varsity Offense
Coaches: Coach Smith (OC), Coach Johnson (QB)
Equipment: Cones, Practice jerseys

Script:
- Review new play concepts (5 min)
- Walkthrough formation alignments (10 min)
- Live drill execution (15 min)

Notes: Focus on timing and precision
```

### 4. Practice Summary

- Total time allocation by category
- Coach utilization
- Equipment checklist
- Key objectives achieved

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install @react-pdf/renderer
   ```

2. **Create Basic PDF Structure**

   ```typescript
   // Start with simple Document/Page layout
   ```

3. **Add Export Button**

   ```typescript
   // Integrate into existing practice planner
   ```

4. **Iterate on Layout**
   ```typescript
   // Refine based on coach feedback
   ```

This roadmap provides a comprehensive path to creating professional PDF exports that will significantly enhance the coaching workflow and make the digital practice planner even more valuable! 🚀
