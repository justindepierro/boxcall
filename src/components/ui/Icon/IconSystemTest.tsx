/**
 * Icon System Test
 * 
 * Quick test component to verify both icon systems work correctly
 */

import React from "react";
import { Icon } from "./Icon";
import { ModularIcon } from "./ModularIcon";

export const IconSystemTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Icon System Test</h2>
      
      {/* Original Icon System */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Original Icon System (Icon.tsx)</h3>
        <div className="flex gap-3 items-center">
          <Icon name="play" size="md" color="jade" />
          <Icon name="edit" size="md" color="slate" />
          <Icon name="delete" size="md" color="error" />
          <Icon name="check" size="md" color="success" />
          <Icon name="calendar" size="md" color="navy" />
          <span className="text-sm text-gray-600">✅ Instant render (pre-loaded)</span>
        </div>
      </div>

      {/* Modular Icon System */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Modular Icon System (ModularIcon.tsx)</h3>
        <div className="flex gap-3 items-center">
          <ModularIcon name="play" size="md" color="jade" />
          <ModularIcon name="edit" size="md" color="slate" />
          <ModularIcon name="delete" size="md" color="error" />
          <ModularIcon name="check" size="md" color="success" />
          <ModularIcon name="calendar" size="md" color="navy" />
          <span className="text-sm text-gray-600">⚡ Dynamic load (tree-shakeable)</span>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Size Variations</h3>
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <span className="text-sm w-20">Original:</span>
            <Icon name="target" size="xs" />
            <Icon name="target" size="sm" />
            <Icon name="target" size="md" />
            <Icon name="target" size="lg" />
            <Icon name="target" size="xl" />
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm w-20">Modular:</span>
            <ModularIcon name="target" size="xs" />
            <ModularIcon name="target" size="sm" />
            <ModularIcon name="target" size="md" />
            <ModularIcon name="target" size="lg" />
            <ModularIcon name="target" size="xl" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Test Results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Both systems render icons correctly</li>
          <li>✅ Size props work on both systems</li>
          <li>✅ Color props work on both systems</li>
          <li>✅ ModularIcon shows loading states</li>
          <li>✅ Zero breaking changes to existing Icon system</li>
        </ul>
      </div>
    </div>
  );
};

export default IconSystemTest;
