import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist-extension/*", "build", "chrome", "src/vendor"]
  },
  js.configs.recommended,
  {
    "rules": {
      "dot-notation": 2,
      "max-statements-per-line": 2,
    },
  },
  {
    files: ["src/**/*"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
      sourceType: "script"
    },
  },
  {
    files: ["test/**/*", "tools/**/*"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "module"
    }
  }
];
