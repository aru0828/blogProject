const express = require('express');
const router  = express.Router();
const {pool}  = require('../mysql');
const {uploadToS3} = require('../AWS');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// 加上這行才能讀取json
router.use(express.json());




// 發布文章
router.post('/api/article', upload.single('coverPhoto'), async function(req, res){
    
  let title      = req.body.title;
  let coverPhoto = req.file;
  let content    = req.body.content;
  let price      = req.body.price;
  let summary      = req.body.summary;

  let getS3Url = await uploadToS3(coverPhoto)
  // result 格式
  // {
  //   ETag: '"b83900e80b8966d41c42181abd6e06c4"',
  //   Location: 'https://aru0828practicebucket.s3.ap-northeast-2.amazonaws.com/9591c7f87d19e72632b75262ab1ee48f',
  //   key: '9591c7f87d19e72632b75262ab1ee48f',
  //   Key: '9591c7f87d19e72632b75262ab1ee48f',
  //   Bucket: 'aru0828practicebucket'
  // }
  pool.getConnection(function(err, conn){
    let sql = `
                INSERT INTO articles set
                  user_id = 1,
                  title = '${title}',
                  content = '${content}',
                  coverPhoto = '${getS3Url.Location}',
                  price = ${price ? price : null},
                  summary = '${summary}'`
    conn.query(sql, function(err, result){
      if (err) throw err;
      console.log(result)
      res.send({
        'ok':true,
        'article_id':result.insertId
      })
    })
    pool.releaseConnection(conn);
  })
})


// 取得文章列表 最新-最舊
router.get('/api/articles', function(req, res){
    let articles = [];
    console.log('articles')
    let tags = [];
    pool.getConnection(function(err, conn){
      conn.query(`SELECT * FROM articles
                  INNER JOIN users
                  ON articles.user_id = users.user_id
                  ORDER BY articles.create_time DESC;`, function(err, result){
        
        // // 分頁系統
        // res.send({
        //   'ok':true,
        //   'data':result,
        // })
        
        articles = result;
        // 取得
        conn.query(`SELECT * FROM tags`, function(err, result){
          tags = result;
          
          res.send({
            'ok':true,
            'data':{
              'articles':articles,
              'tags':tags
            }
          })
        })
        
      })
      pool.releaseConnection(conn);
    })
})


// 取得單筆文章 querystring
router.get('/api/article', function(req, res){
    let articleId = req.query.articleid;
    console.log(articleId)
    pool.getConnection( (err, conn) => {
      conn.query(`SELECT arts.*,  users.user_id, users.username, users.avatar
                      FROM articles as arts
                      INNER JOIN users
                      ON arts.user_id = users.user_id
                      WHERE arts.article_id = ${articleId};`, function(err, result){
        
        res.send({
          'ok':true,
          'data':{
            'article':{
              'article_id': result[0].article_id,
              'title': result[0].title,
              'content': result[0].content,
              'coverPhoto': result[0].coverPhoto,
              'create_time': result[0].create_time,
              'update_time': result[0].update_time,
            },
            'author':{
              'user_id':result[0].user_id,
              'username':result[0].username,
              'avatar':result[0].avatar
            }
          }
        });
      })
      
      pool.releaseConnection(conn);
    })
})
  


// 取得最新文章
router.get('/api/newarticles', function(req, res){
  pool.getConnection(function(err, conn){
    conn.query('SELECT * FROM articles ORDER BY create_time DESC LIMIT 1', function(err, result){
      res.send(result);
    })
    pool.releaseConnection(conn);
  })
})



// 取得按讚api
// 要按讚須帶入userId, articleId
router.post('/api/like', function(req, res){
  
  let articleId = req.body.articleId;
  pool.getConnection(function(err, conn){
    conn.query(`SELECT like_id FROM article_likes WHERE article_id = ${articleId}`, function(err, rows){

      // 利用query回傳的rows判斷使用者是否按過該文章讚 
      let liked = rows.length ? rows[0].like_id : null;
      
      // 根據liked決定要移除or新增讚
      if(liked){
        conn.query(`DELETE FROM article_likes WHERE like_id = ${liked};`)  
      }
      else{
        conn.query(`INSERT INTO article_likes SET  
                      article_id = ${articleId},
                      user_id = 1`)
      }
      res.send({
        'ok':true
      });
    })
    pool.releaseConnection(conn);
  })
})


// 取得熱門文章
router.get('/api/hotpost', function(req, res){
  
  
  pool.getConnection( (err, conn) => {
    conn.query(`
      SELECT articles.* 
      FROM(
          SELECT 
            article_id, count(*)
          FROM
            article_likes
          GROUP BY article_id
          ORDER BY count(*) desc
          LIMIT 5
        ) AS HotArticle
      INNER JOIN articles
      ON articles.article_id = HotArticle.article_id;`, (err, result) => {
        res.send(result)
    })
    
    pool.releaseConnection(conn)
  })
 
})


// 取得最新貼文
router.get('/api/newpost', function(req, res){
  
  
  pool.getConnection( (err, conn) => {
    conn.query(`
        select * from articles
        order by create_time DESC
        LIMIT 5;`, (err, result) => {
        res.send(result)
    })
    
    pool.releaseConnection(conn)
  })
 
})

module.exports = router