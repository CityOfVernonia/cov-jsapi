const ArcGISPlugin = require('@arcgis/webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

module.exports = (_, args) => {

  const config = {
    // entry points
    entry: {
      index: [
        './dev/main.scss',
        '@dojo/framework/shim/Promise',
        './dev/index.ts',
        './dev/worker-config.ts'
      ],
    },

    // output paprams
    output: {
      filename: '[name].[chunkhash].js',
      publicPath: '',
    },

    // module handling
    module: {
      rules: [
        // ts and tsx files
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        // html files
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: false,
              },
            },
          ],
          exclude: /node_modules/,
        },
        // sass files
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
            },
            {
              loader: 'resolve-url-loader',
              options: {
                includeRoot: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },

    // webpack plugins
    plugins: [
      // only clean in production
      new CleanWebpackPlugin({
        dry: true,
      }),

      // arcgis js
      new ArcGISPlugin({
        features: {
          '3d': false,
          has: {
            'esri-native-promise': true,
          },
        },
      }),

      // index
      new HtmlWebpackPlugin({
        template: './dev/index.ejs',
        filename: './index.html',
        chunksSortMode: 'none',
        mode: 'development',
      }),

      // oauth callback
      // new HtmlWebpackPlugin({
      //   template: './src/oauth-callback.html',
      //   filename: './oauth-callback.html',
      //   chunksSortMode: 'none',
      //   inject: false,
      // }),

      // chunk css
      new MiniCssExtractPlugin({
        filename: '[name].[chunkhash].css',
        chunkFilename: '[id].css',
      }),
    ],

    // resolve paths
    resolve: {
      modules: [
        path.resolve(__dirname, '/dev'),
        path.resolve(__dirname, '/src'),
        path.resolve(__dirname, 'node_modules/'),
      ],
      extensions: ['.ts', '.tsx', '.mjs', '.js', '.scss', '.css'],
    },

    // node params (not node ;) )
    node: {
      process: false,
      global: false,
      Buffer: false,
      setImmediate: false,
      fs: 'empty',
    },
  };

  // source maps in dev
  config.devtool = 'source-map';

  return config;

};