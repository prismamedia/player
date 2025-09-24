module.exports = {
	plugins: [
		'postcss-import',
		'postcss-url',
		[
			'postcss-preset-env',
			{
				stage: 2,
				features: {
					'custom-properties': {
						warnings: true,
						preserve: true
					},

					// postcss-preset-env@7.8.0 enables native "postcss-nesting"
					// which should be disabled to avoid invalid CSS with "postcss-nested"
					'nesting-rules': false
				}
			}
		],
		'postcss-nested',
		[
			'postcss-custom-media',
			{
				preserve: false
			}
		]
	]
}
