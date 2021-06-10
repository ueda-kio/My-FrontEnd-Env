const path = require('path');
const globule = require('globule');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const assignPlugins = (env_mode) => {
  const srcFiles = globule.find(['**/*.ejs', '!**/_*.ejs'], {cwd: `${__dirname}/src/ejs`});
  const entriesList = {};
  const assignObject = {plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        'assets/stylesheet',
        'assets/javascript',
      ]
    }),
    new MiniCssExtractPlugin({
      filename: env_mode
        ? 'assets/stylesheet/bundle.css'
        : 'assets/stylesheet/bundle.[contenthash].css',
    }),
    new HtmlWebpackHarddiskPlugin({
      alwaysWriteToDisk: true
    }),
    // 画像をassets/images/にコピー
    new CopyPlugin({
      patterns: [
        {from: "src/images/", to: "assets/images/"}
      ]
    })
  ]};

  for(const ejsFileName of srcFiles) {
    const htmlFileName = ejsFileName.replace(new RegExp(`.ejs`, 'i'), `.html`);
    entriesList[htmlFileName] = `${__dirname}/src/ejs/${ejsFileName}`;
  }

  for(const [htmlFileName, ejsFileName] of Object.entries(entriesList)) {
    assignObject.plugins.push(new HtmlWebpackPlugin({
      filename : htmlFileName,
      template : ejsFileName,
      inject: 'body',
      minify: env_mode ?
        false :
        {
          collapseWhitespace: false,
          removeComments: true,
        },
    }));
  }

  return assignObject;
};

module.exports = (env, argv) => {
  const is_DEVELOP = argv.mode === "development";

  return [
    Object.assign({
    entry: './src/js/main',
    output: {
      path: path.join(__dirname, 'public'),
      filename: is_DEVELOP
        ? 'assets/javascript/bundle.js'
        : 'assets/javascript/bundle.[contenthash].js',
    },
    devtool: is_DEVELOP ? 'source-map' : 'eval',
    watchOptions: {
      ignored: /node_modules/
    },
    resolve: {
      // 拡張子を省略してimportできるようになる
      extensions: ['.js', '.ts'],
    },

    // UglifyJSPluginは非推奨
    optimization: {
      minimize: is_DEVELOP ? false : true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 2020,
          }
        })
      ]
    },

    module: {
      rules: [
        {
          test: /\.ejs$/,
          use: 'ejs-compiled-loader',
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      require('autoprefixer')({grid: true}),
                    ],
                  ],
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
              },
            },
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ['@babel/plugin-transform-runtime'],
              },
            },
          ],
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
        },
      ],
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'public'),
      port: 8080,
    },
    // 現状機能していない
    stats: {
      children: true
    },
    target: is_DEVELOP ?
      // dev-serverのホットリロードが聞かない問題への対処
      "web" :
      // IE11対応
      ["web", "es5"]
    }, assignPlugins(is_DEVELOP))
  ]
}