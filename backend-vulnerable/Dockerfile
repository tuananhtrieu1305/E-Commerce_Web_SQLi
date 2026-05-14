# ============================================================
# Stage 1: Build — Maven + JDK 21
# ============================================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml trước → cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code → build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# Stage 2: Run — JRE 21 Alpine (nhẹ ~100MB)
# ============================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Tạo thư mục uploads cho file upload
RUN mkdir -p /app/uploads

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=uat"]
