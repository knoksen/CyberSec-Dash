export {}; // ensure this file is a module

declare global {
  interface Window {
    api: {
      getVersion: () => string;
      ping: () => string;
      getAppInfo: () => Promise<{
        name: string;
        version: string;
        electron: string;
        chrome?: string;
        node?: string;
      }>;
  getLogPath: () => Promise<{ directory: string | null; file: string | null }>;
  getPendingDeepLink: () => Promise<string | null>;
    };
  }
}
