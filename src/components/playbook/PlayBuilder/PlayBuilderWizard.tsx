import React from "react";
import { X, ArrowLeft, ArrowRight, Save } from "lucide-react";
interface PlayBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
}
export const PlayBuilderWizard: React.FC<PlayBuilderWizardProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Play Builder: Step 1/6 - Play Info
              </h2>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: "16.67%" }}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Content */}
          <div className="bg-white bc-card-padding">
            <div className="grid grid-cols-1 lg:grid-cols-2 bc-grid-gap">
              {/* Form Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6">
                  Basic Play Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Play Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Smash Concept, Traffic, Corndog"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Play Type *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Pass", "Run", "RPO"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center p-3 border border-slate-300 rounded-md cursor-pointer hover:bg-slate-50"
                        >
                          <input
                            type="radio"
                            name="playType"
                            value={type}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="ml-2 text-sm font-medium text-slate-700">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      One-Word Call (Audible)
                    </label>
                    <input
                      type="text"
                      placeholder='e.g., "Corndog", "Traffic", "Alpha"'
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Simple word or code for quick communication during games
                    </p>
                  </div>
                </div>
              </div>
              {/* Preview Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-6">
                  Live Preview
                </h3>
                <div className="bg-slate-50 rounded-lg bc-card-padding border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <div className="text-slate-400 mb-4">
                      <svg
                        className="h-16 w-16 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Your play preview will appear here as you fill out the
                      form
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <button
              disabled
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-400 bg-white border border-slate-300 rounded-md cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
