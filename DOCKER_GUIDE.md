# 🐳 RemeTym Production Docker Containerization Guide

Welcome to the official Docker containerization guide for **RemeTym** — Healthcare Supply Chain & Inventory Management Platform.

This guide provides instructions on building, running, and managing the complete multi-tier containerized stack (React Frontend, Spring Boot Microservices, Python XGBoost ML Service, Eureka Registry, API Gateway, and MongoDB).

---

## 🏗 System Architecture

```text
                                  ┌───────────────────────────────┐
                                  │      React + Vite Frontend    │
                                  │     (Port 80 / Port 5173)     │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │       API Gateway (8080)      │
                                  └──────────────┬────────────────┘
                                                 │
      ┌──────────────────┬───────────────────────┼───────────────────────┬──────────────────┐
      │                  │                       │                       │                  │
      ▼                  ▼                       ▼                       ▼                  ▼
┌───────────┐    ┌──────────────┐      ┌──────────────────┐    ┌──────────────────┐  ┌──────────────┐
│Auth (8081)│    │Medicine(8082)│      │ Inventory (8083) │    │ Transfer (8084)  │  │Notif (8085)  │
└─────┬─────┘    └──────┬───────┘      └────────┬─────────┘    └────────┬─────────┘  └──────┬───────┘
      │                 │                       │                       │                   │
      └─────────────────┴───────────┬───────────┴───────────────────────┴───────────────────┘
                                    │
                                    ▼
                      ┌──────────────────────────┐
                      │ MongoDB Database (27017) │
                      └──────────────────────────┘
                                    ▲
                                    │
                      ┌──────────────────────────┐
                      │ Python ML Service (5000) │
                      └──────────────────────────┘
```

---

## 📋 Prerequisites

Ensure you have **Docker Desktop** installed and running on your system:
- **Windows / macOS / Linux**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Verify installation:
  ```bash
  docker --version
  docker compose version
  ```

---

## 🚀 Quick Start (One-Command Launch)

### 1. Build & Start All Services
To build all container images and launch the complete RemeTym platform:
```bash
docker compose up --build
```

### 2. Run in Background (Detached Mode)
To run all containers silently in the background:
```bash
docker compose up -d --build
```

### 3. Stop All Services
To stop and clean up all running containers:
```bash
docker compose down
```

---

## 🌐 Containerized Services & Endpoints

| Service Name | Description | Port | Health Check / Endpoint |
| :--- | :--- | :--- | :--- |
| **`frontend`** | React + Vite Single Page Application (Nginx) | `80`, `5173` | [http://localhost](http://localhost) |
| **`api-gateway`** | Spring Cloud API Gateway Entrypoint | `8080` | [http://localhost:8080/health](http://localhost:8080/health) |
| **`service-registry`** | Eureka Service Discovery Dashboard | `8761` | [http://localhost:8761](http://localhost:8761) |
| **`auth-service`** | Authentication & User Management | `8081` | [http://localhost:8081/health](http://localhost:8081/health) |
| **`medicine-service`** | Master Medicine Catalog & Batch Manager | `8082` | [http://localhost:8082/health](http://localhost:8082/health) |
| **`inventory-service`** | Facility Inventory & Stock Tracker | `8083` | [http://localhost:8083/health](http://localhost:8083/health) |
| **`transfer-service`** | District Stock Transfer Workflow | `8084` | [http://localhost:8084/health](http://localhost:8084/health) |
| **`notification-service`**| System Notifications & Email Dispatcher | `8085` | [http://localhost:8085/health](http://localhost:8085/health) |
| **`ml-service`** | Python XGBoost Demand Forecaster | `5000` | [http://localhost:5000/health](http://localhost:5000/health) |
| **`mongodb`** | Primary NoSQL Document Database | `27017` | `mongodb://localhost:27017` |

---

## 🔍 Managing & Monitoring Containers

### View Live Container Logs
- Stream logs for all services:
  ```bash
  docker compose logs -f
  ```
- Stream logs for a specific service (e.g., API Gateway):
  ```bash
  docker compose logs -f api-gateway
  ```

### Check Container Status
```bash
docker compose ps
```

### Rebuild a Single Service
If you modify code in a specific service (e.g., `inventory-service`):
```bash
docker compose up -d --build inventory-service
```

### Reset Data & Volumes
To remove all containers and purge persisted MongoDB data:
```bash
docker compose down -v
```

---

## 🛠 File Structure Overview

- **`docker-compose.yml`**: Master orchestration file configuring all 10 containers.
- **`Dockerfile`**: Multi-stage build for React frontend (Node.js build stage $\rightarrow$ Nginx production web server).
- **`nginx.conf`**: Configures client-side SPA routing and `/api/` reverse proxy to API Gateway.
- **`backend/*/Dockerfile`**: Multi-stage Dockerfiles for Spring Boot microservices.
- **`ml-service/Dockerfile`**: Lightweight Python 3.10 image running Flask + XGBoost.
