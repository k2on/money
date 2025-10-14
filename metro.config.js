const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname)

// Add wasm asset support
config.resolver.assetExts.push("wasm");

config.resolver.unstable_enablePackageExports = true; 

module.exports = config;
