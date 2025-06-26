.PHONY: help start build up down restart logs clean dev

# Default target
help:
	@echo "Available commands:"
	@echo "  make start   - Build and start the application (recommended)"
	@echo "  make up      - Start the application (if already built)"
	@echo "  make build   - Build the Docker image with current .env"
	@echo "  make down    - Stop the application"
	@echo "  make restart - Restart the application"
	@echo "  make logs    - Show application logs"
	@echo "  make clean   - Remove containers and images"
	@echo "  make dev     - Start development server"

# Build and start the application (recommended)
start:
	docker build -t gc-landing-experiment .
	docker run -d --name gc-landing-experiment-container -p 8080:8080 --env-file .env gc-landing-experiment

# Start the application (if already built)
up:
	docker run -d --name gc-landing-experiment-container -p 8080:8080 --env-file .env gc-landing-experiment

# Build the Docker image with current .env
build:
	docker build -t gc-landing-experiment .

# Stop the application
down:
	docker stop gc-landing-experiment-container || true
	docker rm gc-landing-experiment-container || true

# Restart the application
restart:
	make down
	make up

# Show logs
logs:
	docker logs -f gc-landing-experiment-container

# Clean up containers and images
clean:
	docker stop gc-landing-experiment-container || true
	docker rm gc-landing-experiment-container || true
	docker rmi gc-landing-experiment || true

# Development server
dev:
	pnpm dev

# Production build (local)
prod-build:
	pnpm build

# Preview production build (local)
preview:
	pnpm preview 