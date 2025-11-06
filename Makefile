DEPLOYMENT_NAME := arcade-main

.PHONY: update_torii reindex_torii check_slot

check_slot:
	@which slot > /dev/null || (echo "Error: slot binary not found. Please install slot first." && exit 1)

update_torii: check_slot
ifndef VERSION
	$(error VERSION is required. Usage: make update_torii VERSION=vx.x.x)
endif
	@echo "Updating torii to version $(VERSION)..."
	slot d update $(DEPLOYMENT_NAME) torii --version $(VERSION)

reindex_torii: check_slot
	@echo "Reindexing torii..."
	slot d delete	$(DEPLOYMENT_NAME)
	slot d create $(DEPLOYMENT_NAME) --team c7e-infra --tier legendary torii --config ./torii_mainnet.toml

logs: check_slot
	slot d logs $(DEPLOYMENT_NAME) torii -f
