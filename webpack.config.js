module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    lib: './index',
  },
  output: {
    library: 'lib',
    libraryTarget: 'umd',
    filename: 'rc.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
};
