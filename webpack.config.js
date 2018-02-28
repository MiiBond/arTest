var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './index.js',
    devtool: 'inline-source-map',
    resolve: {
      extensions: [ '.js' ]
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: [
            'babel-loader',
          ],
        },
      ],
    },
    output: {
        path: __dirname + '/dist',
        filename: 'arTest.js'
    }
};