import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import { Modal } from "../../../components/ui/Modal/Modal";
import type { PracticeTemplate } from "../../../types/practice";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PracticeTemplate[];
  onSelectTemplate: (templateId: string) => Promise<void>;
}

export function TemplatesModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: TemplatesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Typography variant="headline-md" className="text-primary mb-6">
          Practice Templates
        </Typography>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border-subtle rounded-lg p-4 surface-subtle-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-lg" className="font-medium">
                    {template.name}
                  </Typography>
                  <Typography variant="body-sm" className="text-secondary">
                    {template.duration} min • {template.blocks.length} blocks
                  </Typography>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSelectTemplate(template.id)}
                  variant="primary"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
