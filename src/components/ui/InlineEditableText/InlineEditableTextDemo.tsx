import React, { useState } from "react";
import { InlineEditableText } from "./InlineEditableText";
import { Typography } from "../../design-system/Typography";
import { Card } from "../Card";

/**
 * Demo component showcasing InlineEditableText features
 * This demonstrates all the validation and styling features
 */
export const InlineEditableTextDemo: React.FC = () => {
  const [demoValues, setDemoValues] = useState({
    basic: "Click to edit",
    lengthLimited: "QB",
    symbolAllowed: "QB#1",
    symbolNotAllowed: "QB",
    customValidation: "Test",
    warningExample: "ABC",
  });

  const updateValue = (key: keyof typeof demoValues, value: string) => {
    setDemoValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      <Typography variant="headline-lg" className="mb-6">
        InlineEditableText Component Demo
      </Typography>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Basic Usage
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Basic Editable Text:
            </label>
            <InlineEditableText
              value={demoValues.basic}
              onChange={(value) => updateValue("basic", value)}
              placeholder="Click to edit this text..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Length Validation
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Max 2 Characters (Diagram Safe):
            </label>
            <InlineEditableText
              value={demoValues.lengthLimited}
              onChange={(value) => updateValue("lengthLimited", value)}
              placeholder="QB"
              maxRecommendedLength={2}
              showLengthWarnings={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Long Text (Shows Warning):
            </label>
            <InlineEditableText
              value={demoValues.warningExample}
              onChange={(value) => updateValue("warningExample", value)}
              placeholder="ABC"
              maxRecommendedLength={2}
              showLengthWarnings={true}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Symbol Validation
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Symbols Allowed:
            </label>
            <InlineEditableText
              value={demoValues.symbolAllowed}
              onChange={(value) => updateValue("symbolAllowed", value)}
              placeholder="QB#1"
              allowSymbols={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Symbols NOT Allowed:
            </label>
            <InlineEditableText
              value={demoValues.symbolNotAllowed}
              onChange={(value) => updateValue("symbolNotAllowed", value)}
              placeholder="QB"
              allowSymbols={false}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Custom Validation
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Must contain 'QB' (Custom Validation):
            </label>
            <InlineEditableText
              value={demoValues.customValidation}
              onChange={(value) => updateValue("customValidation", value)}
              placeholder="QB Test"
              customValidator={(value) => {
                if (!value.toUpperCase().includes("QB")) {
                  return {
                    isValid: false,
                    message: "Text must contain 'QB'",
                    level: "error",
                  };
                }
                return { isValid: true };
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Size Variants
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Small Size:
            </label>
            <InlineEditableText value="Small" onChange={() => {}} size="sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Medium Size (Default):
            </label>
            <InlineEditableText value="Medium" onChange={() => {}} size="md" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Large Size:
            </label>
            <InlineEditableText value="Large" onChange={() => {}} size="lg" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Visual States
        </Typography>
        <Typography variant="body-sm" className="mb-4 text-text-secondary">
          Try editing the fields below to see different validation states:
        </Typography>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Valid State (Green when editing):
            </label>
            <InlineEditableText value="Valid" onChange={() => {}} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Try adding symbols to see error state:
            </label>
            <InlineEditableText
              value="NoSymbols"
              onChange={() => {}}
              allowSymbols={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Try long text for warning:
            </label>
            <InlineEditableText
              value="Short"
              onChange={() => {}}
              maxRecommendedLength={2}
              showLengthWarnings={true}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
