import {
  Home,
  BarChart2,
  Users,
  Settings,
  FileText,
  Grid,
  type LucideIcon,
} from "lucide-react";

export interface NavConfig {
  label: string;
  Icon: LucideIcon;
  group: "main" | "settings";
}

export interface RouteConfig {
  path: string;
  nav: NavConfig | null;
}

export const appRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    nav: { label: "Dashboard", Icon: Home, group: "main" },
  },
  {
    path: "/dashboard/analytics",
    nav: { label: "Analytics", Icon: BarChart2, group: "main" },
  },
  {
    path: "/dashboard/teams",
    nav: { label: "Teams", Icon: Users, group: "main" },
  },
  {
    path: "/dashboard/playbooks",
    nav: { label: "Playbooks", Icon: FileText, group: "main" },
  },
  {
    path: "/dashboard/settings",
    nav: { label: "Settings", Icon: Settings, group: "settings" },
  },
  {
    path: "/dashboard/component-gallery",
    nav: { label: "Components", Icon: Grid, group: "settings" },
  },
  // Non-nav routes
  { path: "/profile", nav: null },
  { path: "/calendar", nav: null },
  { path: "/playbook", nav: null },
  { path: "/boxcall", nav: null },
  { path: "/about", nav: null },
  { path: "/privacy-policy", nav: null },
  { path: "/terms-of-service", nav: null },
  { path: "/contact", nav: null },
  { path: "/team/:id/bulletin", nav: null },
  { path: "/team/:id/settings", nav: null },
];
