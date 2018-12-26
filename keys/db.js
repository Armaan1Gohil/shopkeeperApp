dbs = {
  user: process.env.DATABASE_USER,
  host: process.env.DB_HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DB_PORT)
};

module.exports = dbs;
