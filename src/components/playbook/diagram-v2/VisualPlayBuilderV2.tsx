import React, { useEffect, useRef, useState } from "react";
import { DiagramEditorProvider, useDiagramEditor } from "./context";
import { Toolbar } from "./components/Toolbar";
// Sidebar hidden for on-canvas editing; keep imports commented for quick restore
// import { PlayerSidebar } from "./components/PlayerSidebar";
// import { RoutesPanel } from "./components/RoutesPanel";
import { CanvasPane } from "./components/CanvasPane";
import { colorTokens } from "../../../design-system/tokens";
import type { DiagramDocument } from "./types";
import { HelpOverlay } from "./components/HelpOverlay";
import { svgFullToPngDataUrl } from "./thumbnail";

interface ShellProps {
  onDocumentChange?: (doc: DiagramDocument) => void;
  onClose?: () => void;
  onRequestExport?: (exporter: () => Promise<string | null>) => void; // provides a way to export current SVG to PNG data URL
}

const Shell: React.FC<ShellProps> = ({
  onDocumentChange,
  onClose,
  onRequestExport,
}) => {
  const { state, dispatch } = useDiagramEditor();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [sidebarWidth] = useState<number>(0);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [dontShowHelp, setDontShowHelp] = useState<boolean>(false);

  // First-run help overlay (respect localStorage)
  useEffect(() => {
    const flag = window.localStorage.getItem("diagram.help.dismissed");
    setDontShowHelp(flag === "1");
    if (flag !== "1") {
      // show once per session until explicitly dismissed
      setHelpOpen(true);
    }
  }, []);

  // Keyboard delete handler (bulk or single)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 'H' or '?' opens help if not in an input
      const openHelpKey =
        (e.key.toLowerCase() === "h" &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey) ||
        e.key === "?" ||
        (e.key === "/" && e.shiftKey);
      if (openHelpKey && !helpOpen) {
        const ae = document.activeElement as HTMLElement | null;
        const tag = (ae?.tagName || "").toLowerCase();
        const typing =
          tag === "input" || tag === "textarea" || ae?.isContentEditable;
        if (!typing) {
          setHelpOpen(true);
          // notify hint overlay
          window.dispatchEvent(new CustomEvent("diagram:help-opened"));
          e.preventDefault();
          return;
        }
      }
      // ESC closes help
      if (e.key === "Escape" && helpOpen) {
        setHelpOpen(false);
        window.dispatchEvent(new CustomEvent("diagram:help-closed"));
        e.preventDefault();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.ui.selectedIds && state.ui.selectedIds.length > 1) {
          dispatch({ type: "SET_PENDING_BULK_DELETE", pending: true });
        } else if (state.ui.selectedIds && state.ui.selectedIds.length === 1) {
          dispatch({ type: "SET_PENDING_DELETE", id: state.ui.selectedIds[0] });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.ui.selectedIds, dispatch, helpOpen]);

  // Propagate document changes upward
  useEffect(() => {
    if (onDocumentChange) onDocumentChange(state.doc);
  }, [state.doc, onDocumentChange]);

  // Provide export function to parent when requested
  useEffect(() => {
    if (!onRequestExport) return;
    const makeExporter = async (): Promise<string | null> => {
      const svg = svgRef.current;
      if (!svg) return null;
      try {
        const dataUrl = await svgFullToPngDataUrl(svg, {
          width: 800,
          height: 450,
          background: colorTokens.navy[900],
          type: "image/png",
          quality: 0.92,
        });
        return dataUrl;
      } catch {
        return null;
      }
    };
    onRequestExport(() => makeExporter());
  }, [onRequestExport]);

  return (
    <div className="flex flex-col h-full min-h-[37.5rem]">
      <Toolbar onClose={onClose} svgRef={svgRef} />
      <div className="flex flex-1 min-h-0 mt-2" style={{ width: "100%" }}>
        {/* Sidebar hidden */}
        <div className="hidden" style={{ width: sidebarWidth }} />
        <CanvasPane
          svgRef={svgRef}
          className="flex-1 min-w-0 flex flex-col p-4"
        />
      </div>
      <HelpOverlay
        open={helpOpen}
        onClose={() => {
          setHelpOpen(false);
          window.dispatchEvent(new CustomEvent("diagram:help-closed"));
          if (!dontShowHelp) {
            // mark viewed once to hide the on-canvas hint if implemented
            window.localStorage.setItem("diagram.help.viewed", "1");
          }
        }}
        dontShowAgain={dontShowHelp}
        onDontShowAgainChange={(v) => {
          setDontShowHelp(v);
          window.localStorage.setItem("diagram.help.dismissed", v ? "1" : "0");
        }}
      />
    </div>
  );
};

export const VisualPlayBuilderV2: React.FC<{
  onDocumentChange?: (doc: DiagramDocument) => void;
  onClose?: () => void;
  onRequestExport?: (exporter: () => Promise<string | null>) => void;
}> = ({ onDocumentChange, onClose, onRequestExport }) => (
  <DiagramEditorProvider>
    <Shell
      onDocumentChange={onDocumentChange}
      onClose={onClose}
      onRequestExport={onRequestExport}
    />
  </DiagramEditorProvider>
);
