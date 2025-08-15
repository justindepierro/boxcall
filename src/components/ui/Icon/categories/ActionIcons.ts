/**
 * Action Icons Category
 *
 * Icons for user actions, controls, and status indicators
 * Tree-shakeable icon category - only loads when action icons are used
 */

import {
  Plus,
  Minus,
  Edit3 as Edit,
  Trash2 as Delete,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  Info,
  Archive,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  RefreshCw,
  Power,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  FileDown,
  Printer,
  Share,
  Eye,
  EyeOff,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Action icon names type
export type ActionIconName =
  | "plus"
  | "plus-circle"
  | "minus"
  | "minus-circle"
  | "edit"
  | "delete"
  | "save"
  | "download"
  | "upload"
  | "copy"
  | "check"
  | "check-circle"
  | "x-circle"
  | "alert"
  | "alert-triangle"
  | "alert-octagon"
  | "warning"
  | "info"
  | "help"
  | "archive"
  | "rotate-ccw"
  | "rotate-cw"
  | "undo"
  | "redo"
  | "refresh"
  | "power"
  | "pdf"
  | "print"
  | "export"
  | "share"
  | "eye"
  | "eye-off";

// Action icons mapping
const actionIcons = {
  plus: Plus,
  "plus-circle": PlusCircle,
  minus: Minus,
  "minus-circle": MinusCircle,
  edit: Edit,
  delete: Delete,
  save: Save,
  download: Download,
  upload: Upload,
  copy: Copy,
  check: Check,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  alert: AlertCircle,
  "alert-triangle": AlertTriangle,
  "alert-octagon": AlertOctagon,
  warning: AlertTriangle,
  info: Info,
  help: HelpCircle,
  archive: Archive,
  "rotate-ccw": RotateCcw,
  "rotate-cw": RotateCw,
  undo: Undo,
  redo: Redo,
  refresh: RefreshCw,
  power: Power,
  pdf: FileDown,
  print: Printer,
  export: Share,
  share: Share,
  eye: Eye,
  "eye-off": EyeOff,
};

// Register action icons on module load
registerIconCategory("actions", actionIcons);

// Deprecated legacy ActionIcons. Do not import.
export {};
