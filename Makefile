#######################################
# Build command for Extension Buddy SDK
#######################################
.PHONY: help test build release

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
check-changes:
	@if ! git diff --quiet; then \
		echo "Error: There are modified files."; \
		exit 1; \
	fi
	@if ! git diff --cached --quiet; then \
		echo "Error: There are unadded files."; \
		exit 1; \
	fi
	@if ! git diff --quiet origin/$(shell git rev-parse --abbrev-ref HEAD); then \
		echo "Error: There are unpushed commits."; \
		exit 1; \
	fi
test:
	@echo 'Running tests...'
	npm run test
	@echo 'Tests completed.'
release: test build check-changes
	@echo "Release steps completed."
define HELP_MESSAGE
	--- Run this command to build the sdk ---
	$ make build
	$ make release
	$ make test
endef
