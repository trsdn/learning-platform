/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 *
 * This file provides TypeScript type declarations for import.meta.env
 * to enable type checking and autocomplete for environment variables.
 *
 * @see https://vitejs.dev/guide/env-and-mode.html
 */

interface ImportMetaEnv {
  /**
   * Application title
   * @default "Learning Platform"
   */
  readonly VITE_APP_TITLE?: string;

  /**
   * Application version
   * @default "1.0.0"
   */
  readonly VITE_APP_VERSION?: string;

  /**
   * Database name for IndexedDB
   * @default "mindforge-academy"
   */
  readonly VITE_DB_NAME?: string;

  /**
   * OpenAI API key for AI features
   */
  readonly VITE_OPENAI_API_KEY?: string;

  /**
   * Enable analytics tracking
   * @default false
   */
  readonly VITE_ENABLE_ANALYTICS?: string;

  /**
   * Enable debug mode
   * @default false
   */
  readonly VITE_ENABLE_DEBUG?: string;

  // Add other custom env variables here as needed
  // readonly VITE_CUSTOM_VAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Type definitions for CSS Modules
 *
 * Enables type-safe imports of .module.css files with autocomplete support
 * for CSS class names in TypeScript components.
 *
 * @see https://vitejs.dev/guide/features.html#css-modules
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
