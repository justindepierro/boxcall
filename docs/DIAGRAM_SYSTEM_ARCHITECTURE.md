# Diagram System Architecture Guide

**Last Updated**: October 7, 2025  
**Status**: ✅ **PRODUCTION**

---

## 🎯 Overview

BoxCall has **two distinct diagram systems** for different use cases:

| System              | Purpose                   | When to Use                                             | Entry Point         |
| ------------------- | ------------------------- | ------------------------------------------------------- | ------------------- |
| **diagram-editor/** | Full-featured play editor | Editing plays with metadata, formations, field settings | `DiagramEditor.tsx` |
| **diagram-canvas/** | Lightweight canvas        | Quick diagram sketching, modal diagrams                 | `DiagramCanvas.tsx` |

---

## 📁 Directory Structure

```
src/components/playbook/
├── diagram-editor/          (Full-Featured Editor)
│   ├── DiagramEditor.tsx    Main component (604 lines)
│   ├── FieldCanvas/         Field orchestrator system
│   ├── components/
│   │   ├── metadata/        Play metadata forms (name, formation, etc.)
│   │   ├── settings/        Field settings panels
│   │   ├── properties/      Player/Route property editors
│   │   ├── ModernToolPalette.tsx
│   │   ├── FootballFieldCanvas.tsx
│   │   └── ... (18 components total)
│   ├── context/
│   │   ├── DiagramEditorProvider.tsx
│   │   ├── DiagramEditorContext.ts
│   │   └── useDiagramEditor.ts
│   ├── engine/
│   │   └── ShapeEngine.ts   Shape manipulation engine
│   ├── types/
│   │   └── types.ts         Type definitions
│   └── utils/
│
├── diagram-canvas/          (Lightweight Canvas)
│   ├── DiagramCanvas.tsx    Main component (154 lines)
│   ├── DiagramCanvasRoute.tsx  Standalone route
│   ├── FieldCanvas.tsx      SVG rendering (3,283 lines - monolith)
│   ├── context.tsx          State management (1,321 lines - monolith)
│   ├── components/
│   │   ├── ActionBar.tsx
│   │   ├── CanvasPane.tsx
│   │   ├── FieldPlayers.tsx
│   │   ├── FieldRoutes.tsx
│   │   ├── Toolbar.tsx
│   │   └── ... (15 components total)
│   ├── hooks/
│   │   ├── useFieldDragDrop.ts
│   │   ├── useFieldKeyboard.ts
│   │   ├── useFieldZoomPan.ts
│   │   ├── useFieldSnapping.ts
│   │   └── useFieldCoordinates.ts
│   ├── types.ts
│   ├── formations.ts
│   └── thumbnail.ts         (Deprecated - use shared version)
│
└── diagram-shared/          (Common Utilities)
    └── utils/
        └── thumbnail.ts     SVG → PNG conversion utilities
```

---

## 🏗️ System 1: diagram-editor/

### **Purpose**

Full-featured diagram editor with comprehensive play metadata editing.

### **Features**

✅ Play metadata form (name, formation, personnel, play type, VS front)  
✅ Field settings panel (field slice presets, display options)  
✅ Ball hash configuration (left/middle/right)  
✅ Hash layout selection (HS/NCAA/NFL)  
✅ Player and route property panels  
✅ Formation presets  
✅ Comprehensive save/export functionality  
✅ Tool palette with all diagram tools

### **Usage**

**In PlaybookPage.tsx**:

```tsx
import { DiagramEditor } from "../components/playbook/diagram-editor/DiagramEditor";
import type {
  DiagramMetadata,
  DiagramDocument,
} from "../components/playbook/diagram-editor/types/types";

// Lazy load for code splitting
const DiagramEditor = lazy(() =>
  import("../components/playbook/diagram-editor/DiagramEditor").then(
    (module) => ({ default: module.DiagramEditor })
  )
);

// Usage in modal
<Modal isOpen={!!diagramPlay} onClose={closeDiagram}>
  <DiagramEditor
    play={diagramPlay}
    onClose={closeDiagram}
    onSave={handleSaveDiagram}
  />
</Modal>;
```

**Props**:

```tsx
interface DiagramEditorProps {
  play: Play; // Play data to edit
  onClose: () => void; // Close handler
  onSave?: (payload: {
    // Save handler
    doc: DiagramDocument;
    metadata: DiagramMetadata;
  }) => Promise<void>;
}
```

### **Components**

| Component                   | Purpose                        | Lines |
| --------------------------- | ------------------------------ | ----- |
| `DiagramEditor.tsx`         | Main editor shell              | 604   |
| `ModernToolPalette.tsx`     | Tool selection UI              | ~200  |
| `FootballFieldCanvas.tsx`   | Field rendering                | ~300  |
| `PlayerPropertiesPanel.tsx` | Edit player properties         | ~150  |
| `RoutePropertiesPanel.tsx`  | Edit route properties          | ~150  |
| `ShapeManipulator.tsx`      | Handle shape dragging/resizing | ~250  |

### **Context**

```tsx
import { DiagramEditorProvider, useDiagramEditor } from "../context";

// Provider wraps the entire editor
<DiagramEditorProvider>
  <YourComponent />
</DiagramEditorProvider>;

// Hook to access diagram state
const { state, dispatch } = useDiagramEditor();

// State structure
state.doc; // DiagramDocument - players, routes, field config
state.ui; // UI state - tool, selection, zoom, pan
state.dirty; // Has unsaved changes?
state.history; // Undo/redo history
```

---

## 🎨 System 2: diagram-canvas/

### **Purpose**

Lightweight, canvas-only diagram editor for quick sketching and modal use.

### **Features**

✅ Canvas and tools only (minimal UI)  
✅ Simple document change callback  
✅ Help overlay with keyboard shortcuts  
✅ Export to PNG functionality  
✅ Fast loading (smaller bundle)  
✅ No metadata forms (focus on diagram)

### **Usage**

**In DiagramPaneRoute.tsx**:

```tsx
import { DiagramCanvas } from "./diagram-canvas/DiagramCanvas";

<DiagramCanvas
  onDocumentChange={(doc) => {
    // Handle document changes
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDiagramUpdated,
      data: { routes: doc.routes.length },
    });
  }}
  onClose={() => navigate("/playbook")}
  onRequestExport={(exporter) => {
    // Provide export function
  }}
/>;
```

**Props**:

```tsx
interface DiagramCanvasProps {
  onDocumentChange?: (doc: DiagramDocument) => void;
  onClose?: () => void;
  onRequestExport?: (exporter: () => Promise<string | null>) => void;
}
```

### **Standalone Route**

The canvas has its own route for modal-style usage:

**Route**: `/playbook/diagram?playId=<id>`

**Usage**:

```tsx
import { DiagramCanvasRoute } from "./diagram-canvas/DiagramCanvasRoute";

// In your route config
<Route path="/playbook/diagram" element={<DiagramCanvasRoute />} />;
```

### **Components**

| Component           | Purpose             | Lines    |
| ------------------- | ------------------- | -------- |
| `DiagramCanvas.tsx` | Main canvas shell   | 154      |
| `FieldCanvas.tsx`   | SVG field rendering | 3,283 ⚠️ |
| `Toolbar.tsx`       | Tool palette        | ~83      |
| `CanvasPane.tsx`    | Canvas wrapper      | ~50      |
| `FieldPlayers.tsx`  | Player rendering    | ~200     |
| `FieldRoutes.tsx`   | Route rendering     | ~200     |

⚠️ **Note**: `FieldCanvas.tsx` (3,283 lines) and `context.tsx` (1,321 lines) are monolithic files marked for future refactoring.

### **Context**

```tsx
import { DiagramEditorProvider, useDiagramEditor } from "./context";

// Provider wraps the canvas
<DiagramEditorProvider>
  <DiagramCanvas />
</DiagramEditorProvider>;

// Hook to access diagram state
const { state, dispatch } = useDiagramEditor();
```

---

## 🔧 Shared Utilities

### **diagram-shared/utils/thumbnail.ts**

Unified SVG → PNG conversion utilities used by both systems.

**Functions**:

```tsx
import {
  svgElementToDataUrl,
  svgFullToPngDataUrl,
  svgFullToString,
  type ThumbnailOptions,
} from "../diagram-shared/utils/thumbnail";

// Convert SVG element to data URL
const dataUrl = await svgElementToDataUrl(svgElement, {
  width: 400,
  height: 225,
  background: "#1e293b",
  type: "image/png",
  quality: 0.92,
});

// Convert SVG to full-size PNG (resets zoom/pan)
const fullPng = await svgFullToPngDataUrl(svgElement, {
  width: 1600,
  height: 900,
  background: "#1e293b",
});

// Get SVG as string (for saving)
const svgString = svgFullToString(svgElement, {
  width: 1600,
  height: 900,
});
```

---

## 🎯 Decision Guide: Which System to Use?

### **Use diagram-editor/ when:**

- ✅ Editing existing plays in the playbook
- ✅ Need to edit play metadata (name, formation, personnel)
- ✅ Need field configuration options
- ✅ Comprehensive editing session
- ✅ Saving to database with full metadata
- ✅ Example: PlaybookPage play editor modal

### **Use diagram-canvas/ when:**

- ✅ Quick diagram sketching
- ✅ Standalone diagram view (no metadata)
- ✅ Modal/overlay diagram editing
- ✅ Minimal UI needed
- ✅ Just need the canvas and tools
- ✅ Example: Quick play diagram in a popup

### **Decision Matrix**

| Feature              | diagram-editor           | diagram-canvas            |
| -------------------- | ------------------------ | ------------------------- |
| **UI Complexity**    | High (forms + canvas)    | Low (canvas only)         |
| **Bundle Size**      | Larger (~600 lines main) | Smaller (~150 lines main) |
| **Metadata Editing** | ✅ Yes                   | ❌ No                     |
| **Field Settings**   | ✅ Yes                   | ❌ No                     |
| **Quick Sketch**     | ⚠️ Overkill              | ✅ Perfect                |
| **Full Play Edit**   | ✅ Perfect               | ⚠️ Missing features       |

---

## 📊 Type Definitions

### **DiagramDocument**

Both systems use the same document structure:

```tsx
interface DiagramDocument {
  players: DiagramPlayer[]; // Player positions
  routes: DiagramRoute[]; // Route paths
  field: DiagramFieldConfig; // Field configuration
  annotations?: Annotation[]; // Text/shapes
}

interface DiagramPlayer {
  id: string; // Player ID
  label: string; // Position label (QB, WR, etc.)
  x: number; // X coordinate
  y: number; // Y coordinate
  color: string; // Player color
  role?: "offense" | "defense"; // Team role
}

interface DiagramRoute {
  id: string; // Route ID
  playerId: string; // Associated player
  segments: RouteSegment[]; // Route path segments
  color?: string; // Route color
  style?: "solid" | "dashed"; // Line style
}

interface DiagramFieldConfig {
  backYards: number; // Yards behind LOS
  forwardYards: number; // Yards forward from LOS
  losYards: number; // LOS position
  ballHash?: "left" | "middle" | "right";
  hashLayout?: "highschool" | "college" | "nfl";
  showPlayerLabels?: boolean;
  showDefensePlayers?: boolean;
  showRedZone?: boolean;
}
```

### **DiagramMetadata** (diagram-editor only)

```tsx
interface DiagramMetadata {
  play_name: string; // Play name
  formation: string; // Formation name
  p_type?: string; // Play type (Run, Pass, RPO, etc.)
  personnel?: string; // Personnel grouping
  pref_front?: string; // Preferred defensive front
}
```

---

## 🚀 Migration Path

### **From diagram/ to diagram-editor/**

**Old**:

```tsx
import { PlayDiagramBuilder } from "../components/playbook/diagram/PlayDiagramBuilder";
import type { DiagramMetadata } from "../components/playbook/diagram/PlayDiagramBuilder";
```

**New**:

```tsx
import { DiagramEditor } from "../components/playbook/diagram-editor/DiagramEditor";
import type { DiagramMetadata } from "../components/playbook/diagram-editor/DiagramEditor";
```

**Backward Compatibility**: `PlayDiagramBuilder` is aliased to `DiagramEditor` for transition period.

### **From diagram-v2/ to diagram-canvas/**

**Old**:

```tsx
import { VisualPlayBuilderV2 } from "./diagram-v2/VisualPlayBuilderV2";
```

**New**:

```tsx
import { DiagramCanvas } from "./diagram-canvas/DiagramCanvas";
```

**Backward Compatibility**: `VisualPlayBuilderV2` is aliased to `DiagramCanvas` for transition period.

---

## ⚠️ Known Issues & Future Work

### **Monolithic Files**

1. **diagram-canvas/FieldCanvas.tsx** (3,283 lines)
   - **Issue**: Single massive file handling all SVG rendering
   - **Impact**: Hard to maintain, slow to load
   - **Plan**: Split into field components (players, routes, grid, etc.)
   - **Priority**: High

2. **diagram-canvas/context.tsx** (1,321 lines)
   - **Issue**: Huge reducer with all actions in one file
   - **Impact**: Hard to navigate, slow type checking
   - **Plan**: Split into separate action/reducer/types files
   - **Priority**: High

### **Duplicate Components**

Some components exist in both systems with minor differences:

- `Toolbar.tsx` (nearly identical)
- `CanvasPane.tsx` (nearly identical)
- `HelpOverlay.tsx` (nearly identical)

**Future**: Extract these to `diagram-shared/components/`

---

## 📚 Related Documentation

- [Diagram Refactor Plan](./DIAGRAM_REFACTOR_PLAN_OCT7_2025.md) - Full refactoring roadmap
- [Diagram Cleanup Summary](./DIAGRAM_CLEANUP_SUMMARY_OCT7_2025.md) - Recent cleanup work
- [Diagram System Audit](./DIAGRAM_SYSTEM_AUDIT_OCT7_2025.md) - Initial audit findings

---

## 🤝 Contributing

When working with the diagram systems:

1. **Choose the right system** - Use decision guide above
2. **Don't modify both** - Changes usually belong in one system only
3. **Use shared utilities** - Import from `diagram-shared/` when possible
4. **Test both systems** - If you modify shared code, test both
5. **Update this doc** - Keep architecture guide current

---

## 📞 Questions?

- **"Which system do I use?"** → See Decision Guide above
- **"Can I merge them?"** → No, they serve different purposes
- **"Why two systems?"** → Different use cases (full editor vs quick canvas)
- **"What's the difference?"** → diagram-editor has metadata forms, diagram-canvas is canvas-only

---

**Last Updated**: October 7, 2025  
**Maintained by**: Development Team  
**Status**: ✅ Production Ready
