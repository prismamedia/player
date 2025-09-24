const fs = require('node:fs')
const path = require('node:path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)

const createConfig = ({ isProduction }) => {
	const WEBPACK_PUBLIC_PATH = process.env.WEBPACK_PUBLIC_PATH || '/'
	const demos = ['home', 'basic']

	const config = {
		entry: {
			// Entries are populated at the end of the function
		},
		watchOptions: {
			ignored: /node_modules/
		},
		devtool: isProduction ? false : 'source-map',
		output: {
			path: resolveApp('dist'),
			publicPath: '/',
			filename: 'scripts/[name].js'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					include: [resolveApp('src'), resolveApp('../')],
					use: [
						{
							loader: 'babel-loader',
							options: {
								extends: resolveApp('config/babel.config.js')
							}
						}
					]
				},
				{
					test: /\.ts$/,
					include: [resolveApp('src'), resolveApp('../')],
					use: [
						{
							loader: 'babel-loader',
							options: {
								extends: resolveApp('config/babel.config.js')
							}
						},
						{
							loader: 'ts-loader'
						}
					]
				},
				{
					test: /\.css$/,
					include: resolveApp('src'),
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader'
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									config: resolveApp('config/postcss.config.js')
								}
							}
						}
					]
				}
			]
		},
		resolve: {
			extensions: ['.js', '.ts', '.css'],
			extensionAlias: {
				'.js': ['.ts', '.js']
			},
			modules: [resolveApp('node_modules')]
		},
		context: appDirectory,
		plugins: [
			new MiniCssExtractPlugin({
				filename: 'styles/[name].css',
				chunkFilename: 'styles/[name].css'
			}),
			new webpack.optimize.ModuleConcatenationPlugin(),
			new webpack.DefinePlugin({
				'process.env.WEBPACK_PUBLIC_PATH': JSON.stringify(WEBPACK_PUBLIC_PATH)
			})
		],
		stats: {
			assets: true,
			colors: true,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false,
			modules: false,
			children: false,
			entrypoints: false,
			excludeAssets: /.map$/,
			assetsSort: '!size'
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					parallel: true,
					terserOptions: {
						compress: {
							// Drop console.log|console.debug
							// Keep console.warn|console.error|console.info
							pure_funcs: ['console.log', 'console.debug']
						},
						mangle: true
					}
				}),
				new CssMinimizerPlugin()
			],
			chunkIds: 'deterministic', // or 'named'
			removeAvailableModules: true,
			removeEmptyChunks: true,
			mergeDuplicateChunks: true,
			providedExports: false,
			splitChunks: false
		}
	}

	if (!isProduction) {
		config.plugins.push(new webpack.ProgressPlugin())
		config.devServer = {
			static: {
				directory: resolveApp('src')
			},
			historyApiFallback: true,
			port: 3000,
			compress: true,
			hot: true,
			open: false,
			host: 'local.geo.fr'
		}
	}

	demos.forEach((key) => {
		config.entry[key] = resolveApp(`src/${key}/config.ts`)
		config.plugins.push(
			new HtmlWebpackPlugin({
				filename: key === 'home' ? 'index.html' : `${key}/index.html`,
				template: resolveApp(`src/${key}/index.html`),
				chunks: [key],
				inject: true,
				minify: isProduction,
				publicPath: '../'
			})
		)
	})

	return config
}

module.exports = function webpackConfig(env, argv) {
	const isProduction = argv.mode === 'production'

	return createConfig({
		isProduction
	})
}
