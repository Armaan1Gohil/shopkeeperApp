let debug = require('debug')('user:');
var express = require('express');
var router = express.Router();
var query = require('../db');
var uuidv4 = require('uuidv4');
var bcrypt = require('../config/bcrypt');
const path = require('path');
const sendMail = require('../config/sendMail');
const ejs = require("ejs");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const isLoggedIn = require('../config/token');


router.post('/resetpasswordmail',(req,res) => {
  if(!req.body.email) {
    return res.status(200).json({messages:{
      danger:'Invalid Credentials'
    }})
  }
  var querytext = {
    name: 'find-user',
    text: `SELECT * FROM users WHERE email = $1`,
    values: [req.body.email]
  }
  query(querytext).then((result) => {
    if(!result.rows.length) {
      return res.status(200).json({messages:{
        danger:'No User Found Please Sign Up'
      }})
    } else {
      var user = result.rows[0];
      if(!user.password) {
        return res.status(200).json({messages:{
          success:`You Have An Account With Google+`
        }})
      }
      if(!user.isverified) {
        return res.status(200).json({messages:{
          success:`Email Not Verified So Can't Change Password`
        }})
      } else {
        var payload = { _id: req.body.email };
        var token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: '1h'
        });
        ejs.renderFile(path.resolve(__dirname,"../config/views/resetPasswordEmail.ejs"),{
          link: process.env.API_HOST+"/api/resetpassword?token="+token
        }).then((data) => {
          debug(data);
          sendMail(req.body.email,"Reset Your Password",data);
        }).catch((err) => {
          debug(err);
        });
        return res.status(200).json({messages:{
          success:'Please Check Your Email'
        }})
      }
    }
  }).catch((err)=>{
    debug(err);
    return res.status(400).json({messages:{
      success:'Something Went Wrong'
    }})
  })
})

router.post('/sendmail',(req,res) => {
  if(!req.body.email) {
    return res.status(200).json({messages:{
      danger:'Invalid Credentials'
    }})
  }
  var querytext = {
    name: 'find-user',
    text: `SELECT * FROM users WHERE email = $1`,
    values: [req.body.email]
  }
  query(querytext).then((result) => {
    if(!result.rows.length) {
      return res.status(200).json({messages:{
        danger:'No User Found Please Sign Up'
      }})
    } else {
      var user = result.rows[0];
      if(user.isverified) {
        return res.status(200).json({messages:{
          success:'Email already Verified'
        }})
      } else {
        var payload = { _id: req.body.email };
        var token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: '1h'
        });
        ejs.renderFile(path.resolve(__dirname,"../config/views/verifyEmail.ejs"),{
          link: process.env.API_HOST+"/api/verify?token="+token
        }).then((data) => {
          debug(data);
          sendMail(req.body.email,"Verify Your Email",data);
        }).catch((err) => {
          debug(err);
        });
        return res.status(200).json({messages:{
          success:'Please Check Your Email'
        }})
      }
    }
  }).catch((err)=>{
    debug(err);
    return res.status(400).json({messages:{
      success:'Something Went Wrong'
    }})
  })
})


