import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const envDir = "/root"; // example: parent folder
  const env = loadEnv(mode, envDir, "");

  return {
    plugins: [react()],
    base: "/ddh-portal/",
    server: {
      proxy: {
        "/api": {
          target: env.VITE_SERVER_HTTP_ADDRESS,
          changeOrigin: true,
        },
      },
    },
  };
});