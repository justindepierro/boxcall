/**
 * Test page for Pixi.js Diagram Editor
 * 
 * Navigate to /diagram-test to see the new editor
 */

import React from 'react';
import { DiagramEditor } from '../components/playbook/diagram-editor';

export const DiagramV2TestPage: React.FC = () => {
  return (
    <div className="w-screen h-screen">
      <DiagramEditor />
    </div>
  );
};

export default DiagramV2TestPage;
