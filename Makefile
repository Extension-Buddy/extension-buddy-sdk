#######################################
# Build command for Extension Buddy SDK
#######################################
.PHONY: help build

help:
	$(info ${HELP_MESSAGE})
	@exit 0
build:
	@echo 'Removing prior dist...'
	@rm -rf dist/*
	@echo 'Prior dist removed!'
	@echo 'Preparing new sdk build..'
	npm run tsup
	@echo 'Creating Vanilla JS lib..'
	@cp dist/index.mjs dist/extension-buddy-sdk.js
	@sed -i.bak '/export {/,/};/d' dist/extension-buddy-sdk.js
	@rm dist/extension-buddy-sdk.js.bak
	@exit 0
define HELP_MESSAGE
	--- Run this command to build the sdk ---
	$ make build
endef
