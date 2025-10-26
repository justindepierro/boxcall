/**
 * PixiFieldBackground - Football Field Background Layer
 *
 * Renders the football field background with yard lines, hash marks,
 * and field markings. Optimized for performance with static rendering.
 */

import React, { useEffect, useRef } from "react";
import { Graphics, Container } from "pixi.js";
import { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import type { FieldDimensions } from "../core/CoordinateSystem";

interface PixiFieldBackgroundProps {
  engine: ProfessionalPixiEngine;
  fieldDimensions: FieldDimensions;
  showYardLines?: boolean;
  showHashMarks?: boolean;
  showFieldNumbers?: boolean;
}

export const PixiFieldBackground: React.FC<PixiFieldBackgroundProps> = ({
  engine,
  fieldDimensions,
  showYardLines = true,
  showHashMarks = true,
  showFieldNumbers = true,
}) => {
  const backgroundRef = useRef<Container | null>(null);

  useEffect(() => {
    if (!engine || !engine.layers.fieldLayer) return;

    // Create field background container
    const fieldContainer = new Container();
    fieldContainer.name = "field-background";
    backgroundRef.current = fieldContainer;

    // Add to field layer
    engine.layers.fieldLayer.addChild(fieldContainer);

    // Draw field background
    drawFieldBackground(fieldContainer, fieldDimensions);

    if (showYardLines) {
      drawYardLines(fieldContainer, fieldDimensions);
    }

    if (showHashMarks) {
      drawHashMarks(fieldContainer, fieldDimensions);
    }

    if (showFieldNumbers) {
      drawFieldNumbers(fieldContainer, fieldDimensions);
    }

    return () => {
      if (backgroundRef.current && backgroundRef.current.parent) {
        backgroundRef.current.parent.removeChild(backgroundRef.current);
      }
    };
  }, [engine, fieldDimensions, showYardLines, showHashMarks, showFieldNumbers]);

  return null; // This component doesn't render DOM elements
};

/**
 * Draw the basic field background (grass/turf)
 */
function drawFieldBackground(
  container: Container,
  dimensions: FieldDimensions
): void {
  const background = new Graphics();

  // Field background (NFL green)
  background.rect(
    0,
    0,
    dimensions.width * dimensions.pixelsPerYard,
    dimensions.height * dimensions.pixelsPerYard
  );
  background.fill({ color: 0x4a7c59 }); // NFL field green

  // End zones (darker green)
  const endZoneWidth = 10 * dimensions.pixelsPerYard; // 10 yards each

  // Left end zone
  background.rect(
    0,
    0,
    endZoneWidth,
    dimensions.height * dimensions.pixelsPerYard
  );
  background.fill({ color: 0x3a5c45 });

  // Right end zone
  background.rect(
    (dimensions.width - 10) * dimensions.pixelsPerYard,
    0,
    endZoneWidth,
    dimensions.height * dimensions.pixelsPerYard
  );
  background.fill({ color: 0x3a5c45 });

  container.addChild(background);
}

/**
 * Draw yard lines and field markings
 */
function drawYardLines(
  container: Container,
  dimensions: FieldDimensions
): void {
  const yardLines = new Graphics();
  yardLines.name = "yard-lines";

  const fieldWidth = dimensions.width * dimensions.pixelsPerYard;
  const fieldHeight = dimensions.height * dimensions.pixelsPerYard;
  const pixelsPerYard = dimensions.pixelsPerYard;

  // Draw yard lines (every 5 yards)
  for (let yard = 0; yard <= dimensions.width; yard += 5) {
    const x = yard * pixelsPerYard;

    // Main yard line
    yardLines.moveTo(x, 0);
    yardLines.lineTo(x, fieldHeight);
    yardLines.stroke({ width: 2, color: 0xffffff });

    // Yard number (every 10 yards, skip end zones)
    if (yard >= 10 && yard <= dimensions.width - 10 && yard % 10 === 0) {
      // Top number
      yardLines.rect(x - 8, 10, 16, 20);
      yardLines.fill({ color: 0xffffff });

      // Bottom number
      yardLines.rect(x - 8, fieldHeight - 30, 16, 20);
      yardLines.fill({ color: 0xffffff });

      // Number text would be added with PIXI.Text in full implementation
    }
  }

  // Goal lines
  yardLines.moveTo(0, 0);
  yardLines.lineTo(fieldWidth, 0);
  yardLines.moveTo(0, fieldHeight);
  yardLines.lineTo(fieldWidth, fieldHeight);
  yardLines.stroke({ width: 4, color: 0xffffff });

  container.addChild(yardLines);
}

/**
 * Draw hash marks (NFL positioning lines)
 */
function drawHashMarks(
  container: Container,
  dimensions: FieldDimensions
): void {
  const hashMarks = new Graphics();
  hashMarks.name = "hash-marks";

  const pixelsPerYard = dimensions.pixelsPerYard;
  const fieldHeight = dimensions.height * pixelsPerYard;

  // NFL hash marks are at 0.75 yards from sideline
  const hashY1 = 0.75 * pixelsPerYard;
  const hashY2 = fieldHeight - 0.75 * pixelsPerYard;

  // Draw hash marks every 5 yards
  for (let yard = 0; yard <= dimensions.width; yard += 5) {
    const x = yard * pixelsPerYard;

    // Skip end zones for hash marks
    if (yard >= 10 && yard <= dimensions.width - 10) {
      // Top hash
      hashMarks.moveTo(x - 10, hashY1);
      hashMarks.lineTo(x + 10, hashY1);

      // Bottom hash
      hashMarks.moveTo(x - 10, hashY2);
      hashMarks.lineTo(x + 10, hashY2);

      hashMarks.stroke({ width: 2, color: 0xffffff });
    }
  }

  container.addChild(hashMarks);
}

/**
 * Draw field numbers (yard markers)
 */
function drawFieldNumbers(
  container: Container,
  dimensions: FieldDimensions
): void {
  const numbers = new Graphics();
  numbers.name = "field-numbers";

  const pixelsPerYard = dimensions.pixelsPerYard;
  const fieldHeight = dimensions.height * pixelsPerYard;

  // Field numbers every 10 yards
  for (let yard = 10; yard <= dimensions.width - 10; yard += 10) {
    const x = yard * pixelsPerYard;

    // Top numbers
    numbers.rect(x - 12, 8, 24, 24);
    numbers.fill({ color: 0xffffff });

    // Bottom numbers
    numbers.rect(x - 12, fieldHeight - 32, 24, 24);
    numbers.fill({ color: 0xffffff });
  }

  container.addChild(numbers);
}
