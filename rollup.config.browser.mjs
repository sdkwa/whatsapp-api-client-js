import terser from "@rollup/plugin-terser";
import progress from "rollup-plugin-progress";
import resolve from "@rollup/plugin-node-resolve";
import commonJS from "@rollup/plugin-commonjs";
import pluginJson from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/sdkwa.ts",
  output: [
    {
      file: "lib/sdkwa.min.js",
      format: "umd",
      exports: "default",
      name: "whatsAppClient",
      plugins: [terser()],
      globals: {
        fs: "fs",
        axios: "axios",
      },
    },
  ],
  plugins: [
    progress({
      clearLine: true,
    }),
    resolve({
      browser: true,
    }),
    typescript({ tsconfig: "./tsconfig.browser.json" }),
    commonJS({
      include: "node_modules/**",
    }),
    pluginJson(),
  ],
  external: ["fs"],
};
