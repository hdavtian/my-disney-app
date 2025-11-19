# Multi-stage Dockerfile for Spring Boot backend
# Stage 1: Build the application with Maven
FROM eclipse-temurin:21-jdk AS builder

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Maven wrapper and pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies (cached if pom.xml hasn't changed)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds; tests run in CI/CD)
RUN mvn clean package -DskipTests

# Stage 2: Create lightweight runtime image
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create non-root user for security
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Set JVM options for containerized environment
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC"

# Set default profile to prod (can be overridden)
ENV SPRING_PROFILES_ACTIVE=prod

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
