@echo off
setlocal

set "E2E_BACKEND_PORT=%~1"
if "%E2E_BACKEND_PORT%"=="" set "E2E_BACKEND_PORT=8080"

set "SPRING_PROFILES_ACTIVE=e2e"
set "SPRING_ARGS=--spring.sql.init.mode=never --server.port=%E2E_BACKEND_PORT% --app.mail.test-mode=true --app.mail.test-api-enabled=true"

call mvn -q -DskipTests spring-boot:run -Dspring-boot.run.arguments="%SPRING_ARGS%"
