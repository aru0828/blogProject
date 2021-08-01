
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const articlesAPI = require('./routes/articleAPI');
const userAPI = require('./routes/userAPI');
const oauthAPI  = require('./routes/oauthAPI');
const FBoauthAPI  = require('./routes/fbOauthAPI');
const GithuboauthAPI  = require('./routes/githubOauthAPI');
const memberAPI  = require('./routes/memberAPI');
const commentAPI  = require('./routes/commentAPI');
const likeAPI  = require('./routes/likeAPI');
const followAPI  = require('./routes/followAPI');
const session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}))
require('dotenv').config();
// 第一個參數為虛擬目錄 url 須 localhost/static
// 第二個參數為static資料夾名稱
app.use('/public', express.static('public'));
app.use("/", express.static('node_modules'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(userAPI);
app.use(oauthAPI);
app.use(FBoauthAPI);
app.use(GithuboauthAPI);
app.use(articlesAPI);
app.use(memberAPI);
app.use(commentAPI);
app.use(likeAPI);
app.use(followAPI);
app.set();
app.get('/', function(req, res) {
  // res.sendFile(path.join(__dirname,'/templates/index.html'));
  res.render('index', {'title': '首頁',});
});


//文章列表
app.get('/articles', function(req, res){
  res.render('articles');
})
// 單筆文章
app.get('/article/:articleid', function(req, res){
  console.log(req.params.articleId)
  res.render('article');
})

app.get('/member/:useremail', function(req, res){
  console.log(req.params.id)
  res.render('member');
})

app.get('/account/edit', function(req, res){
  res.render('memberEdit');
})


// 註冊
app.get('/signin', function(req, res){
  res.render('signin');
})

app.get('/post',  function(req, res) {
  res.render('postPage', {'title': '首頁',});
});

app.get('/post/edit/:articleId',  function(req, res) {
  res.render('editPage', {'title': '首頁',});
});


app.listen(process.env["SERVER_PORT"], function() {
  console.log('Example app listening on port 3000!');
});