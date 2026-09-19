# Stage 1: Maven Build
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy POMs for dependency resolution
COPY pom.xml .
COPY service-registry/pom.xml service-registry/
COPY api-gateway/pom.xml api-gateway/
COPY auth-service/pom.xml auth-service/
COPY medicine-service/pom.xml medicine-service/
COPY inventory-service/pom.xml inventory-service/
COPY transfer-service/pom.xml transfer-service/
COPY notification-service/pom.xml notification-service/

# Copy service source code
COPY medicine-service/src medicine-service/src

# Build JAR
RUN mvn clean package -pl medicine-service -am -DskipTests

# Stage 2: JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/medicine-service/target/*.jar app.jar

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
