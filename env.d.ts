/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_FIREBASE_API_KEY: string;
    // Add other environment variables here as needed
    VITE_MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
