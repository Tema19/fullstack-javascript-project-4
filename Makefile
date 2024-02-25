install:
	npm ci
publish: 
	npm publish --dry-run
lint: 
	npx eslint .
pageLoader:
	node bin/page-loader.js