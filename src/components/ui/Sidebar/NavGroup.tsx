import React, { useCallback, useId, useState } from 'react';
import { Button } from '../Button';

export interface NavGroupProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

export const NavGroup: React.FC<NavGroupProps> = ({
  id,
  label,
  icon,
  defaultExpanded = false,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();
  const toggle = useCallback(() => setExpanded((e) => !e), []);

  return (
    <li className="my-1" id={id}>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggle}
          className="w-full justify-start gap-2"
        >
          <span className="w-5 h-5 flex items-center justify-center" aria-hidden>
            {icon ?? <span>▸</span>}
          </span>
          <span className="flex-1 text-left">{label}</span>
        </Button>
      </div>
      <div id={contentId} role="group" hidden={!expanded} className="pl-4 mt-1">
        <ul role="menu" aria-label={label}>
          {children}
        </ul>
      </div>
    </li>
  );
};

export default NavGroup;
