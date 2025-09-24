module.exports = function babelConfig(api) {
	api.cache(true)

	return {
		presets: [
			[
				'@babel/preset-env',
				{
					// Target esmodules browsers instead of browsers list
					targets: {
						esmodules: true
					}
				}
			]
		],
		plugins: ['@babel/plugin-proposal-class-properties'] // TODO: remove
	}
}
