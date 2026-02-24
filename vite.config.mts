import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite configuration for the "اختصرلى" React app.
// This enables React fast refresh and (optionally) TailwindCSS.
export default defineConfig({
  plugins: [
    react(),
    // TailwindCSS v4 style plugin. You can remove this
    // if you decide not to use any Tailwind utilities.
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
});

