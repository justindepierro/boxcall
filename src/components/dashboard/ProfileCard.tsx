/**
 * ProfileCard - Re-export from modular structure
 *
 * The ProfileCard component has been split into focused sub-components:
 * - ProfileCard/ProfileCard.tsx - Main component (reduced complexity)
 * - ProfileCard/AchievementsGrid.tsx - Achievement display
 * - ProfileCard/BioSection.tsx - Bio editing
 * - ProfileCard/ProfileAvatarSection.tsx - Avatar & name display
 */
export { default, ProfileCard } from "./ProfileCard/index";
