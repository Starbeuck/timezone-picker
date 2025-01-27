const path = require("path"),
  webpack = require("webpack"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

var ENV = process.env.NODE_ENV,
  buildType = process.env.BUILD_TYPE,
  isProd = ENV === "production" ? true : false,
  BUILD_DIR = path.resolve(__dirname, "dist"),
  ROOT_DIR = path.resolve(__dirname),
  EXAMPLE_DIR = path.resolve(__dirname, "example"),
  APP_DIR = path.resolve(__dirname, "src"),
  NODE_MODULES = path.resolve(__dirname, "node_modules"),
  config = {
    entry: {
      "timezone-picker": [APP_DIR + "/TimezonePicker.js"],
    },
    output: {
      path: isProd ? BUILD_DIR : ROOT_DIR, //<- This path is use at build time
      filename: "[name].min.js", //<- This file is created under path which we specified in output.path
      chunkFilename: "[name].min.js",
      library: "TimezonePicker",
      libraryTarget: "umd",
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin(),
      new webpack.DefinePlugin({ isProd: isProd }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        moment: "moment-timezone",
        select2: "select2",
      }),
    ],
    resolve: {
      modules: [APP_DIR, NODE_MODULES],
      extensions: [".js", ".jsx", ".html", ".css", ".scss"],
    },
    module: {
      rules: [
        {
          test: /\.jsx($|\?)|\.js($|\?)/,
          exclude: /node_modules/,
          include: [APP_DIR, ROOT_DIR],
          use: [
            {
              loader: "babel-loader",
            },
          ],
        },
        {
          test: /\.s?css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: require.resolve("select2"),
          use: [
            {
              loader: "expose-loader",
              options: "select2",
            },
          ],
        },
        {
          test: require.resolve("moment"),
          use: [
            {
              loader: "expose-loader",
              options: "moment",
            },
          ],
        },
        {
          test: require.resolve("jquery"),
          use: [
            {
              loader: "expose-loader",
              options: "jQuery",
            },
            {
              loader: "expose-loader",
              options: "$",
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: isProd,
      minimizer: [new CssMinimizerPlugin()],
    },
    devServer: {
      port: 9099,
      host: "0.0.0.0",
      disableHostCheck: true,
    },
  };
var mainHtml = new HtmlWebpackPlugin({
  title: "timezone-picker",
  template: APP_DIR + "/index.ejs",
  chunks: ["timezone-picker"],
  filename: (isProd ? BUILD_DIR : ROOT_DIR) + "/index.html",
});
var externalVendorHtml = new HtmlWebpackPlugin({
  title: "timezone-external-vendor",
  template: APP_DIR + "/index-external-vendor.ejs",
  chunks: ["timezone-picker"],
  filename:
    (isProd ? ROOT_DIR + "/example" : ROOT_DIR) + "/index-external-vendor.html",
});
if (!isProd) {
  config["devtool"] = "inline-source-map";
  config["cache"] = true;
  config.plugins.push(extractVendor, mainHtml, externalVendorHtml);
} else {
  config["externals"] = {
    jquery: "jQuery",
    "moment-timezone": "moment-timezone",
    select2: "select2",
  };
  config.plugins.push(externalVendorHtml);
}
module.exports = config;
