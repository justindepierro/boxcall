Archived legacy Playbook/Diagram files

Date: 2025-08-14

Summary
- The following legacy or unused files were archived to reduce dead code and simplify maintenance.
- All archived files were confirmed to have no active imports in the application.
- Tests and type checks pass after removal from src/.

Archived files (original path → archive path)
1) src/components/playbook/visual/VisualPlayBuilder.tsx → archive/2025-08-14-diagram-legacy/VisualPlayBuilder.tsx
2) src/components/playbook/visual/FieldCanvas.tsx → archive/2025-08-14-diagram-legacy/FieldCanvas.legacy-shim.tsx
3) src/components/playbook/PlayBuilder/DiagramEditorMVP.tsx → archive/2025-08-14-diagram-legacy/DiagramEditorMVP.tsx
4) src/components/playbook/PlayBuilder/PlayBuilderWizard.tsx → archive/2025-08-14-diagram-legacy/PlayBuilderWizard.tsx
5) src/components/playbook/diagram-v2/DiagramV2Route.tsx → archive/2025-08-14-diagram-legacy/DiagramV2Route.tsx

Notes
- VisualPlayBuilder (legacy) was superseded by diagram-v2/VisualPlayBuilderV2 and is no longer referenced.
- The legacy FieldCanvas shim delegated to the v2 canvas and is not imported anywhere.
- DiagramEditorMVP and PlayBuilderWizard were prototypes and are not referenced.
- DiagramV2Route duplicated DiagramPaneRoute and is not used.
- If any of these need to be restored, copy them back into src/ and rewire imports as needed.
