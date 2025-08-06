/**
 * System Icons Category
 *
 * Icons for system functions, files, and miscellaneous functionality
 * Tree-shakeable icon category - default category for uncategorized icons
 */

import {
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Book,
  Files,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  FileEdit,
  FileSearch,
  FolderPlus,
  FolderMinus,
  Database,
  Code,
  Terminal,
  Bug,
  Calculator,
  Beaker,
  Microscope,
  Telescope,
  Atom,
  Dna,
  Magnet,
  Flashlight,
  Lightbulb,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryLow,
  Cpu,
  HardDrive,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Mouse,
  Keyboard,
  Sun,
  Moon,
  Sparkles,
  Rainbow,
  Anchor,
  Tent,
  Backpack,
  Glasses,
  Snowflake,
  Droplet,
  Waves,
  Mountain,
  Handshake,
  Hash,
  Binary,
  Percent,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// System icon names type
export type SystemIconName =
  | "file"
  | "files"
  | "file-plus"
  | "file-minus"
  | "file-check"
  | "file-x"
  | "file-edit"
  | "file-search"
  | "folder"
  | "folder-open"
  | "folder-plus"
  | "folder-minus"
  | "search"
  | "filter"
  | "sort-asc"
  | "sort-desc"
  | "book"
  | "database"
  | "code"
  | "terminal"
  | "bug-icon"
  | "calculator"
  | "beaker"
  | "microscope"
  | "telescope"
  | "atom"
  | "dna"
  | "magnet"
  | "attraction"
  | "flashlight"
  | "bulb"
  | "wifi"
  | "wifi-off"
  | "bluetooth"
  | "battery"
  | "battery-low"
  | "cpu"
  | "hard-drive"
  | "smartphone"
  | "laptop"
  | "monitor"
  | "tablet"
  | "mouse"
  | "keyboard"
  | "sun"
  | "moon"
  | "sparkles"
  | "rainbow"
  | "anchor"
  | "tent"
  | "backpack"
  | "glasses"
  | "snowflake"
  | "droplet"
  | "waves"
  | "mountain"
  | "handshake"
  | "hash"
  | "binary"
  | "percent";

// System icons mapping
const systemIcons = {
  file: FileText,
  files: Files,
  "file-plus": FilePlus,
  "file-minus": FileMinus,
  "file-check": FileCheck,
  "file-x": FileX,
  "file-edit": FileEdit,
  "file-search": FileSearch,
  folder: Folder,
  "folder-open": FolderOpen,
  "folder-plus": FolderPlus,
  "folder-minus": FolderMinus,
  search: Search,
  filter: Filter,
  "sort-asc": SortAsc,
  "sort-desc": SortDesc,
  book: Book,
  database: Database,
  code: Code,
  terminal: Terminal,
  "bug-icon": Bug,
  calculator: Calculator,
  beaker: Beaker,
  microscope: Microscope,
  telescope: Telescope,
  atom: Atom,
  dna: Dna,
  magnet: Magnet,
  attraction: Magnet,
  flashlight: Flashlight,
  bulb: Lightbulb,
  wifi: Wifi,
  "wifi-off": WifiOff,
  bluetooth: Bluetooth,
  battery: Battery,
  "battery-low": BatteryLow,
  cpu: Cpu,
  "hard-drive": HardDrive,
  smartphone: Smartphone,
  laptop: Laptop,
  monitor: Monitor,
  tablet: Tablet,
  mouse: Mouse,
  keyboard: Keyboard,
  sun: Sun,
  moon: Moon,
  sparkles: Sparkles,
  rainbow: Rainbow,
  anchor: Anchor,
  tent: Tent,
  backpack: Backpack,
  glasses: Glasses,
  snowflake: Snowflake,
  droplet: Droplet,
  waves: Waves,
  mountain: Mountain,
  handshake: Handshake,
  hash: Hash,
  binary: Binary,
  percent: Percent,
};

// Register system icons on module load
registerIconCategory("system", systemIcons);
