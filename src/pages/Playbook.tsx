import React from "react";

import { PlaybookPage } from "./PlaybookPage";
import { Layout } from "../components/layout/Layout";
/**
 * Playbook - Team plays and strategy management
 * Available to all team members with role-based permissions
 *
 * Features:
 * - Builder Mode: Step-by-step play creation wizard
 * - CSV Import: Bulk import existing playbooks
 * - Play library and organization with visual cards
 * - Search and filtering by formation, down, distance
 * - One-word play calls for audibles
 * - Integration scaffold for future Play Diagram Editor
 */

export const Playbook: React.FC = () => (
  <Layout>
    <PlaybookPage />
  </Layout>
);
export default Playbook;
