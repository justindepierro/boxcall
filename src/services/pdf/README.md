# PDF Export Service

Professional PDF generation for practice scripts, playbooks, and other football documents.

## Overview

The PDF Export Service provides a modular, reusable system for generating professional PDF documents from practice planning data. Built with React-PDF and designed for extensibility across the entire application.

## Features

- 📄 **Practice Script PDFs**: Complete practice documents with timelines, coach assignments, and equipment lists
- 🎨 **Professional Styling**: Consistent design system with team branding support
- 🔧 **Modular Architecture**: Extensible service pattern for different document types
- 📱 **React Integration**: Easy-to-use hooks and components
- 🚀 **Type-Safe**: Full TypeScript support with comprehensive interfaces
- 🎯 **Error Handling**: Robust error management with detailed feedback

## Quick Start

### Basic Usage

```typescript
import { 
  usePracticeScriptPDF, 
  convertPracticeStateToPDFData 
} from '@/services/pdf/usePracticeScriptPDF';

function PracticeComponent({ practiceData }) {
  const { downloadPDF, isExporting, error } = usePracticeScriptPDF();

  const handleExport = async () => {
    const pdfData = convertPracticeStateToPDFData(practiceData);
    await downloadPDF(pdfData, 'my-practice.pdf');
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Generating...' : 'Export PDF'}
    </button>
  );
}
```

### Advanced Usage

```typescript
import { 
  PDFServiceFactory, 
  PracticeScriptPDFService 
} from '@/services/pdf';

// Create service with custom branding
const service = new PracticeScriptPDFService(
  customTemplate,
  teamBranding
);

// Export with custom options
const blob = await service.exportToPDF(practiceData, {
  format: 'A4',
  orientation: 'portrait',
  includeHeader: true,
  includeFooter: true
});
```

## Architecture

### Service Classes

- **BasePDFService**: Abstract base class for all PDF services
- **PracticeScriptPDFService**: Specialized service for practice scripts
- **PDFServiceFactory**: Factory for creating and managing services

### Data Types

```typescript
interface PracticeScriptPDFData {
  title: string;
  date: string;
  duration: number;
  location: string;
  weather?: string;
  practiceBlocks: PracticeBlock[];
  coaches: Coach[];
  equipment?: Equipment[];
  summary?: PracticeSummary;
}
```

### Style System

- **PDFBaseStyles**: Core styling components
- **PDFColors**: Consistent color palette
- **Category Colors**: Match practice planner categories

## File Structure

```
src/services/pdf/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript interfaces
├── styles.ts                   # Styling system
├── BasePDFService.ts          # Abstract base service
├── PracticeScriptPDFService.ts # Practice script implementation
└── usePracticeScriptPDF.ts    # React integration hook

src/components/pdf/
└── PDFExportDemo.tsx          # Demo component
```

## Integration Guide

### 1. Add PDF Export Button

```typescript
import { usePracticeScriptPDF } from '@/services/pdf/usePracticeScriptPDF';

function PracticeTimeline({ practiceState }) {
  const { downloadPDF, isExporting } = usePracticeScriptPDF();

  const handleExportPDF = async () => {
    const pdfData = convertPracticeStateToPDFData(practiceState);
    await downloadPDF(pdfData, 'practice-script.pdf');
  };

  return (
    <div>
      {/* Your existing timeline component */}
      <button 
        onClick={handleExportPDF}
        disabled={isExporting}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isExporting ? 'Generating PDF...' : 'Export PDF'}
      </button>
    </div>
  );
}
```

### 2. Custom PDF Options

```typescript
const customOptions: PDFExportOptions = {
  format: 'Letter',
  orientation: 'landscape',
  includeHeader: true,
  includeFooter: true,
  includePageNumbers: true,
  branding: {
    teamName: 'Eagles Football',
    teamColors: {
      primary: '#1a472a',
      secondary: '#16a34a',
      accent: '#22c55e'
    }
  }
};

await downloadPDF(pdfData, filename, customOptions);
```

### 3. Error Handling

```typescript
const { downloadPDF, error, clearError } = usePracticeScriptPDF();

// Show error messages
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-3">
    <div className="flex justify-between">
      <span className="text-red-700">{error}</span>
      <button onClick={clearError}>×</button>
    </div>
  </div>
)}
```

## Extending the System

### Adding New Document Types

1. **Create Service Class**

```typescript
export class PlaybookPDFService extends BasePDFService {
  async exportToPDF(data: PlaybookPDFData, options: PDFExportOptions): Promise<Blob> {
    // Implementation
  }
  
  // Other required methods...
}
```

2. **Register Service**

```typescript
PDFServiceFactory.registerService('playbook', PlaybookPDFService);
```

3. **Use Service**

```typescript
const service = PDFServiceFactory.createService('playbook');
const blob = await service.exportToPDF(playbookData, options);
```

### Custom Styling

```typescript
import { PDFBaseStyles, PDFColors } from '@/services/pdf/styles';

const customStyles = StyleSheet.create({
  customSection: {
    ...PDFBaseStyles.section,
    backgroundColor: PDFColors.categories.offense,
    border: `2px solid ${PDFColors.primary}`
  }
});
```

## Troubleshooting

### Common Issues

1. **Page Size Errors**: Ensure page format is 'A4', 'LETTER', or 'LEGAL'
2. **Style Conflicts**: Use React.createElement() instead of JSX in PDF components
3. **Large Documents**: Consider pagination for practices with many blocks

### Performance Tips

- Use React.memo() for PDF components that render frequently
- Implement lazy loading for PDF preview functionality
- Cache generated PDFs for repeated exports

## PDF Output Examples

### Practice Script PDF Contains:

- **Header**: Team name, practice title, date, duration
- **Practice Information**: Date, location, weather, duration
- **Timeline Table**: Time blocks with categories, coaches, durations
- **Coach Assignments**: Detailed role and responsibility breakdown
- **Equipment List**: Required items with quantities and locations
- **Summary Statistics**: Time breakdowns and practice objectives
- **Footer**: Generation timestamp and page numbers

### Professional Features:

- Consistent typography and spacing
- Category color coding (matches app theme)
- Automatic page breaks and pagination
- Professional table layouts
- Team branding integration

## Dependencies

- `@react-pdf/renderer`: Core PDF generation
- `react`: React hooks and components
- TypeScript for type safety

## Future Enhancements

1. **Additional Document Types**
   - Playbook PDFs with play diagrams
   - Game plan PDFs with opponent analysis
   - Player evaluation PDFs

2. **Advanced Features**
   - Custom logo upload
   - Multiple page templates
   - Interactive PDF forms
   - Email integration

3. **Performance Improvements**
   - PDF streaming for large documents
   - Background generation
   - Progressive loading

## Support

For questions or issues with PDF export functionality, please check:

1. TypeScript errors in the console
2. Network errors (PDF generation happens client-side)
3. Browser compatibility (modern browsers required)
4. File system permissions for downloads

The PDF export system is designed to be self-contained and should work reliably across different practice planning scenarios.
