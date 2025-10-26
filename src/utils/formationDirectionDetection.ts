/**
 * Formation Direction Detection - Minimal Stub
 *
 * This is a temporary stub for the archived formationDirectionDetection.
 * The formation system has been simplified and these utilities are no longer needed.
 */

export interface DirectionDetectionResult {
  direction: 'left' | 'right' | 'neutral';
  confidence: number;
  detected: boolean;
}

export function detectDirectionInFormationName(_name: string): DirectionDetectionResult {
  return {
    direction: 'neutral',
    confidence: 0,
    detected: false
  };
}

export function validateFormationDirection(_direction: string): boolean {
  return true;
}