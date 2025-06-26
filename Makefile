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
	docker-compose up --build -d

# Start the application (if already built)
up:
	docker-compose up -d

# Build the Docker image with current .env
build:
	docker-compose build

# Stop the application
down:
	docker-compose down

# Restart the application
restart:
	docker-compose restart

# Show logs
logs:
	docker-compose logs -f

# Clean up containers and images
clean:
	docker-compose down --rmi all --volumes --remove-orphans

# Development server
dev:
	pnpm dev

# Production build (local)
prod-build:
	pnpm build

# Preview production build (local)
preview:
	pnpm preview 