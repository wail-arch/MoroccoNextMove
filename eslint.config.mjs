import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundary: src/core is the pure domain + engine layer.
  // It must run identically on the server, in the browser, and offline,
  // so it may import only zod and other core modules.
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "react/*",
                "next",
                "next/*",
                "next-intl",
                "next-intl/*",
                "@/app/*",
                "@/ui/*",
                "@/lib/*",
                "@/data/*",
                "@/i18n/*",
              ],
              message:
                "src/core must stay pure: only zod and core-internal imports are allowed.",
            },
          ],
        },
      ],
    },
  },
  // src/data (providers + seeds) may depend on core, but never on UI or framework.
  {
    files: ["src/data/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "react/*",
                "next",
                "next/*",
                "next-intl",
                "next-intl/*",
                "@/app/*",
                "@/ui/*",
                "@/i18n/*",
              ],
              message:
                "src/data may import @/core and @/lib only — no UI or framework imports.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
