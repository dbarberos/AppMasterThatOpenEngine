/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_FIREBASE_API_KEY: string;
    // Add other environment variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}