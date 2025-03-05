/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */

import { fixupPluginRules } from '@eslint/compat';
import jsEslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sortKeysPlugin from 'eslint-plugin-sort-keys';
import tsSortKeysPlugin from 'eslint-plugin-typescript-sort-keys';
import tsEslint from 'typescript-eslint';

export default tsEslint.config([
  jsEslint.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  reactPlugin.configs.flat.recommended,
  jestPlugin.configs['flat/recommended'],
  {
    name: 'eslint-plugin-react-native',
    plugins: {
      'react-native': fixupPluginRules({
        rules: reactNativePlugin.rules,
      }),
    },
    rules: reactNativePlugin.configs.all.rules,
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsEslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
          legacyDecorators: true,
        },
        ecmaVersion: 2020,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      import: importPlugin,
      jest: jestPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'sort-keys': sortKeysPlugin,
      'typescript-sort-keys': tsSortKeysPlugin,
    },

    rules: {
      ...reactHooksPlugin.configs.recommended.rules,

      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          selector: 'property',
        },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      'comma-dangle': 'off',
      'import/export': 'off',
      indent: 'off',
      'jest/expect-expect': 'off',
      'jest/no-disabled-tests': 'warn',
      'multiline-ternary': 'off',
      'no-duplicate-imports': 'warn',
      'no-redeclare': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              importNames: ['SafeAreaView'],
              message:
                "Please use SafeAreaView from 'react-native-safe-area-context' instead.",
              name: 'react-native',
            },
            {
              importNames: ['ActivityIndicator'],
              message:
                "Please use ActivityIndicator from '@procivis/one-react-native-components' or ListPageLoadingIndicator instead.",
              name: 'react-native',
            },
            {
              message: "Please use '@react-navigation/native'",
              name: '@react-navigation/core',
            },
          ],
          patterns: ['**/theme/flavors/**/*'],
        },
      ],
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      quotes: 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-native/no-color-literals': 'error',
      'react/jsx-fragments': 'off',
      'react/jsx-handler-names': 'off',
      'react/jsx-sort-props': 'warn',
      'react/no-unused-prop-types': 'off',
      'react/prop-types': 'off',
      semi: 'off',
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': 'warn',
      'sort-keys': 'off',
      'sort-keys/sort-keys-fix': 'warn',
      'space-before-function-paren': 'off',
      'typescript-sort-keys/interface': 'warn',
      'typescript-sort-keys/string-enum': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ignores: ['.yalc', 'yarn', 'scripts'],
  },
]);
