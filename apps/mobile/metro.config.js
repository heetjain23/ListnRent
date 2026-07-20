// Metro config to support .mjs files used by some packages (e.g. lucide-react-native)
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const { resolver } = config;
  // Ensure Metro resolves .mjs and .cjs modules
  resolver.sourceExts = Array.from(new Set([...(resolver.sourceExts || []), 'mjs', 'cjs']));
  return config;
})();
