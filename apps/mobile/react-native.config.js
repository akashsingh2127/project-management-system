const path = require('path');

module.exports = {
  dependencies: {
    'react-native-auth0': {
      root: path.resolve(__dirname, '../../node_modules/react-native-auth0'),
    },
    'react-native-mmkv': {
      root: path.resolve(__dirname, '../../node_modules/react-native-mmkv'),
    },
    'react-native-screens': {
      root: path.resolve(__dirname, '../../node_modules/react-native-screens'),
    },
    'react-native-safe-area-context': {
      root: path.resolve(__dirname, '../../node_modules/react-native-safe-area-context'),
    },
  },
};
