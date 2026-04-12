import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Phase 0 deliverable: forbid raw --lp-* tokens in components/ui/ and new
// surfaces. Legacy landing + workspace pages still reference them pending
// Phase 2-6 migration — scope the rule to the new primitives + [locale]/(dev).
const noLpTokens = {
  files: ["components/ui/**/*.{ts,tsx}", "app/[locale]/(dev)/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/--lp-[a-z0-9-]+/]",
        message:
          "Legacy --lp-* token. Use --esap-emerald-* / semantic tokens per DESIGN.md §14.",
      },
      {
        selector: "TemplateElement[value.raw=/--lp-[a-z0-9-]+/]",
        message:
          "Legacy --lp-* token. Use --esap-emerald-* / semantic tokens per DESIGN.md §14.",
      },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  noLpTokens,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
