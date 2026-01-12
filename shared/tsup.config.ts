import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts", "types/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
