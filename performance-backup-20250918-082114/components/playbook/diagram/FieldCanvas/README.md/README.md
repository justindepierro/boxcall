# FieldCanvas Modular Drawing System

## Overview

This folder contains the fully modular, strictly typed FieldCanvas drawing system for BoxCall. All legacy, v1/v2, and broken code has been removed. The architecture is designed for maintainability, clarity, and extensibility.

## Components

- **FieldCanvasOrchestrator.tsx**: Main orchestrator, wires up all modules and context.
- **FieldCanvasContext.tsx**: Strictly typed context/provider for shared state and actions.
- **Toolbar.tsx**: Modular toolbar for tool selection and actions.
- **Layer.tsx**: Handles rendering and management of drawing layers.
- **Shape.tsx**: Renders and manages shapes (rectangles, circles, etc.).
- **Line.tsx**: Renders and manages lines.
- **Selection.tsx**: Handles selection logic and UI.
- **ZoomPan.tsx**: Provides zoom and pan functionality.
- **Annotation.tsx**: Renders and manages annotations (connectors, notes).
- **fieldCanvasUtils.ts**: Utility functions, fully typed for safety.

## Usage

Wrap your drawing UI with `FieldCanvasProvider` and use the orchestrator to compose the modular components. All state and actions are available via context hooks.

## Architecture Principles

- **Modular**: Each feature is a separate, focused component.
- **Strict Typing**: All logic and context are strictly typed for reliability.
- **Context-Driven**: Shared state and actions via React context/provider.
- **No Legacy**: All legacy, v1/v2, and broken code has been removed.

## Maintenance

- Add new features as separate modules.
- Keep all logic strictly typed.
- Document new modules in this README.

## Contact

For questions or contributions, see the main project README or contact the maintainers.
