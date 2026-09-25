FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

COPY backend/notification-service/pom.xml ./pom.xml
COPY backend/notification-service/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]
