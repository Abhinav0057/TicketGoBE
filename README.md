## Step to run the app in local server

1. install postgresql, and make sure psql command is working
2. Update pg_username, pg_password in .env file
3. In terminal paste the command from src/database/migrations/create-db.sql
4. Run yarn
5. make sure redis is up and running in your local machine and set port no in .emv file
6. Run yarn start
7. Then run yarn seed (For initial data for category and category groups and for superadmin). You can change the seeder details in their respective files
8. Enjoy
