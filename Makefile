.PHONY: help install-dependencies docker-build up down

IMAGE := eventhub:dev

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

install-dependencies: ## Download Node dependencies (npm install)
	npm install

docker-build: ## Build the Docker image tagged eventhub:dev
	docker build -t $(IMAGE) .

up: ## Build (if needed) and start app + Postgres in Docker
	./set-up.sh

down: ## Stop the Docker containers
	docker compose down
