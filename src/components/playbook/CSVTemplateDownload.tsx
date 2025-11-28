import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";

interface CSVTemplateDownloadProps {
  variant?: "simple" | "detailed" | "full";
  className?: string;
}

/**
 * CSV Template Download Button
 * 
 * Provides downloadable CSV templates for bulk play imports.
 * Templates are Excel-friendly with descriptive headers.
 */
export function CSVTemplateDownload({ 
  variant = "simple",
  className = "" 
}: CSVTemplateDownloadProps) {
  const templates = {
    simple: {
      file: "/BoxCall_Play_Import_Template.csv",
      name: "Simple Template",
      description: "5 core fields - perfect for quick imports",
    },
    detailed: {
      file: "/BoxCall_Play_Import_Template_Detailed.csv",
      name: "Detailed Template",
      description: "23 fields with examples - recommended for most coaches",
    },
    full: {
      file: "/BoxCall_Play_Import_Template_Full.csv",
      name: "Complete Template",
      description: "All 33+ fields - comprehensive play documentation",
    },
  };

  const template = templates[variant];

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = template.file;
    link.download = template.file.split("/").pop() || "template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className={className}
    >
      <Icon name="download" className="w-4 h-4 mr-2" />
      Download {template.name}
    </Button>
  );
}

/**
 * CSV Template Download Menu
 * 
 * Shows all available templates with descriptions
 */
export function CSVTemplateDownloadMenu({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm text-secondary mb-3">
        <p className="font-medium text-primary mb-1">
          📥 Download CSV Template
        </p>
        <p>
          Open in Excel, fill in your plays, then import back to BoxCall
        </p>
      </div>

      <div className="space-y-2">
        <CSVTemplateDownload variant="simple" className="w-full justify-start" />
        <p className="text-xs text-muted pl-8">
          Quick start: formation, play_name, p_type, personnel, one_word_play
        </p>

        <CSVTemplateDownload variant="detailed" className="w-full justify-start" />
        <p className="text-xs text-muted pl-8">
          Recommended: 23 fields including protection, motion, preferences
        </p>

        <CSVTemplateDownload variant="full" className="w-full justify-start" />
        <p className="text-xs text-muted pl-8">
          Complete: All 33+ fields for comprehensive play documentation
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-divider text-xs text-muted">
        <p>💡 <strong>Tip:</strong> Download template → Fill in Excel → Save as CSV → Import to BoxCall</p>
        <p className="mt-1">📖 See <span className="font-mono">docs/CSV_IMPORT_GUIDE.md</span> for full documentation</p>
      </div>
    </div>
  );
}
