/**
 * Navigation Icons Category
 *
 * Icons for navigation, layout, and directional controls
 * Tree-shakeable icon category - only loads when navigation icons are used
 */

import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Settings,
  Sidebar,
  Grid,
  List,
  MoreHorizontal,
  MoreVertical,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowLeftRight,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Navigation icon names type
export type NavigationIconName =
  | "menu"
  | "close"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "chevrons-up"
  | "chevrons-down"
  | "chevrons-left"
  | "chevrons-right"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "arrow-down"
  | "arrow-up-down"
  | "arrow-left-right"
  | "move"
  | "move-up"
  | "move-down"
  | "move-left"
  | "move-right"
  | "home"
  | "settings"
  | "sidebar"
  | "grid"
  | "list"
  | "more-horizontal"
  | "more-vertical";

// Navigation icons mapping
const navigationIcons = {
  menu: Menu,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevrons-up": ChevronsUp,
  "chevrons-down": ChevronsDown,
  "chevrons-left": ChevronsLeft,
  "chevrons-right": ChevronsRight,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-up-down": ArrowUpDown,
  "arrow-left-right": ArrowLeftRight,
  move: Move,
  "move-up": MoveUp,
  "move-down": MoveDown,
  "move-left": MoveLeft,
  "move-right": MoveRight,
  home: Home,
  settings: Settings,
  sidebar: Sidebar,
  grid: Grid,
  list: List,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
};

// Register navigation icons on module load
registerIconCategory("navigation", navigationIcons);

// Deprecated legacy NavigationIcons. Do not import.
export {};
