// webpack.config.js
module.exports = {
    entry: './dist/index.js', // Your entry file
    output: {
      filename: 'bundle.js', // Output bundle file
      path: __dirname + "/target", // Output directory
    },
    mode: 'development', // or 'production'
  };
