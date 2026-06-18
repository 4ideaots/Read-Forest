# syntax=docker/dockerfile:1

### ---------- build stage ----------
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Gradle 래퍼 + 빌드 스크립트 먼저 복사해 의존성 레이어 캐싱
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# 소스 복사 후 실행 가능한 jar 빌드 (테스트는 CI에서 따로)
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

### ---------- runtime stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# 비루트 사용자로 실행
RUN useradd -r -u 1001 spring
USER spring

COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
