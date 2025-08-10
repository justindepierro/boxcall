import React from "react";
import { Button } from "../../ui/Button/Button";
import { X, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Typography } from "../../design-system/Typography";
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
        <div className="inline-block align-bottom surface-card elevation-modal rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="surface-subtle px-6 py-4 border-b border-subtle flex items-center justify-between">
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="text-slate-900"
              >
                Play Builder: Step 1/6 - Play Info
              </Typography>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-jade-600 h-2 rounded-full"
                    style={{ width: "16.67%" }}
                  />
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 h-auto w-auto"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          {/* Content */}
          <div className="surface-card bc-card-padding">
            <div className="grid grid-cols-1 lg:grid-cols-2 bc-grid-gap">
              {/* Form Section */}
              <div>
                <Typography
                  variant="headline-sm"
                  as="h3"
                  className="text-slate-900 mb-6"
                >
                  Basic Play Information
                </Typography>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Play Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Smash Concept, Traffic, Corndog"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
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
                            className="h-4 w-4 text-jade-600 focus:ring-jade-500"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Simple word or code for quick communication during games
                    </p>
                  </div>
                </div>
              </div>
              {/* Preview Section */}
              <div>
                <Typography
                  variant="headline-sm"
                  as="h3"
                  className="text-slate-900 mb-6"
                >
                  Live Preview
                </Typography>
                <div className="surface-subtle rounded-lg bc-card-padding border-subtle">
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
          <div className="surface-subtle px-6 py-4 border-t border-subtle flex items-center justify-between">
            <Button
              disabled
              variant="ghost"
              size="sm"
              className="text-slate-400 cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="secondary"
                size="sm"
                className="inline-flex items-center"
              >
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="inline-flex items-center"
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
