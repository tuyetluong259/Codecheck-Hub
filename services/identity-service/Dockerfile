FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Install Maven
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

RUN apk add --no-cache curl

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
