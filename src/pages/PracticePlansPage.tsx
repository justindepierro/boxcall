import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { PracticeScriptModal } from "../components/practice/PracticeScriptModal";

import type { PracticeScript } from "../components/practice/PracticeScriptModal/types";

export default function PracticePlansPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [practiceScripts, setPracticeScripts] = useState<PracticeScript[]>([]);

  const handleCreateScript = (script: PracticeScript) => {
    setPracticeScripts((prev) => [...prev, script]);
    setShowCreateModal(false);
    // TODO: Save to database
    console.log("Created practice script:", script);
  };

  const handleEditScript = (script: PracticeScript) => {
    // TODO: Navigate to script editor or open edit modal
    console.log("Edit script:", script);
  };

  const handleDeleteScript = (scriptId: string) => {
    setPracticeScripts((prev) => prev.filter((s) => s.id !== scriptId));
    // TODO: Delete from database
  };

  return (
    <div className="py-8 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/playbook")}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Icon name="arrow-left" className="h-5 w-5 mr-2" />
              Back to Playbook
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <Typography variant="headline-lg" className="text-gray-900">
              Practice Plans
            </Typography>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {practiceScripts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Icon name="file" className="h-12 w-12 text-gray-400" />
            </div>
            <Typography variant="headline-md" className="text-gray-900 mb-2">
              No Practice Scripts Yet
            </Typography>
            <Typography
              variant="body-lg"
              className="text-gray-600 mb-8 max-w-md mx-auto"
            >
              Create your first practice script to organize plays for your
              team's training sessions.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
                size="lg"
              >
                <Icon name="plus" className="h-5 w-5 mr-2" />
                Create New Script
              </Button>
              <Button
                onClick={() => navigate("/playbook")}
                variant="secondary"
                size="lg"
              >
                <Icon name="book" className="h-5 w-5 mr-2" />
                Browse Playbook
              </Button>
            </div>
          </div>
        ) : (
          // Scripts List
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <Typography variant="headline-md" className="text-gray-900">
                Your Practice Scripts ({practiceScripts.length})
              </Typography>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="primary"
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                New Script
              </Button>
            </div>

            {/* Scripts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceScripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditScript(script)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Typography
                        variant="headline-sm"
                        className="text-gray-900 mb-1"
                      >
                        {script.name}
                      </Typography>
                      {script.opponent && (
                        <Typography variant="body-sm" className="text-gray-600">
                          vs {script.opponent}
                        </Typography>
                      )}
                      {script.date && (
                        <Typography variant="body-sm" className="text-gray-500">
                          {new Date(script.date).toLocaleDateString()}
                        </Typography>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditScript(script);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit script"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScript(script.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete script"
                      >
                        <Icon name="delete" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{script.plays.length} plays</span>
                    <span>{script.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Script Modal */}
      {showCreateModal && (
        <PracticeScriptModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateScript}
        />
      )}
    </div>
  );
}
