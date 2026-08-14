# Java Sandbox Image — OpenJDK 21 minimal
FROM eclipse-temurin:21-jre-alpine

WORKDIR /sandbox

RUN adduser -D sandboxuser
USER sandboxuser

CMD ["java", "-version"]
