export {}; // ensure this file is a module

declare global {
  interface Window {
    api: {
      getVersion: () => string;
      ping: () => string;
    };
  }
}
