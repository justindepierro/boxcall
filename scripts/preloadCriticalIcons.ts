import { preloadIcons } from "../src/components/ui/Icon/preloadIcons";
import type { ModularIconName } from "../src/components/ui/Icon/ModularIcon";
import criticalIconsRaw from "./criticalIcons.json";
const criticalIcons = criticalIconsRaw as ModularIconName[];
preloadIcons(criticalIcons);
