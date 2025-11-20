/**
 * Application version information
 * This file is generated during build to include git commit info
 */

export interface VersionInfo {
  version: string;
  gitCommit: string;
  buildTime: string;
  environment: string;
}

export const getVersionInfo = (): VersionInfo => {
  return {
    version: import.meta.env.VITE_APP_VERSION || "dev",
    gitCommit: import.meta.env.VITE_GIT_COMMIT || "unknown",
    buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
    environment: import.meta.env.MODE || "development",
  };
};
