import React, { Suspense, lazy } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { telemetry } from '../../telemetry/dispatcher';
import { TelemetryEventTypes } from '../../telemetry/events';
import type { Play } from '../../types/play';
import { Button } from '../ui/Button/Button';
import { X } from 'lucide-react';

// Lazy load heavy visual builder only when this route is hit
const VisualPlayBuilder = lazy(() => import('./visual/VisualPlayBuilder'));

/**
 * DiagramPaneRoute
 * Dedicated route wrapper for visual play builder to reduce default PlayGrid card payload.
 * URL: /playbook/diagram?playId=<id>
 */
export const DiagramPaneRoute: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const playId = params.get('playId');

  const handleClose = () => {
    navigate('/playbook');
  };

  // Minimal placeholder; actual play loading should fetch by id (future integration)
  const fakePlay: Play | null = playId ? {
    id: playId,
    playbook_id: 'unknown',
    formation: 'Shotgun',
    play_name: 'Temp',
    p_type: 'Pass',
    confidence_base: 70,
    times_called: 0,
    times_successful: 0,
    created_by: 'system',
    created_at: new Date(),
    updated_at: new Date(),
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <Suspense fallback={<div className="bg-white rounded-md p-6 shadow text-sm text-slate-600">Loading diagram builder...</div>}>
        <VisualPlayBuilder
          isOpen={true}
          play={fakePlay || undefined}
          onClose={handleClose}
          onSave={(p) => {
            telemetry.enqueue({ type: TelemetryEventTypes.PlayDiagramUpdated, data: { playId: p.id } });
            handleClose();
          }}
        />
      </Suspense>
      <Button variant="ghost" size="xs" onClick={handleClose} className="absolute top-4 right-4 bg-white/70 backdrop-blur p-1 h-auto w-auto" aria-label="Close diagram">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default DiagramPaneRoute;
