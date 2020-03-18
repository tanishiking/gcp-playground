.PHONY: build
build:
	yarn build

.PHONY: deploy
deploy: build
	cp ../yarn.lock yarn.lock
	yarn run deploy
	rm yarn.lock
