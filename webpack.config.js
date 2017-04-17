const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/client/main.js'],
  output: {
    path: path.join(__dirname, "public"),
    filename: '[name].dist.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [
          path.resolve(__dirname, "src"),
          //path.resolve(__dirname, "node_modules/tingle.js/src"),
        ],
        //exclude: /(node_modules|bower_components)/,
        //include: [/node_modules\/custombox\/dist/],
        query: {
          presets: ['es2015'],
        }
      },
    ],
  },
  devtool: 'source-map',
};
