@echo off
TITLE RemeTym Spring Boot Microservices Launcher
COLOR 0A

echo ======================================================================
echo           RemeTym Spring Boot Microservices Architecture             
echo ======================================================================
echo.
echo Starting MongoDB verify...
net start MongoDB 2>nul || echo MongoDB service is already running or managed externally.
echo Starting 1/7: Service Registry (Eureka Server - Port 8761)...
start "Eureka Server :8761" cmd /k "cd /d %~dp0backend\service-registry && mvnw.cmd spring-boot:run || mvn spring-boot:run"

timeout /t 10 /nobreak >nul

echo Starting 2/7: Auth Service (Port 8081)...
start "Auth Service :8081" cmd /k "cd /d %~dp0backend\auth-service && mvnw.cmd spring-boot:run || mvn spring-boot:run"

echo Starting 3/7: Medicine Service (Port 8082)...
start "Medicine Service :8082" cmd /k "cd /d %~dp0backend\medicine-service && mvnw.cmd spring-boot:run || mvn spring-boot:run"

echo Starting 4/7: Inventory Service (Port 8083)...
start "Inventory Service :8083" cmd /k "cd /d %~dp0backend\inventory-service && mvnw.cmd spring-boot:run || mvn spring-boot:run"

echo Starting 5/7: Transfer Service (Port 8084)...
start "Transfer Service :8084" cmd /k "cd /d %~dp0backend\transfer-service && mvnw.cmd spring-boot:run || mvn spring-boot:run"

echo Starting 6/7: Notification Service (Port 8085)...
start "Notification Service :8085" cmd /k "cd /d %~dp0backend\notification-service && mvnw.cmd spring-boot:run || mvn spring-boot:run"

timeout /t 8 /nobreak >nul

echo Starting 7/7: API Gateway (Port 8080)...
start "API Gateway :8080" cmd /k "cd /d %~dp0backend\api-gateway && mvnw.cmd spring-boot:run || mvn spring-boot:run"

echo.
echo ======================================================================
echo ALL MICROSERVICES DISPATCHED!
echo.
echo  • Eureka Registry Dashboard : http://localhost:8761
echo  • API Gateway Entry Point    : http://localhost:8080
echo.
echo Health Checks:
echo  • Gateway      : http://localhost:8080/health
echo  • Auth         : http://localhost:8081/health
echo  • Medicine     : http://localhost:8082/health
echo  • Inventory    : http://localhost:8083/health
echo  • Transfer     : http://localhost:8084/health
echo  • Notification : http://localhost:8085/health
echo ======================================================================
pause
