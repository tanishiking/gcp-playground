.PHONY: install
setup:
	yarn install
	yarn workspace lib build
	cp -r lib app/vendor/

.PHONY: deploy
deploy: setup
	$(MAKE) -C app deploy