router.get('/signup',(req,res)=>{
  res.status(200).json({_token:req.csrfToken()});
});
router.post('/signup',(req,res)=>{
  if( !req.body.email || !req.body.name || !req.body.password) {
    debug('invalid credentials')
    return res.status(400).json({messages:{
      danger:'Invalid Credentials'
    }})
  }
  var querytext = {
      name: 'find-user',
      text: 'SELECT * FROM users WHERE email = $1',
      values: [req.body.email]
    }
    query(querytext)
      .then((result)=>{
        if(result.rows.length) {
          debug('email already in use');
          return res.status(203).json({messages:{
            warning: 'email already in use'
          }})
        }
        var querytext = {
          name: 'insert-user',
          text: `INSERT INTO users(id, email, name, password) VALUES($1, $2, $3, $4)`,
          values: [uuidv4(), req.body.email.toLowerCase(), req.body.name.toLowerCase(), bcrypt.encrypt(req.body.password)]
        }
        query(querytext).then((result)=>{
          var querytext = {
            text: `SELECT * FROM users where email=$1`,
            values: [ req.body.email ]
          }
          query(querytext).then((result)=>{
            debug(result.rows);
            var payload = { _id: req.body.email };
            var token = jwt.sign(payload, process.env.SECRET, {
              expiresIn: '1h'
            });
            ejs.renderFile(path.resolve(__dirname,"../config/views/verifyEmail.ejs"),{
              link: process.env.API_HOST+"/api/verify?token="+token
            }).then((data) => {
              debug(data);
              sendMail(req.body.email,"Verify Your Email",data);
            }).catch((err) => {
              debug(err);
            });
            return res.status(200).json({messages:{
              success:'Please Check Your Email'
            }})
          }).catch((err)=>{
            debug(err);
            return res.status(400).json({messages:{
              danger:'something went wrong'
            }})
          })
        }).catch((err)=>{
          debug(err);
          return res.status(400).json({messages:{
            danger:'something went wrong'
          }})
        });
      }).catch((err)=>{
        debug(err);
        return res.status(400).json({messages:{
          danger:'something went wrong'
        }})
      })
});

router.get('/login',(req,res)=>{
  res.status(200).json({_token:req.csrfToken(),messages:req.message});
});

router.post('/login',(req,res)=>{
  if(!req.body.email && !req.body.password ) {
    return res.status(500).json({messages:{
      danger: 'Invalid Credentials'
    }})
  }
  var querytext = {
      name: 'find-user',
      text: 'SELECT * FROM users WHERE email = $1',
      values: [req.body.email]
    }
    query(querytext).then((result)=>{
      if(!result.rows.length) {
        debug('no user found');
        return res.status(500).json({messages:{
          danger: 'no user found'
        }})
      }
      var user = result.rows[0];
      if(!user.isverified) {
        return res.status(500).json({messages:{
          info:'Your Email Is Not Verified'
        }})
      }
      debug(user);
      if(req.body.password == " " || !user.password) {
        return res.status(500).json({messages:{
          info:'You Already Have An Account Registered With Google+'
        }})
      }
      if(bcrypt.compare(req.body.password,user.password)) {
        debug(user);
        const payload = { _id: user.id };
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({messages:{
          success:'Looging You In'
        }})
      } else {
        return res.status(500).json({messages:{
          danger:'Incorrect Password You Can Reset Your Password'
        }})
      }
    }).catch((err)=>{
      debug(err);
      debug(err);
      return res.status(500).json({messages:{
        danger:'something went wrong'
      }})
    })
});

router.get('/logout',isLoggedIn,(req,res)=>{
  res.clearCookie('token');
  debug(res.locals.id);
  if(res.locals.id) {
    return res.redirect('/');
  } else {
    return res.redirect('/');
  }
})

router.get('/user',isLoggedIn ,(req,res)=>{
  debug(res.locals.id);
  if(!res.locals.id) {
    return res.status(400).json({messages:{
      error:'Unauthorized Access'
    }})
  }
  var querytext = {
    name: 'select-user',
    text: `SELECT email, name, profilePic FROM users WHERE id = $1`,
    values: [res.locals.id]
  }
  query(querytext).then((result)=>{
    if( !result.rows.length ) {
      return res.status(400).json({messages:{
        error:'Unauthorized Access'
      }})
    }
    return res.status(200).json({ user: result.rows[0] })
  }).catch((err)=>{
    debug(err);
    return res.status(500).json({messages:{
      error:'something went wrong'
    }})
  })
});

router.get("/auth/google",
    passport.authenticate("google", { scope: ["profile","email"] })
);
router.get('/auth/google/callback',passport.authenticate('google',
{ failureRedirect: "/login", session: false}),
(req, res)=>{
  const payload = { _id: req.user.id };
  const token = jwt.sign(payload, process.env.SECRET, {
    expiresIn: '1h'
  });
  res.cookie('token', token, { httpOnly: true });
  return res.redirect('/dashboard');
});


module.exports = router;
