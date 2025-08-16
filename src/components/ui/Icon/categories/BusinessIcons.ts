/**
 * Business Icons Category
 *
 * Icons for business, team management, and organization
 * Tree-shakeable icon category - only loads when business icons are used
 */

import {
  Users,
  User,
  UserCheck,
  UserPlus,
  UserMinus,
  Briefcase,
  Building,
  Building2,
  Globe,
  Shield,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Fingerprint,
  Scan,
  QrCode,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Business icon names type
export type BusinessIconName =
  | "users"
  | "user"
  | "user-check"
  | "user-plus"
  | "user-minus"
  | "team"
  | "briefcase"
  | "building"
  | "building-2"
  | "globe"
  | "shield"
  | "lock"
  | "unlock"
  | "key"
  | "shield-check"
  | "shield-alert"
  | "shield-x"
  | "fingerprint"
  | "scan"
  | "qr-code";

// Business icons mapping
const businessIcons = {
  users: Users,
  user: User,
  "user-check": UserCheck,
  "user-plus": UserPlus,
  "user-minus": UserMinus,
  team: Users,
  briefcase: Briefcase,
  building: Building,
  "building-2": Building2,
  globe: Globe,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  key: Key,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  "shield-x": ShieldX,
  fingerprint: Fingerprint,
  scan: Scan,
  "qr-code": QrCode,
};

// Register business icons on module load
registerIconCategory("business", businessIcons);

// Deprecated legacy BusinessIcons. Do not import.
export {};
