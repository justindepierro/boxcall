// src/components/roleBadge.js
import { createIconElement } from '@utils/iconRenderer.js';

import { BaseBadge } from './baseBadge.js';

export function roleBadge(role = 'player') {
  const roleIcons = {
    admin: 'shield',
    head_coach: 'crown',
    coach: 'user-check',
    manager: 'clipboard-list',
    player: 'user',
    parent: 'home',
  };

  const variantMap = {
    admin: 'error',
    head_coach: 'primary',
    coach: 'success',
    manager: 'warning',
    player: 'default',
    parent: 'default',
  };

  const iconName = roleIcons[role] || 'user';
  const icon = createIconElement(iconName, 'h-4 w-4');

  return BaseBadge({
    text: role.replace('_', ' ').toUpperCase(),
    variant: variantMap[role] || 'default',
    size: 'sm',
    icon,
  });
}
