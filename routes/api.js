let debug = require('debug')('api:');
var express = require('express');
var router = express.Router();
const query = require('../db');
const multer = require("multer");
const ejs = require("ejs");
var fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const verifyToken = require('../config/token');
var bcrypt = require('../config/bcrypt');
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      var dir = process.env.IMAGE_DEST;
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
      cb(null, dir)
   },
   filename: (req, file, cb) => {
      cb(null,"IMAGE-" + Date.now() + path.extname(file.originalname));
   }
});


const upload = multer({
   storage: storage,
   limits:{fileSize: 1000000},
}).single("Image");

router.get('/verify', verifyToken ,(req, res, next) => {
  if(!res.locals.id) {
    return res.status(400).json({messages:"Unauthorized"});
  } else {
    var querytext = {
      name: 'verify-user',
      text: 'UPDATE users SET isVerified=true WHERE email = $1',
      values: [res.locals.id]
    }
    query(querytext).then((result)=>{
        return res.status(200).json({messages:"Now You can login email verified"});
    }).catch((err)=>{
      return res.status(400).json({messages:"Something Went Wrong"});
    })
  }
});

router.get('/resetpassword', verifyToken, (req,res) => {
  if(!res.locals.id) {
    return res.status(400).json({messages:"Unauthorized"});
  } else {
    var querytext = {
      name: 'find-user',
      text: 'SELECT * FROM users WHERE email = $1',
      values: [res.locals.id]
    }
    query(querytext).then((result)=>{
      if(!result.rows.length) {
        return res.status(400).json({messages:"Unauthorize Access"});
      } else {
        var user = result.rows[0];
        var payload = { _id: user.id };
        var token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: '1h'
        });
        ejs.renderFile(path.resolve(__dirname,"../config/views/resetPassword.ejs"),{
          _token: req.csrfToken(),
          _id: token
        }).then((data) => {
          return res.send(data);
        }).catch((err) => {
          debug(err);
          return res.status(400).json({messages:"Something Went Wrong"});
        });
      }
    }).catch((err)=>{
      debug(err);
      return res.status(400).json({messages:"Something Went Wrong"});
    })
  }
});
router.post('/resetpassword',(req,res) => {
  const token = req.body.id; // query is for email cookie is for auth
  if (!token) {
    return res.status(401).json({Unauthorized: 'No token provided'});
  } else {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({Unauthorized: 'Invalid token'});
      } else {
        if(!req.body.password) {
          return res.status(401).json({Unauthorized: `Password Can't be empty`});
        }
        if(req.body.password.length < 8) {
          return res.status(401).json({Unauthorized: `Password Can't be too short`});
        }
        var querytext = {
          name: 'update-user',
          text: 'UPDATE users SET password = $1 where id = $2',
          values: [bcrypt.encrypt(req.body.password), decoded._id]
        }
        query(querytext).then((result) => {
          return res.status(200).json({success: `Password changes now you can login with this password`});
        }).catch((err)=>{
          debug(err);
          return res.status(401).json({Unauthorized: `Something Went Wrong`});
        })
      }
    });
  }
})

var moveFile = (from, to) => {
    const source = fs.createReadStream(from);
    const dest = fs.createWriteStream(to);
    return new Promise((resolve, reject) => {
        source.on('end', resolve);
        source.on('error', reject);
        source.pipe(dest);
    });
}
router.post('/upload',verifyToken , upload, (req,res,err) => {
    debug(res.locals.id);
    debug(req.file);
    var oldPath = req.file.path;
    var filePath = path.resolve(__dirname,"../build/uploads/"+res.locals.id);
    if (!fs.existsSync(filePath)){
      fs.mkdirSync(filePath);
    }
    var newPath = filePath+"/"+req.file.filename;
    moveFile(oldPath, newPath).then((result)=>{
    var url = process.env.API_HOST+"/uploads/"+res.locals.id+"/"+req.file.filename;
    debug(url);
    var querytext = {
        name: 'update-user',
        text: 'UPDATE users SET profilepic = $1 WHERE id = $2',
        values: [url, res.locals.id]
      }
      query(querytext).then((result)=>{
        return res.status(200).json({messages:{
          success:'Image Uploaded'
        }});
      }).catch((err)=>{
        return res.status(500).json({messages:{
          danger:'something went wrong'
        }});
      })
    }).catch((err)=>{
      debug(err);
      return res.status(500).json({messages:{
        danger:'something went wrong'
      }});
    })
});

module.exports = router;
