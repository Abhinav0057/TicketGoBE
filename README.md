## Step to run the app in local server

1. install postgresql, and make sure psql command is working
2. Update pg_username, pg_password in .env file
3. In terminal paste the command from src/database/migrations/create-db.sql
4. Run yarn
5. Run yarn start
6. Then run yarn seed (For initial data for category and category groups and for superadmin). You can change the seeder details in their respective files
7. Enjoy
