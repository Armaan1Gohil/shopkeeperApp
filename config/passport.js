var passport = require("passport")
var GoogleStrategy = require("passport-google-oauth20");
const oauth = require("../keys/oauth");
const query = require('../db');
const debug = require('debug')('passport:');
const uuidv4 = require('uuidv4');
passport.serializeUser( (user, done) => {
  debug(user);
 done(null, user);
});

passport.deserializeUser( (user, done) => {
  debug(user);
 done(null, user);
});

passport.use(
  new GoogleStrategy(oauth, (accessToken, refreshToken, profile, done)=>{
    var profilePic = profile.photos[0].value;
    profilePic = profilePic.slice(0, profilePic.indexOf('?'))
    var name = profile.displayName;
    var email = profile.emails[0].value
    debug(name,email,profilePic);
    var querytext = {
        name: 'find-user',
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email]
      }
    query(querytext).then((result)=>{
      if(result.rows.length) {
        var user = result.rows[0];
        if(!user.password) {
          return done(null, user);
        } else {
          return done(null, false, { message: "You Already Have An Account" });
        }
      } else {
        var querytext = {
          name: 'insert-user',
          text: `INSERT INTO users(id, email, name, profilePic, isVerified) VALUES($1, $2, $3, $4, $5)`,
          values: [uuidv4(), email, name, profilePic, true]
        }
        query(querytext).then((result)=>{
          debug('user added');
          var querytext = {
            name: 'select-user',
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email]
          }
          query(querytext).then((result)=>{
            debug(result.rows[0]);
            return done(null,result.rows[0]);
          }).catch((err)=>{
            debug(err);
            return done(null, false, { message: "something went wrong" });
          })
        }).catch((err)=>{
          debug(err);
          return done(null, false, { message: "something went wrong" });
        })
      }
    }).catch((err)=>{
      debug(err);
      return done(null, false, { message: "something went wrong" });
    })
  })
)
