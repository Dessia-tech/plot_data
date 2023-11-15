// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");

const config = {
  mode:"development",
  entry: process.env.NODE_ENV == "development" ? "./src/core.ts" : "./instrumented/core.ts",
  output: {
    path: path.resolve(__dirname, process.env.NODE_ENV == "development" ? "libdev" : "libtest"),
    filename: "plot-data.js",
    library: {
      name: "PlotData",
      type: "umd",
      umdNamedDefine: true
    }
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = () => { return config };
