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
	@# Check for unadded or uncommitted changes
	@if ! git diff-index --quiet HEAD --; then \
		echo "There are uncommitted changes. Please commit them before proceeding."; \
		exit 1; \
	fi
	@# Check for untracked files
	@if ! git diff --cached --exit-code > /dev/null; then \
		echo "There are staged changes. Please commit them before proceeding."; \
		exit 1; \
	fi
	@# Check if the branch is up-to-date with the remote
	@git fetch
	@if ! git diff --quiet HEAD origin/`git rev-parse --abbrev-ref HEAD`; then \
		echo "Your branch is not up-to-date with the remote. Please push or pull the latest changes."; \
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
