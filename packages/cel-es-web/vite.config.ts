import { defineConfig } from "vite";

export default defineConfig({
  test: {
    deps: {
      external: ["web-tree-sitter"],
    },
  },
});
