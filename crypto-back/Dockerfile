#FROM mcr.microsoft.com/mssql/server AS sql-server-init
#ENV SA_PASSWORD a225034862650A
#ENV ACCEPT_EULA Y
#ENV MSSQL_PID Express
#ENV DB_NAME ucrypt
##RUN (/opt/mssql-tools/bin/sqlcmd -U sa -P $SA_PASSWORD -Q "CREATE DATABASE ucrypt")

# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build

WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline

COPY src src

# Skip tests as they are not relevant for the build within docker (no database yet)
RUN mvn package 

# Run stage
FROM openjdk:17-jdk-alpine

WORKDIR /app

COPY --from=build /app/target/*.war app.war

#COPY startup.sh /app/startup.sh
#RUN chmod +x /app/startup.sh

#ENTRYPOINT ["/app/startup.sh"]

ENTRYPOINT ["java", "-jar", "app.war"]
