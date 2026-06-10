# Variables
BE_DIR = be
FE_DIR = fe

# Default target
.PHONY: help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install        Install dependencies for both BE and FE"
	@echo "  setup          Full setup (install, env, key, migrate, build)"
	@echo "  dev            Run both BE and FE development servers"
	@echo "  build          Build both BE and FE for production"
	@echo "  test           Run backend tests"
	@echo "  lint           Run frontend linting"
	@echo "  migrate        Run backend migrations"
	@echo "  seed           Run backend seeders"
	@echo "  clean          Remove vendor and node_modules directories"

# Installation
.PHONY: install
install: install-be install-fe

.PHONY: install-be
install-be:
	cd $(BE_DIR) && composer install && npm install

.PHONY: install-fe
install-fe:
	cd $(FE_DIR) && npm install

# Setup
.PHONY: setup
setup: setup-be setup-fe

.PHONY: setup-be
setup-be:
	cd $(BE_DIR) && cp .env.example .env || true
	cd $(BE_DIR) && php artisan key:generate
	cd $(BE_DIR) && php artisan migrate --seed

.PHONY: setup-fe
setup-fe:
	cd $(FE_DIR) && npm install

# Development
.PHONY: dev
dev:
	npx concurrently -n "BE,FE" -c "blue,green" \
		"cd $(BE_DIR) && php artisan serve" \
		"cd $(FE_DIR) && npm run dev"

# Build
.PHONY: build
build: build-be build-fe

.PHONY: build-be
build-be:
	cd $(BE_DIR) && npm run build

.PHONY: build-fe
build-fe:
	cd $(FE_DIR) && npm run build

# Testing & Linting
.PHONY: test
test:
	cd $(BE_DIR) && php artisan test

.PHONY: lint
lint:
	cd $(FE_DIR) && npm run lint

# Database
.PHONY: migrate
migrate:
	cd $(BE_DIR) && php artisan migrate

.PHONY: seed
seed:
	cd $(BE_DIR) && php artisan db:seed

# Cleaning
.PHONY: clean
clean:
	rm -rf $(BE_DIR)/vendor $(BE_DIR)/node_modules
	rm -rf $(FE_DIR)/node_modules
	cd $(BE_DIR) && php artisan config:clear && php artisan cache:clear
