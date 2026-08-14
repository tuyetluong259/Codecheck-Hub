FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache maven
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Docker CLI cần thiết để manage containers
RUN apk add --no-cache curl docker-cli
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
