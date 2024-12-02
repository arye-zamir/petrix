import { readFileSync } from "node:fs";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const banner = `/*!
 * Petrix v${pkg.version}
 * (c) ${new Date().getFullYear()} Arye Zamir
 * Released under the MIT License.
 */`;

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const basePlugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.build.json",
    declaration: false,
    declarationDir: undefined,
  }),
];

// Production plugins including minification
const prodPlugins = [
  ...basePlugins,
  terser({
    output: {
      comments: /^!/, // Preserve license banner
    },
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      drop_console: true,
    },
  }),
];

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
        banner,
      },
    ],
    external,
    plugins: basePlugins,
  },

  // CommonJS build
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        banner,
      },
    ],
    external,
    plugins: basePlugins,
  },

  // UMD build (minified)
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.unpkg,
        format: "umd",
        name: "Petrix",
        sourcemap: true,
        banner,
        globals: {
          // Add global dependencies here if needed
        },
      },
    ],
    external,
    plugins: prodPlugins,
  },

  // Types bundle
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
    external,
  },
];
