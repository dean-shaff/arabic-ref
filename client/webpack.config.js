const path = require("path");

// var HtmlWebpackPlugin = require('html-webpack-plugin');
// var HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
//     template: __dirname + '/index.html',
//     filename: 'index.html',
//     inject: 'body'
// });

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ExtractTextPluginConfig = new ExtractTextPlugin(
    "bundle.css"
);

module.exports = {
    entry: [
        "./src/index.js",
        "./src/index.css"
    ],
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [
                    path.resolve(__dirname, "node_modules"),
                    path.resolve(__dirname, "src")
                ],
                loader: ExtractTextPlugin.extract({
                    fallback:"style-loader",
                    use:"css-loader"
                })
            }
        ]
    },
    plugins: [
        // HtmlWebpackPluginConfig,
        ExtractTextPluginConfig
    ]
}
