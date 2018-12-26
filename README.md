# shopkeeperApp

## Installation Instructions


#### Installation
1. Install Node.js
    *[Install Node.js](https://nodejs.org)

2. Verify Installation (open Terminal/CMD)
```
node -v
npm -v
```

3. Install Postgrsql [Install Postgresql](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) **Important** *note the username and password used while installing postgresql.* ***prefered username=postgres password = root****
* Setup postgres database (open terminal/CMD)
    * Go to The installation path ```cd C:\Program Files\PostgreSQL\11\bin```
    * login as user postgres by running ```psql.exe -U postgres``` and type the commands below:

        ```
        CREATE DATABASE shopkeeper;
        CREATE USER admin WITH PASSWORD 'root';
        ALTER ROLE admin SET client_encoding TO 'utf8';
        ALTER ROLE admin SET default_transaction_isolation TO 'read committed';
        ALTER ROLE admin SET timezone TO 'UTC';
        ALTER USER admin CREATEDB;
        ```

    * Exit psql by typing in \q and hitting enter.

4. open terminal/CMD with desired location and type the following commands

5. Get the source code on to your machine via git.

    ```
    git clone https://github.com/Gurpreetsingh9465/shopkeeperApp.git && cd shopkeeperApp
    ```

6. Rename `sample.env` as `.env`.

    ```
    mv sample.env .env
    ```
 
 7. Change the contents of `.env` file
    ```
    DEBUG = *,-babel*,-eslint:*,-express*,-body*,-send*,-morgan*
    DATABASE_USER = postgres
    DATABASE_PASSWORD = root
    DB_HOST = localhost
    DB_PORT = 5432
    DATABASE = shopkeeper
    SECRET = J@NcRfUjXn2r5u8x/A?D*G-KaPdSgVkYp3s6v9y$B&E)H+MbQeThWmZq4t7w!z%C
    API_HOST = http://localhost:3000
    IMAGE_DEST = "desired/location/to/upload/images"
    ```
    
8. Install Packets (open terminal/CMD with location ```desired/location/shopkeeperApp```)
    ```
    npm install -g nodemon
    ```
* install All packages like react express etc..
    ```
    npm install
    ```
    
9. open `keys/oauth.js` in your favorite text editor
    * Go To SignIn And Create New Project [Google Cloud](https://console.cloud.google.com/apis/credentials)
    * go to enable API
    * ![enable api](https://raw.githubusercontent.com/Gurpreetsingh9465/fabrik-bugs/master/enableApi.png)
    * enable Google+ API
    * ![enable api](https://raw.githubusercontent.com/Gurpreetsingh9465/fabrik-bugs/master/enableG%2Bapi.png)
    * click on create credentials and select these setting
    * ![create](https://raw.githubusercontent.com/Gurpreetsingh9465/fabrik-bugs/master/createCredentials.png)
    * Enter redirect URIs `http://localhost:3000/user/api/auth/google/callback` and origin as `http://localhost:3000`
    * copy the client id and client secret to `keys/outh.js` save the credentials.
    `keys/oauth.js`
    ```
       oauth = {
       callbackURL:"http://localhost:3000/user/api/auth/google/callback",
       clientID : 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
       clientSecret : 'XXXXXXXXXXXXXX',
      };
      
      module.exports = oauth;
    ```
    

    


 
