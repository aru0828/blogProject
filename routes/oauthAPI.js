const express = require('express');
const router = express.Router();
const passport = require('passport');
const fetch  = require('node-fetch');
require('dotenv').config();
// const {pool} = require()


const GoogleStrategy = require('passport-google-oauth20').Strategy;
 
passport.use(new GoogleStrategy({
    clientID: process.env["GOOGLE_CLIENTID"],
    clientSecret: process.env["GOOGLE_CLIENTSECRET"],
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // })

    // 跑api註冊
    let requestData = {
        'email':profile._json.email,
        'name':profile._json.name,
        'source':profile.provider,
        'avatar':profile._json.picture
    }
    console.log(requestData);
   
    fetch(`${process.env["SERVER_URL"]}/api/user`, {
        'method':'POST',
        'body':JSON.stringify(requestData),
        'headers':{
            'content-type':'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log(result)
    })
    // if result.ok return cb
    return cb();
  }
));


router.get('/auth/google',
  passport.authenticate('google', { scope: ['openid', 'email', 'profile'] })
);
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/signin');
  });

  module.exports = router;