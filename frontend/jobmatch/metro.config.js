const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ⚡ Simple optimization without custom cache store
// (Metro handles caching automatically)

// ⚡ Optimize resolver for faster module lookup
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts],
};

// ⚡ Optimize transformer
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: false, // Keep console logs in dev
    },
  },
};

module.exports = withNativeWind(config, { 
  input: './global.css',
  configPath: './tailwind.config.js'
});
