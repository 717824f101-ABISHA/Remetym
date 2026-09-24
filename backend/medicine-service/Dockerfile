FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY backend/medicine-service/pom.xml .

COPY backend/medicine-service/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
