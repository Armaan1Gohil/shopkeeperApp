let query = require('../db');

module.exports = async () => {
  var querytext = `CREATE TABLE IF NOT EXISTS
    users (
      id UUID NOT NULL PRIMARY KEY,
      email VARCHAR NOT NULL UNIQUE,
      name VARCHAR(200) NOT NULL,
      password VARCHAR(200),
      isVerified BOOL DEFAULT false NOT NULL,
      profilePic VARCHAR(200) default '`+process.env.API_HOST+ `/defaultPic.png'`+`,
      created_date TIMESTAMP DEFAULT NOW() NOT NULL
    );`
  return await query(querytext);
}
