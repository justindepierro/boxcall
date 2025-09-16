/* eslint-disable */
const path = require("path");

module.exports = {
  options: {
    doNotFollow: {
      path: ["node_modules", "^scripts/"],
    },
    exclude: {
      path: [
        "^docs/",
        "^errors/",
        "^scripts/",
        "^test/",
        "^src/test/",
        "^src/dev/",
        "\\.test\\.(t|j)sx?$",
        "\\.spec\\.(t|j)sx?$",
        "__tests__/",
      ],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: path.join(process.cwd(), "tsconfig.json"),
    },
    // default reporter options
  },
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-duplicate-dep-types",
      severity: "warn",
      from: {},
      to: { moreThanOneDependencyType: true },
    },
    {
      name: "not-to-deprecated",
      severity: "warn",
      from: {},
      to: { dependencyTypes: ["deprecated"] },
    },
    { name: "no-orphans", severity: "warn", from: { orphan: true }, to: {} },
    {
      name: "no-legacy-imports",
      severity: "warn",
      from: {},
      to: { path: "^src/legacy" },
    },
    {
      name: "components-not-depend-on-pages",
      severity: "error",
      from: { path: "^src/components" },
      to: { path: "^src/pages" },
    },
    {
      name: "services-not-depend-on-ui",
      severity: "error",
      from: { path: "^src/services" },
      to: { path: "^src/(components|pages|design-system)" },
    },
    {
      name: "hooks-not-depend-on-pages",
      severity: "error",
      from: { path: "^src/hooks" },
      to: { path: "^src/pages" },
    },
    {
      name: "domain-isolation",
      severity: "error",
      from: { path: "^src/domain" },
      to: { path: "^src/(app|components|pages|navigation|routes)" },
    },
    {
      name: "infra-not-depend-on-ui",
      severity: "error",
      from: { path: "^src/infra" },
      to: { path: "^src/(components|pages|design-system)" },
    },
    {
      name: "state-not-depend-on-ui",
      severity: "error",
      from: { path: "^src/(state|stores)" },
      to: { path: "^src/(components|pages|design-system)" },
    },
    {
      name: "utils-stay-generic",
      severity: "warn",
      from: { path: "^src/utils" },
      to: { path: "^src/(components|pages)" },
    },
    {
      name: "navigation-not-imported-by-lower-layers",
      severity: "warn",
      from: {
        path: "^src/(components|services|hooks|utils|domain|infra|state|stores)",
      },
      to: { path: "^src/(navigation|routes)" },
    },
    {
      name: "prefer-service-barrel",
      severity: "warn",
      from: { path: "^src/(pages|components|hooks)" },
      to: {
        path: "^src/services/.+/.+\\.(ts|tsx)$",
        pathNot: "^src/services/index\\.(ts|tsx)$",
      },
    },
  ],
};
