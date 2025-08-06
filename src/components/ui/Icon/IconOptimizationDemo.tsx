/**
 * Icon Optimization Demo Component
 * 
 * Demonstrates the difference between:
 * 1. Original Icon system (998 lines, loads everything)
 * 2. Modular Icon system (loads only what's needed)
 */

import React from "react";
import { Card } from "../Card";
// import { Typography } from "../Typography"; // TODO: Fix typography import

// Original icon system (loads everything)
import { Icon } from "./Icon";

// Modular icon system (loads only what's needed)
import { ModularIcon } from "./ModularIcon";

export const IconOptimizationDemo: React.FC = () => {
  const [showComparison, setShowComparison] = React.useState(false);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          🎯 Icon System Optimization Demo
        </h1>
        <p className="text-gray-600">
          Compare bundle sizes: Original (998 lines) vs Modular (tree-shakeable)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original System */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="alert-triangle" size="lg" color="warning" />
            <h3 className="text-xl font-semibold">Original System</h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              • Imports all 300+ icons upfront<br/>
              • 998 lines in single file<br/>
              • No tree shaking possible<br/>
              • Bundle impact: ~50KB+ always loaded
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Icon name="play" size="md" color="jade" />
              <Icon name="edit" size="md" color="slate" />
              <Icon name="delete" size="md" color="error" />
              <Icon name="check" size="md" color="success" />
              <Icon name="calendar" size="md" color="navy" />
            </div>
            
            <p className="text-xs text-orange-600">
              ⚠️ Loads 300+ icons even if only using 5
            </p>
          </div>
        </Card>

        {/* Modular System */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ModularIcon name="target" size={24} color="jade" />
            <h3 className="text-xl font-semibold">Modular System</h3>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              • Dynamic imports per icon<br/>
              • Category-based tree shaking<br/>
              • Only loads icons actually used<br/>
              • Bundle impact: ~2-5KB per icon category
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <ModularIcon name="play" size="md" color="jade" />
              <ModularIcon name="edit" size="md" color="slate" />
              <ModularIcon name="delete" size="md" color="error" />
              <ModularIcon name="check" size="md" color="success" />
              <ModularIcon name="calendar" size="md" color="navy" />
            </div>
            
            <p className="text-xs text-green-600">
              ✅ Only loads the 5 icons being used
            </p>
          </div>
        </Card>
      </div>

      {/* Performance Comparison */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          📊 Performance Impact
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">50KB+</div>
            <div className="text-sm font-medium">Original Bundle Size</div>
            <div className="text-xs text-gray-500">Always loaded</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">~5KB</div>
            <div className="text-sm font-medium">Modular Bundle Size</div>
            <div className="text-xs text-gray-500">Only what's used</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">90%</div>
            <div className="text-sm font-medium">Bundle Reduction</div>
            <div className="text-xs text-gray-500">Potential savings</div>
          </div>
        </div>
      </Card>

      {/* Migration Strategy */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          🔄 Safe Migration Strategy
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">1</div>
            <div>
              <div className="font-medium">Keep Original System</div>
              <div className="text-sm text-gray-600">Existing components continue to work unchanged</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">2</div>
            <div>
              <div className="font-medium">Introduce ModularIcon</div>
              <div className="text-sm text-gray-600">New components can opt into the optimized system</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">3</div>
            <div>
              <div className="font-medium">Gradual Migration</div>
              <div className="text-sm text-gray-600">Update components one by one, test thoroughly</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mt-0.5">4</div>
            <div>
              <div className="font-medium">Complete Transition</div>
              <div className="text-sm text-gray-600">Eventually replace original system entirely</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Controls */}
      <div className="text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="px-6 py-3 bg-jade-600 text-white rounded-lg hover:bg-jade-700 transition-colors"
        >
          {showComparison ? "Hide" : "Show"} Detailed Comparison
        </button>
      </div>

      {showComparison && (
        <Card className="p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">
            🔍 Implementation Details
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-medium mb-2">Original Icon Usage:</div>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`import { Icon } from "./Icon";

// Loads entire 998-line file
<Icon name="play" />
<Icon name="edit" />
// Bundle: ~50KB+ icons loaded`}
              </pre>
            </div>
            
            <div>
              <div className="font-medium mb-2">Modular Icon Usage:</div>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
{`import { ModularIcon } from "./ModularIcon";

// Only loads specific icons used
<ModularIcon name="play" />
<ModularIcon name="edit" />
// Bundle: ~5KB only needed icons`}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
