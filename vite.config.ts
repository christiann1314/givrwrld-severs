import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
<<<<<<< HEAD
  ],
=======
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
>>>>>>> fbe4cec62cfebef6a387d2395acb20ca3aa5d0d0
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
<<<<<<< HEAD
    dedupe: ['react', 'react-dom'],
=======
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router", "react-router-dom"],
>>>>>>> fbe4cec62cfebef6a387d2395acb20ca3aa5d0d0
  },
});
