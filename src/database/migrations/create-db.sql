SELECT 'CREATE DATABASE ticketdo'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ticketdo')\gexec


-- Run Command: psql -a -f src/database/migrations/create-db.sql
-- Make sure you first run your app (yarn start) (the table creations for now is depended on typeORM automatic migrations)
--Then run yarn seed