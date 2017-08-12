const webpack = require("webpack");
const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = function(env) {
	return {
		devtool: (env === "production") ? "source-map" : "cheap-eval-source-map",
		entry: {
			app: "./src/app.js",
			vendors: [
				"angular",
				"angular-route"
			]
		},
		output: {
			filename: (env === "production") ? "[name].[chunkhash].js" : "[name].js",
			path: path.resolve(__dirname, "dist")
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ExtractTextPlugin.extract({
						use: "css-loader",
						fallback: "style-loader"
					})
				},
				{
					test: /views\/.*\.html$/,
					use: "file-loader?name=views/[name].[ext]"
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: "file-loader?name=assets/[name].[ext]"
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/,
					use: "file-loader?name=assets/[name].[ext]"
				}
			]
		},
		plugins: [
			new UglifyJSPlugin({
				sourceMap: true
			}),
			new ExtractTextPlugin("styles.[contenthash].css"),
			new HtmlWebpackPlugin({
				template: "public/index.html",
				favicon: "public/favicon.ico"
			}),
			new CleanWebpackPlugin(["dist"]),
			new webpack.optimize.CommonsChunkPlugin({
				name: "vendors",
				minChunks: Infinity
			})
		]
	};
};
