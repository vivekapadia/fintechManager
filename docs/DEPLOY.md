# Deployment Guide

## Prerequisites
- Docker Desktop installed and running.

## Running the Application (Docker)

1.  **Build and Start Services**
    Open a terminal in the project root and run:
    ```bash
    docker-compose up --build
    ```

2.  **Access the Application**
    - **Frontend (Web)**: [http://localhost:3000](http://localhost:3000) (Mapped from 5173)
    - **Backend API**: [http://localhost:4000](http://localhost:4000)
    - **Analytics Engine**: [http://localhost:8000](http://localhost:8000)
    - **Database (Postgres)**: `localhost:5435` (Port 5435 to avoid conflicts)

## Local Development (Hybrid)
If you want to run the apps locally (`npm run dev`) but use the Docker DB:
1.  **Ensure Docker is running** (`docker-compose up -d db`).
2.  **Update .env**: ensure `DATABASE_URL` uses port `5435`.
3.  **Push Schema**: Run `npx prisma db push --schema=packages/database/prisma/schema.prisma` from root.

3.  **Monitoring**
    - **Prometheus**: [http://localhost:9090](http://localhost:9090)
    - **Grafana**: [http://localhost:3001](http://localhost:3001) (User: `admin`, Pass: `admin`)

## Stopping the Application
To stop all services:
```bash
docker-compose down
```
To stop and remove volumes (reset database):
```bash
docker-compose down -v
```

## Troubleshooting
- If `web` container fails to start, ensure no other service is using port 3000.
- If `db` is unhealthy, check the logs: `docker-compose logs db`.
