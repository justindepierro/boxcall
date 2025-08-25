# FieldCanvas Refactor & Redesign Plan

## Goals

- Make the drawing system fluid, intuitive, and easy to use
- Resemble Google Slides/PowerPoint for shape/line creation
- Improve snappiness and organization beyond HUDL's play creator
- Retain all current functionality, but modularize and enhance UX

## Current Pain Points

- Monolithic component (3286 lines): all logic packed into one file
- Complex state management: multiple refs and state objects
- UI/UX bottlenecks: interactions not as fluid/intuitive as modern tools
- Limited modularity: no separation between rendering, event handling, and UI controls
- Difficult to extend: slow/error-prone to add features or improve UX

## Proposed Modular Structure

1. **FieldCanvas (Orchestrator)**
   - Handles overall layout, context, and composition of subcomponents
2. **Toolbar**
   - Shape/line tools, selection, undo/redo, layer controls, etc.
3. **Shape Components**
   - `Shape`, `Line`, `Arrow`, `Text`, etc. Each with own rendering/interaction logic
4. **Layer System**
   - Stacking order, visibility, grouping of shapes/lines
5. **Selection & Drag/Drop**
   - Selection box, multi-select, drag, snap logic
6. **Zoom & Pan Controls**
   - Dedicated viewport manipulation
7. **State Management**
   - Context or reducer pattern for clean, predictable updates
8. **Event Handlers**
   - Modular mouse/touch/keyboard event logic
9. **Annotation/Connector System**
   - Separate logic for connectors/annotations

## Next Steps

1. Scaffold new subcomponent files and context structure
2. Extract Toolbar, Shape, and Layer logic from FieldCanvas.tsx
3. Refactor event handling and state management
4. Redesign UI for snappier, more intuitive interactions

---

_This plan is a living document. Update as you refactor and redesign._
