export type SidebarMode = 'rail' | 'expanded';

export type SidebarState = {
  mode: SidebarMode;
  setMode: (m: SidebarMode) => void;
};
