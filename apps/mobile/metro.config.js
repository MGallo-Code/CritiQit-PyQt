// Enable WebAssembly (wasm) assets for expo-sqlite on web
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure wasm files are treated as assets
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;


