const express = require('express');
const router = express.Router();
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
const {pool} = require('../mysql');

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const GoogleStrategy = require('passport-google-oauth20').Strategy;
 
passport.use(new GoogleStrategy({
    clientID: process.env["GOOGLE_CLIENTID"],
    clientSecret: process.env["GOOGLE_CLIENTSECRET"],
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
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
                        console.log(req.session.user)

                        // res.send({
                        //     'ok': true,
                        //     'message': '登入成功'
                        // })
                        console.log('登入成功')
                        return cb(err, result);
                    }
                    else {
                        // res.send({
                        //     'error': true,
                        //     'message': '登入失敗'
                        // })
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
                        // res.send({
                        //     'ok': true,
                        //     'message': '註冊成功'
                        // })
                        console.log('註冊成功後執行登入')
                        
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
                                console.log(req.session.user)
        
                                // res.send({
                                //     'ok': true,
                                //     'message': '登入成功'
                                // })
                                console.log('登入成功')
                                return cb(err, result);
                            }
                            else {
                                // res.send({
                                //     'error': true,
                                //     'message': '登入失敗'
                                // })
                                return cb(err);
                            }
                        })
                    }
                    else {
                        // res.send({
                        //     'error': true,
                        //     'message': '註冊失敗，請重新嘗試'
                        // })
                        return cb(err);
                    }
                })
            }
        })
        pool.releaseConnection(conn);
    })

    // 刪掉就成功了
    // return cb();
  }
));


router.get('/auth/google',
  passport.authenticate('google', { scope: ['openid', 'email', 'profile'] })
);
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
    return;
  }
);

  module.exports = router;