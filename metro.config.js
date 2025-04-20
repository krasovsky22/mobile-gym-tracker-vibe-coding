const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Add custom resolver for react-dom
config.resolver.extraNodeModules = {
  'react-dom': require.resolve('react-native'),
};

module.exports = withNativeWind(config, { input: './global.css' });
