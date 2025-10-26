# Archived Drawing Components

This directory contains the previous implementation of formation drawing and diagram components that were archived on October 26, 2025, to start fresh with a simpler approach.

## What Was Archived

### Components

- `diagram-editor/` - Complete Pixi.js-based diagram editor with canvas rendering
- `FormationBuilderModal/` - Formation creation wizard with drag-and-drop interface
- `MiniDiagram.tsx` - SVG-based diagram display component

### Utilities

- `diagramHelpers.ts` - Diagram mode detection and update creation
- `formationDiagramHelpers.ts` - Formation-specific diagram utilities
- `formationDirectionDetection.ts` - Direction detection logic
- `formationFlipHelpers.ts` - Formation flipping utilities
- `formationGuard.ts` - Formation validation guards
- `formationQuality.ts` - Formation quality assessment
- `formationStrength.ts` - Formation strength calculations

### Services

- `formationService.ts` - Complete formation CRUD operations and business logic

### Validation

- `formationValidation.ts` - Formation validation rules and logic

## Why Archived

The previous implementation used Pixi.js for canvas-based drawing, which introduced complexity and performance issues. The goal is to start with a simpler, more intuitive approach that prioritizes:

- Ease of use for coaches on mobile devices
- Touch-friendly interactions
- Simpler technology stack
- Better performance
- More maintainable codebase

## Future Reference

These components can be referenced for:

- Understanding previous architectural decisions
- Reusing proven patterns or utilities
- Learning from past implementation approaches
- Potential future integration of specific features

## Starting Fresh

The new approach will focus on:

- HTML5 Canvas or SVG for simpler rendering
- React DnD or similar for drag-and-drop
- Grid-based positioning system
- Touch-optimized interactions
- Minimal dependencies
