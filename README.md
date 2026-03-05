# Influencer Platform Docker Setup

This document provides instructions on how to use Docker to run the Influencer Platform application in both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

The project consists of two main components:

1. **Frontend (Next.js)** - Located in the `influencer-platform` folder
2. **Backend API (Express/Node.js)** - Located in the `influencer-platform-api` folder

## Development Environment

To start the application in development mode:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:

- Start MongoDB and Redis services
- Start the backend API in development mode with hot-reloading
- Start the frontend in development mode with hot-reloading

To rebuild the containers (if you make changes to Dockerfiles):

```bash
docker-compose -f docker-compose.dev.yml up --build
```

To stop the development environment:

```bash
docker-compose -f docker-compose.dev.yml down
```

## Production Environment

To start the application in production mode:

```bash
docker-compose up
```

To rebuild the containers:

```bash
docker-compose up --build
```

To stop the production environment:

```bash
docker-compose down
```

## Environment Variables

### Backend API Environment Variables

In both development and production mode, you may need to set the following environment variables:

- `MONGO_URI`: MongoDB connection URI
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `FRONTEND_URL`: URL of the frontend application
- `BASE_URL`: URL of the backend API
- Additional environment variables depending on your application requirements

### Frontend Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: URL of the backend API

## Data Persistence

- MongoDB data is stored in the `mongodb_data` volume (or `mongodb_data_dev` in development)
- API uploads are stored in the `uploads_data` volume (or `uploads_data_dev` in development)
- Application logs are stored in the `logs_data` volume (or `logs_data_dev` in development)

## Accessing the Services

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017
- Redis: redis://localhost:6379

## Additional Notes

- The development setup mounts the local source code into the containers, enabling hot-reloading
- The production setup builds optimized Docker images for both frontend and backend
- Additional services like MongoDB and Redis are included in the Docker Compose setup
