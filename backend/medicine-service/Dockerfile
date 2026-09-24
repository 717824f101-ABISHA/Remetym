FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy the main Maven parent POM
COPY pom.xml .

# Copy the Medicine Service Maven project
COPY backend/medicine-service/pom.xml backend/medicine-service/pom.xml
COPY backend/medicine-service/src backend/medicine-service/src

# Build Medicine Service
RUN mvn -f backend/medicine-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/backend/medicine-service/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
