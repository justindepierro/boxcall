// src/components/ui/PlanBadge.js
import { createIconElement } from '@utils/iconRenderer.js';

import { BaseBadge } from './baseBadge.js';

export function PlanBadge(plan = 'free') {
  const planMap = {
    free: { text: 'Free', variant: 'default', icon: 'user' },
    pro: { text: 'Pro', variant: 'primary', icon: 'sparkles' },
    enterprise: { text: 'Enterprise', variant: 'success', icon: 'package' },
  };

  const { text, variant, icon } = planMap[plan] || planMap.free;
  return BaseBadge({
    text,
    variant,
    icon: createIconElement(icon, 'h-4 w-4'),
  });
}
