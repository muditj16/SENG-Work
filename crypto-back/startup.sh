#!/usr/bin/env bash
if ! [ -f /var/opt/mssql/.initialized ] && [ -n "$DB_NAME" ]; then
  while ! </dev/tcp/localhost/1433 2>/dev/null; do
    sleep 2
  done
  echo "Creating $DB_NAME database..."
  /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -d master \
    -Q "CREATE DATABASE $DB_NAME"
  touch /var/opt/mssql/.initialized
fi &
/opt/mssql/bin/sqlservr
