const express = require('express');
const router = express.Router();
const passport = require('passport');
require('dotenv').config();
const {pool} = require('../mysql');


router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const facebook = require('passport-facebook').Strategy;
 
passport.use(new facebook({
    clientID: process.env["FACEBOOK_CLIENTID"],
    clientSecret: process.env['FACEBOOK_CLIENTSECRET'],
    callbackURL: process.env['FACEBOOK_CALLBACKURL'],
    passReqToCallback: true ,
  },
  function(req, accessToken, refreshToken, profile, cb) {
    

    let source = profile.provider;
    let email  = profile._json.email;
    let name   = profile._json.name;
    let avatar = profile._json.picture;
  
    pool.getConnection((err, conn) => {
        // 檢查相同source下的email是否註冊過
        let sql = `select * from users
                    WHERE email = '${email}' AND source = '${source}'`
        conn.query(sql, (err, result) => {
            
            // 已註冊 轉為執行登入
            if (result.length > 0) {

                let sql = `SELECT * FROM users WHERE email = '${email}' AND source = '${source}'`;

                conn.query(sql, (err, result) => {

                    //驗證通過儲存SESSION並response
                    if (result.length>0) {
                        req.session.user = {
                            'user_id': result[0].user_id,
                            'email': result[0].email,
                            'username': result[0].username,
                            'avatar': result[0].avatar,
                            'description':result[0].description
                        };
                        return cb(err, result);
                    }
                    else {
                        return cb(err);
                    }
                })
            }
            // 尚未註冊
            else {
                sql = `INSERT INTO users set
                        email = '${email}',
                        username = '${name}',
                        avatar = '${avatar}',
                        source = '${source}'`
      
                conn.query(sql, (err, result) => {
                    if (result) {
                
                        let sql = `SELECT * FROM users WHERE email = '${email}' AND source = '${source}'`;

                        conn.query(sql, (err, result) => {
        
                            //驗證通過儲存SESSION並response
                            if (result.length>0) {
                                req.session.user = {
                                    'user_id': result[0].user_id,
                                    'email': result[0].email,
                                    'username': result[0].username,
                                    'avatar': result[0].avatar
                                };
                                return cb(err, result);
                            }
                            else {
                                return cb(err);
                            }
                        })
                    }
                    else {
                        return cb(err);
                    }
                })
            }
        })
        pool.releaseConnection(conn);
    })
  }
));


router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['openid', 'email', 'profile'] })
);
 
router.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
    return;
  }
);

  module.exports = router;