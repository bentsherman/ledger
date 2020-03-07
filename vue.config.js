module.exports = {
	lintOnSave: false,
	pages: {
		index: {
			entry: 'src/app.js',
			template: 'public/index.html',
			filename: 'index.html',
			chunks: ['chunk-vendors', 'chunk-common', 'index']
		}
	}
}
