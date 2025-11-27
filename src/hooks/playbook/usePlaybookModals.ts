/**
 * usePlaybookModals - Hook for managing all modal states in PlaybookPage
 *
 * Consolidates 8+ modal states into a single hook for better organization
 * and easier testing/maintenance.
 */

import { useState } from "react";
import type { Play } from "../../types/play";

export interface PlaybookModalState {
  // Core modals
  showAddNewPlayModal: boolean;
  showPlaybookSettingsModal: boolean;
  showPersonnelModal: boolean;
  showPlaybookHealthModal: boolean;
  showKeyboardShortcuts: boolean;
  showStatsSheet: boolean;
  showPostToBulletinModal: boolean;

  // Mobile sheets
  showFiltersSheet: boolean;

  // Data for modals
  editingPlay: Play | null;
  playToPost: Play | null;
  diagramPlay: Play | null;
  assignmentsPlay: Play | null;
}

export interface PlaybookModalActions {
  // Modal openers
  openAddNewPlayModal: () => void;
  openPlaybookSettingsModal: () => void;
  openPersonnelModal: () => void;
  openPlaybookHealthModal: () => void;
  openKeyboardShortcuts: () => void;
  openStatsSheet: () => void;
  openPostToBulletinModal: (play: Play) => void;
  openFiltersSheet: () => void;

  // Modal closers
  closeAddNewPlayModal: () => void;
  closePlaybookSettingsModal: () => void;
  closePersonnelModal: () => void;
  closePlaybookHealthModal: () => void;
  closeKeyboardShortcuts: () => void;
  closeStatsSheet: () => void;
  closePostToBulletinModal: () => void;
  closeFiltersSheet: () => void;

  // Data setters
  setEditingPlay: (play: Play | null) => void;
  setDiagramPlay: (play: Play | null) => void;
  setAssignmentsPlay: (play: Play | null) => void;
}

export function usePlaybookModals() {
  // Modal visibility states
  const [showAddNewPlayModal, setShowAddNewPlayModal] = useState(false);
  const [showPlaybookSettingsModal, setShowPlaybookSettingsModal] =
    useState(false);
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showPlaybookHealthModal, setShowPlaybookHealthModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showStatsSheet, setShowStatsSheet] = useState(false);
  const [showPostToBulletinModal, setShowPostToBulletinModal] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);

  // Modal data states
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [playToPost, setPlayToPost] = useState<Play | null>(null);
  const [diagramPlay, setDiagramPlay] = useState<Play | null>(null);
  const [assignmentsPlay, setAssignmentsPlay] = useState<Play | null>(null);

  const state: PlaybookModalState = {
    showAddNewPlayModal,
    showPlaybookSettingsModal,
    showPersonnelModal,
    showPlaybookHealthModal,
    showKeyboardShortcuts,
    showStatsSheet,
    showPostToBulletinModal,
    showFiltersSheet,
    editingPlay,
    playToPost,
    diagramPlay,
    assignmentsPlay,
  };

  const actions: PlaybookModalActions = {
    // Openers
    openAddNewPlayModal: () => setShowAddNewPlayModal(true),
    openPlaybookSettingsModal: () => setShowPlaybookSettingsModal(true),
    openPersonnelModal: () => setShowPersonnelModal(true),
    openPlaybookHealthModal: () => setShowPlaybookHealthModal(true),
    openKeyboardShortcuts: () => setShowKeyboardShortcuts(true),
    openStatsSheet: () => setShowStatsSheet(true),
    openPostToBulletinModal: (play: Play) => {
      setPlayToPost(play);
      setShowPostToBulletinModal(true);
    },
    openFiltersSheet: () => setShowFiltersSheet(true),

    // Closers
    closeAddNewPlayModal: () => setShowAddNewPlayModal(false),
    closePlaybookSettingsModal: () => setShowPlaybookSettingsModal(false),
    closePersonnelModal: () => setShowPersonnelModal(false),
    closePlaybookHealthModal: () => setShowPlaybookHealthModal(false),
    closeKeyboardShortcuts: () => setShowKeyboardShortcuts(false),
    closeStatsSheet: () => setShowStatsSheet(false),
    closePostToBulletinModal: () => {
      setShowPostToBulletinModal(false);
      setPlayToPost(null);
    },
    closeFiltersSheet: () => setShowFiltersSheet(false),

    // Data setters
    setEditingPlay,
    setDiagramPlay,
    setAssignmentsPlay,
  };

  return { state, actions };
}
