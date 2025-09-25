import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { PracticeScriptModal } from "../components/practice/PracticeScriptModal";
import { PageLayout } from "../components/layout/PageLayout";

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
    <PageLayout
      title="Practice Plans"
      subtitle="Create and manage practice scripts for your team's training sessions"
      variant="list"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/playbook")}
            variant="secondary"
            size="sm"
          >
            <Icon name="arrow-left" className="h-4 w-4 mr-2" />
            Back to Playbook
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="sm"
          >
            <Icon name="plus" className="h-4 w-4 mr-2" />
            New Script
          </Button>
        </div>
      }
    >
      {practiceScripts.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-surface-muted rounded-full flex items-center justify-center mb-6">
            <Icon name="file" className="h-12 w-12 text-text-muted" />
          </div>
          <Typography
            variant="headline-md"
            className="text-text-primary mb-2"
          >
            No Practice Scripts Yet
          </Typography>
          <Typography
            variant="body-lg"
            className="text-text-secondary mb-8 max-w-md mx-auto"
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
            <Typography variant="headline-md" className="text-text-primary">
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
                className="bg-surface-primary rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEditScript(script)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Typography
                      variant="headline-sm"
                      className="text-text-primary mb-1"
                    >
                      {script.name}
                    </Typography>
                    {script.opponent && (
                      <Typography
                        variant="body-sm"
                        className="text-text-secondary"
                      >
                        vs {script.opponent}
                      </Typography>
                    )}
                    {script.date && (
                      <Typography
                        variant="body-sm"
                        className="text-text-muted"
                      >
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
                      className="p-1 text-text-muted hover:text-text-secondary transition-colors"
                      title="Edit script"
                    >
                      <Icon name="edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScript(script.id);
                      }}
                      className="p-1 text-text-muted hover:text-text-error transition-colors"
                      title="Delete script"
                    >
                      <Icon name="delete" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>{script.plays.length} plays</span>
                  <span>{script.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Script Modal */}
      {showCreateModal && (
        <PracticeScriptModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateScript}
        />
      )}
    </PageLayout>
  );
}
