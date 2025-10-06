import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button/Button";
import { Icon } from "../components/ui/Icon";
import { Typography } from "../components/design-system/Typography";
import { PracticeScriptModal } from "../components/practice/PracticeScriptModal";
import { PageLayout } from "../components/layout/PageLayout";
import { AuroraTile } from "../components/ui/AuroraTile";
import { Aurora } from "../components/ui/Aurora";

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

  const scrollToList = () => {
    if (typeof window === "undefined") return;
    const section = document.getElementById("practice-scripts-section");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tileConfigs = useMemo(
    () => [
      {
        key: "plan",
        title: "Build Script",
        description: "Craft install-ready periods with reps and notes.",
        icon: "target",
        accentOverlayClass: "bg-aurora-emerald",
        glowClassName: "glow-aurora-emerald",
        statusBadge: "Creator",
        iconClassName: "text-emerald-600",
        footnote: "Start new",
        onOpen: () => setShowCreateModal(true),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Total scripts</span>
              <span className="font-semibold text-text-primary">
                {practiceScripts.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Latest build</span>
              <span className="font-semibold text-text-primary">
                {practiceScripts[0]?.updatedAt
                  ? practiceScripts[0].updatedAt.toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "templates",
        title: "Template Library",
        description: "Reuse favorite period groups for faster installs.",
        icon: "grid",
        accentOverlayClass: "bg-aurora-indigo",
        glowClassName: "glow-aurora-indigo",
        statusBadge: "Library",
        iconClassName: "text-sky-600",
        footnote: "Browse",
        onOpen: () => navigate("/practice/templates"),
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Quick add</span>
              <span className="font-semibold text-text-primary">Ready</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Most used</span>
              <span className="font-semibold text-text-primary">Goal line</span>
            </div>
          </div>
        ),
      },
      {
        key: "share",
        title: "Share Agenda",
        description: "Send a polished script to staff and captains.",
        icon: "mail",
        accentOverlayClass: "bg-aurora-violet",
        glowClassName: "glow-aurora-violet",
        statusBadge: "Collab",
        iconClassName: "text-purple-600",
        footnote: "View scripts",
        onOpen: scrollToList,
        body: (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Distribution</span>
              <span className="font-semibold text-text-primary">
                Coming soon
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>PDF export</span>
              <span className="font-semibold text-text-primary">
                In progress
              </span>
            </div>
          </div>
        ),
      },
    ],
    [navigate, practiceScripts]
  );

  return (
    <Aurora variant="field" fullHeight>
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
        <div className="mb-8">
          <div className="rounded-xl border border/40 bg-aurora-shell p-5 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 dark:shadow-slate-900/40 sm:p-6 xl:p-7">
            <div className="mb-6">
              <Typography variant="headline-sm" className="text-text-primary">
                Set the tone for practice
              </Typography>
              <Typography
                variant="body-sm"
                className="text-text-secondary mt-1"
              >
                Launch scripts, pull templates, or share the agenda in seconds.
              </Typography>
            </div>
            <div className="grid-dashboard gap-4 md:gap-5">
              {tileConfigs.map((tile) => (
                <AuroraTile
                  key={tile.key}
                  title={tile.title}
                  description={tile.description}
                  icon={tile.icon}
                  accentOverlayClass={tile.accentOverlayClass}
                  glowClassName={tile.glowClassName}
                  statusBadge={tile.statusBadge}
                  iconClassName={tile.iconClassName}
                  footnote={tile.footnote}
                  onOpen={tile.onOpen}
                >
                  {tile.body}
                </AuroraTile>
              ))}
            </div>
          </div>
        </div>

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
          <div className="space-y-6" id="practice-scripts-section">
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
            <div className="grid-dashboard gap-4 md:gap-5">
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
    </Aurora>
  );
}
