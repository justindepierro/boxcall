// src/components/ui/StatusBadge.js
import { createIconElement } from '@utils/iconRenderer.js';

import { BaseBadge } from './baseBadge.js';

export function StatusBadge(status = 'active') {
  const statusMap = {
    active: { text: 'Active', variant: 'success', icon: 'check' },
    inactive: { text: 'Inactive', variant: 'error', icon: 'x' },
    pending: { text: 'Pending', variant: 'warning', icon: 'loader' },
  };

  const { text, variant, icon } = statusMap[status] || statusMap.pending;
  return BaseBadge({
    text,
    variant,
    icon: createIconElement(icon, 'h-4 w-4'),
  });
}
