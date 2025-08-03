/**
 * PDF Export Demo Component
 * 
 * Simple demonstration component showing how to integrate
 * PDF export functionality with the practice planner.
 */

import React from 'react';
import { 
  usePracticeScriptPDF, 
  convertPracticeStateToPDFData,
  generatePracticeScriptFilename,
  getDefaultPracticeScriptPDFOptions 
} from '../../services/pdf/usePracticeScriptPDF';

interface PDFExportDemoProps {
  practiceData?: {
    title?: string;
    date?: string;
    duration?: number;
    location?: string;
    weather?: string;
    blocks?: Array<{
      id: string;
      title: string;
      category: string;
      startTime?: string;
      endTime?: string;
      duration: number;
      location?: string;
      notes?: string;
      assignedCoach?: string;
      groups?: unknown[];
      scripts?: unknown[];
    }>;
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
      totalMinutes: number;
      categoryBreakdown: Record<string, number>;
      objectives?: string[];
    };
  };
  className?: string;
}

export const PDFExportDemo: React.FC<PDFExportDemoProps> = ({ 
  practiceData, 
  className = '' 
}) => {
  const { 
    isExporting, 
    error, 
    downloadPDF, 
    previewPDF, 
    clearError 
  } = usePracticeScriptPDF();

  // Sample practice data for demo purposes
  const samplePracticeData = practiceData || {
    title: 'Game Week Practice',
    date: '2024-01-15',
    duration: 120,
    location: 'Main Practice Field',
    weather: 'Clear, 72°F',
    blocks: [
      {
        id: '1',
        title: 'Team Meeting',
        category: 'meeting',
        startTime: '3:00 PM',
        endTime: '3:15 PM',
        duration: 15,
        assignedCoach: 'Head Coach',
        notes: 'Game plan review'
      },
      {
        id: '2',
        title: 'Warm-up & Stretching',
        category: 'conditioning',
        startTime: '3:15 PM',
        endTime: '3:30 PM',
        duration: 15,
        assignedCoach: 'Strength Coach',
        notes: 'Dynamic warm-up routine'
      },
      {
        id: '3',
        title: 'Passing Drills',
        category: 'offense',
        startTime: '3:30 PM',
        endTime: '4:00 PM',
        duration: 30,
        assignedCoach: 'Offensive Coordinator',
        notes: '3-step and 5-step drops'
      },
      {
        id: '4',
        title: 'Defensive Coverage',
        category: 'defense',
        startTime: '4:00 PM',
        endTime: '4:30 PM',
        duration: 30,
        assignedCoach: 'Defensive Coordinator',
        notes: 'Zone coverage concepts'
      }
    ],
    coaches: [
      { id: '1', name: 'John Smith', role: 'Head Coach', assignments: ['Team Meeting', 'Game Plan'] },
      { id: '2', name: 'Mike Johnson', role: 'Offensive Coordinator', assignments: ['Passing Drills', 'Red Zone'] },
      { id: '3', name: 'Dave Wilson', role: 'Defensive Coordinator', assignments: ['Defensive Coverage', 'Tackling'] }
    ],
    equipment: [
      { item: 'Football (12)', quantity: 12, location: 'Equipment Room' },
      { item: 'Cones', quantity: 20, location: 'Field Storage' },
      { item: 'Blocking Sleds', quantity: 4, location: 'Field Storage' }
    ],
    summary: {
      totalMinutes: 120,
      categoryBreakdown: {
        'meeting': 15,
        'conditioning': 15,
        'offense': 30,
        'defense': 30,
        'special-teams': 20,
        'break': 10
      },
      objectives: [
        'Perfect red zone execution',
        'Improve third down defense',
        'Work on special teams coverage'
      ]
    }
  };

  const handleDownloadPDF = async () => {
    const pdfData = convertPracticeStateToPDFData(samplePracticeData as Parameters<typeof convertPracticeStateToPDFData>[0]);
    const options = getDefaultPracticeScriptPDFOptions();
    const filename = generatePracticeScriptFilename(
      samplePracticeData.title || 'Practice',
      samplePracticeData.date || new Date().toISOString().split('T')[0]
    );

    await downloadPDF(pdfData, filename, options);
  };

  const handlePreviewPDF = async () => {
    const pdfData = convertPracticeStateToPDFData(samplePracticeData as Parameters<typeof convertPracticeStateToPDFData>[0]);
    const options = getDefaultPracticeScriptPDFOptions();
    
    const previewUrl = await previewPDF(pdfData, options);
    if (previewUrl) {
      // Open preview in a new window
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <div className={`pdf-export-demo space-y-4 p-4 border rounded-lg bg-white ${className}`}>
      <div className="border-b pb-2">
        <h3 className="text-lg font-semibold text-gray-900">PDF Export</h3>
        <p className="text-sm text-gray-600">
          Export practice scripts as professional PDF documents
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex justify-between items-start">
            <div className="text-sm text-red-700">{error}</div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
              aria-label="Clear error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Practice: {samplePracticeData.title}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Date: {samplePracticeData.date}</div>
            <div>Duration: {samplePracticeData.duration} minutes</div>
            <div>Blocks: {samplePracticeData.blocks?.length || 0}</div>
            <div>Coaches: {samplePracticeData.coaches?.length || 0}</div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'Generating...' : 'Download PDF'}
          </button>

          <button
            onClick={handlePreviewPDF}
            disabled={isExporting}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'Loading...' : 'Preview PDF'}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>📄 PDF Features:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Professional formatting with team branding</li>
          <li>Complete timeline with coach assignments</li>
          <li>Equipment lists and practice objectives</li>
          <li>Automatic page numbering and timestamps</li>
        </ul>
      </div>
    </div>
  );
};
