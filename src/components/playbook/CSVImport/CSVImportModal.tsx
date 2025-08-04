import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<
    "upload" | "mapping" | "preview" | "complete"
  >("upload");
  const [dragActive, setDragActive] = useState(false);
  if (!isOpen) return null;
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // TODO: Handle file upload
      setStep("mapping");
    }
  };
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Import Plays from CSV
        </h3>
        <p className="text-sm text-slate-600">
          Upload your existing playbook data to get started quickly
        </p>
      </div>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-300 hover:border-slate-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <Upload className="h-12 w-12 text-slate-400 mx-auto" />
          <div>
            <p className="text-slate-600">
              Drag and drop your CSV file here, or{" "}
              <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium">
                browse to upload
                <input type="file" accept=".csv" className="hidden" />
              </label>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Supports CSV files up to 10MB
            </p>
          </div>
        </div>
      </div>
      {/* CSV Format Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Expected CSV Format
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              Your CSV should include columns for: personnel, formation, play,
              playType, oneWordPlay, etc.
            </p>
            <button className="text-xs text-blue-700 hover:text-blue-800 font-medium">
              Download sample CSV template →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Map CSV Columns
        </h3>
        <p className="text-sm text-slate-600">
          Match your CSV columns to the correct play fields
        </p>
      </div>
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600 mb-4">
          <FileText className="h-4 w-4 inline mr-1" />
          File: sample_plays.csv (23 rows detected)
        </p>
        {/* Column Mapping */}
        <div className="space-y-3">
          {[
            { csv: "play", db: "play_name", required: true },
            { csv: "formation", db: "formation", required: true },
            { csv: "playType", db: "p_type", required: true },
            { csv: "oneWordPlay", db: "one_word_play", required: false },
            { csv: "protection", db: "protection", required: false },
          ].map((mapping, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 items-center">
              <div className="text-sm font-medium text-slate-700">
                {mapping.csv}
                {mapping.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </div>
              <div className="text-center text-slate-400">→</div>
              <select className="text-sm border border-slate-300 rounded-md px-3 py-2">
                <option value={mapping.db}>{mapping.db}</option>
                <option value="">Skip this column</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setStep("upload")}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep("preview")}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700"
        >
          Preview Import
        </button>
      </div>
    </div>
  );
  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Preview Import
        </h3>
        <p className="text-sm text-slate-600">
          Review the plays before importing to your playbook
        </p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Ready to import 21 plays
            </p>
            <p className="text-sm text-green-800">
              2 rows had warnings but can still be imported
            </p>
          </div>
        </div>
      </div>
      {/* Sample Preview */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-sm font-medium text-slate-900">
            Preview (showing first 5 plays)
          </p>
        </div>
        <div className="divide-y divide-slate-200">
          {[
            {
              name: "Sooners",
              formation: "Empty Left",
              type: "Pass",
              oneWord: "Sooners",
            },
            {
              name: "Traffic",
              formation: "Trio Right",
              type: "Pass",
              oneWord: "Traffic",
            },
            {
              name: "Honolulu",
              formation: "Deuce Left",
              type: "RPO",
              oneWord: "Hawaii",
            },
          ].map((play, index) => (
            <div
              key={index}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {play.name}
                </p>
                <p className="text-sm text-slate-600">
                  {play.formation} • {play.type}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Call: "{play.oneWord}"
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => setStep("mapping")}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep("complete")}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700"
        >
          Import Plays
        </button>
      </div>
    </div>
  );
  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Import Complete!
        </h3>
        <p className="text-sm text-slate-600">
          Successfully imported 21 plays to your playbook
        </p>
      </div>
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">21</p>
            <p className="text-sm text-slate-600">Plays Added</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">8</p>
            <p className="text-sm text-slate-600">Formations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">3</p>
            <p className="text-sm text-slate-600">Play Types</p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700"
      >
        View Playbook
      </button>
    </div>
  );
  const renderStep = () => {
    switch (step) {
      case "upload":
        return renderUploadStep();
      case "mapping":
        return renderMappingStep();
      case "preview":
        return renderPreviewStep();
      case "complete":
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">CSV Import</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Content */}
          <div className="bg-white px-6 py-8">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
};
