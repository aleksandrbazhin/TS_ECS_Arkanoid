const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, './src/main.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.[hash].js', // <- ensure unique bundle name
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/index.html")
    }),
    new CopyPlugin({
      patterns: [{ from: 'src/assets', to: 'assets' }],
    }),
  ]
};