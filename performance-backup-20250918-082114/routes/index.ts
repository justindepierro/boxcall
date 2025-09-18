export { DataRouterApp } from "./DataRouter";
export {
  requireTeamCoachLoader,
  requireTeamAnalyticsLoader,
  requireAuthenticatedLoader,
  requireTeamMemberLoader,
  requireRolesLoader,
  requireCoachOrAdminLoader,
} from "./loaderAuth";
// Legacy router and wrapper guards removed in favor of Data Router + loaders
