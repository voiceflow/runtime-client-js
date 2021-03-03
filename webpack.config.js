const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'inline-source-map',
  entry: {
    lib: './index',
  },
  output: {
    library: 'vfrc',
    libraryTarget: 'umd',
    filename: 'vf-runtime-client.js',
    path: path.resolve(__dirname, 'umd'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': __dirname,
    },
  },
  module: {
    rules: [{ test: /\.ts?$/, loader: 'ts-loader' }],
  },
  stats: {
    errorDetails: true,
  },
};