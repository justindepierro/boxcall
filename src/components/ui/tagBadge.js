// src/components/ui/TagBadge.js
import { BaseBadge } from './baseBadge.js';

export function TagBadge(tagName = 'default', color = 'primary') {
  return BaseBadge({
    text: `#${tagName}`,
    variant: color,
  });
}
