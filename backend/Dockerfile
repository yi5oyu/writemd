# Build stage
FROM openjdk:17-jdk-slim AS builder

WORKDIR /app

# Gradle wrapper와 빌드 파일들 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 의존성 다운로드
RUN ./gradlew dependencies --no-daemon

# 소스코드 복사 및 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# 빌드된 JAR 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]