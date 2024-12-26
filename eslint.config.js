import globals from 'globals';
import eslintJs from '@eslint/js';
import prettier from 'eslint-config-prettier';

const { browser } = globals;
const { rules } = prettier;
const { configs } = eslintJs;

const config = [
  configs.recommended,
  {
    rules: {
      "no-console": [0],
      "no-unused-vars": "warn",
      "semi": ["error", "never"],
      ...rules
    },
    files: ["src/**/*.js"],
    languageOptions: { 
      globals: browser,
      sourceType: "commonjs",
    }
  },
];

export default config;
