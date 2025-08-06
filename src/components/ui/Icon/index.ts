/**
 * Icon System - Main Barrel Export
 *
 * Professional icon system with perfect tree shaking and lazy loading
 * Only loads the icon categories and components that are actually used
 */

// Core icon component and types (always needed)
export { Icon } from "./Icon";
export type { IconName, IconProps } from "./types";

// Smart icon system for intelligent selection
export { SmartIconSystem } from "./SmartIconSystem";

// Convenience components (load their dependencies lazily)
export {
  PlayIcon,
  PauseIcon,
  EditIcon,
  DeleteIcon,
  AddIcon,
} from "./convenience";
export {
  PDFIcon,
  CalendarIcon,
  ClockIcon,
  TeamIcon,
  SettingsIcon,
} from "./common";
