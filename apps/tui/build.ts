import esbuild from "esbuild";
import path from "path";

// Custom plugin to alias "react-native" to react-native-opentui
const aliasPlugin = {
  name: "alias-react-native",
  setup(build) {
    build.onResolve({ filter: /^react-native$/ }, args => {
      return {
        path: path.resolve(__dirname, "../../packages/react-native-opentui/index.tsx"),
      };
    });
  },
};

// Build configuration
await esbuild.build({
  entryPoints: ["src/index.tsx"], // your app entry
  bundle: true,                            // inline all dependencies (ui included)
  platform: "node",                        // Node/Bun target
  format: "esm",                           // keep ESM for top-level await
  outfile: "dist/index.js",
  sourcemap: true,
  plugins: [aliasPlugin],
  loader: {
    ".ts": "ts",
    ".tsx": "tsx",
  },
  external: [
    // leave OpenTUI and Bun built-ins for Bun runtime
    "react",
    "@opentui/core",
    "@opentui/react",
    "@opentui/react/jsx-runtime",
    "bun:ffi",
    // "./assets/**/*.scm",
    // "./assets/**/*.wasm",
  ],
});

console.log("✅ App bundled successfully");
