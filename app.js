
const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const articlesAPI = require('./routes/articleAPI');
const memberAPI = require('./routes/memberAPI');
const oauthAPI  = require('./routes/oauthAPI');

// 第一個參數為虛擬目錄 url 須 localhost/static
// 第二個參數為static資料夾名稱
app.use('/public', express.static('public'));
app.use("/", express.static('node_modules'));
app.set('view engine', 'ejs');

app.use(articlesAPI);
app.use(memberAPI);
app.use(oauthAPI);

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
app.get('/article', function(req, res){
  res.render('article');
})

app.get('/member', function(req, res){
  res.render('member');
})


// 註冊
app.get('/signin', function(req, res){
  res.render('signin');
})

app.get('/post',  function(req, res) {
  res.render('postPage', {'title': '首頁',});
});



app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});