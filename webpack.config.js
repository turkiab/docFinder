const path = require('path');

module.exports = {
  // ... other Webpack configuration options ...

  resolve: {
    fallback: {
      "buffer": require.resolve("buffer/")
    }
  },

  // ... other Webpack configuration options ...
};
