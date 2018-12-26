let { Client } = require('pg');
let dotenv = require('dotenv');
dotenv.config();
let db = require('./keys/db')

module.exports = (queryObject) => {
  var client = new Client(db);
  return new Promise((resolve, reject) => {
    client.connect()
    .then(()=>{
      client.query(queryObject)
      .then((res) => {
        client.end();
        resolve(res);
      })
      .catch((err) => {
        client.end();
        reject(err);
      })
    })
    .catch((err) => {
      client.end();
      reject(err);
    })
  })
}
