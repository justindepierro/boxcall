/**
 * Sports Icons Category
 *
 * Icons for sports, achievements, and athletic activities
 * Tree-shakeable icon category - only loads when sports icons are used
 */

import {
  Target,
  Flag,
  Award,
  Trophy,
  Medal,
  Flame,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Crosshair,
  MapPin,
  LineChart,
  Heart,
  Rocket,
} from "lucide-react";

import { registerIconCategory } from "../registry";

// Sports icon names type
export type SportsIconName =
  | "target"
  | "flag"
  | "award"
  | "trophy"
  | "medal"
  | "flame"
  | "fire"
  | "crown"
  | "star"
  | "favorite"
  | "trending-up"
  | "trending-down"
  | "bar-chart"
  | "pie-chart"
  | "line-chart"
  | "activity"
  | "crosshair"
  | "location"
  | "zap"
  | "lightning"
  | "energy"
  | "heart"
  | "rocket";

// Sports icons mapping
const sportsIcons = {
  target: Target,
  flag: Flag,
  award: Award,
  trophy: Trophy,
  medal: Medal,
  flame: Flame,
  fire: Flame,
  crown: Crown,
  star: Star,
  favorite: Star,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "bar-chart": BarChart3,
  "pie-chart": PieChart,
  "line-chart": LineChart,
  activity: Activity,
  crosshair: Crosshair,
  location: MapPin,
  zap: Zap,
  lightning: Zap,
  energy: Zap,
  heart: Heart,
  rocket: Rocket,
};

// Register sports icons on module load
registerIconCategory("sports", sportsIcons);

// Deprecated legacy SportsIcons. Do not import.
export {};
