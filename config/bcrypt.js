var bcrypt = require("bcrypt-nodejs");

module.exports.encrypt = (password) => {
  return bcrypt.hashSync(password,bcrypt.genSaltSync(10),null)
};

module.exports.compare = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
