import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const mainProxyTarget = env.VITE_MAIN_PROXY_TARGET || "http://localhost:8080";
  const supportProxyTarget = env.VITE_SUPPORT_PROXY_TARGET || "http://localhost:8081";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api/support": {
          target: supportProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/api/admin/support": {
          target: supportProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/ws/support": {
          target: supportProxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/api": {
          target: mainProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
