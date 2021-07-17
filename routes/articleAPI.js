const express = require('express');
const session = require('express-session');
const router = express.Router();
const { pool } = require('../mysql');
const { uploadToS3 } = require('../AWS');
const multer = require('multer');
const { response } = require('express');
const upload = multer({ dest: 'uploads/' })

router.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
// 加上這行才能讀取json
router.use(express.json());




// 發布文章
router.post('/api/article', upload.single('coverPhoto'), async function (req, res) {

  let title = req.body.title;
  let coverPhoto = req.file;
  let content = req.body.content;
  let price = req.body.price;
  let summary = req.body.summary;




  let getS3Url = await uploadToS3(coverPhoto)
  // result 格式
  // {
  //   ETag: '"b83900e80b8966d41c42181abd6e06c4"',
  //   Location: 'https://aru0828practicebucket.s3.ap-northeast-2.amazonaws.com/9591c7f87d19e72632b75262ab1ee48f',
  //   key: '9591c7f87d19e72632b75262ab1ee48f',
  //   Key: '9591c7f87d19e72632b75262ab1ee48f',
  //   Bucket: 'aru0828practicebucket'
  // }
  pool.getConnection(function (err, conn) {
    let sql = `
                INSERT INTO articles set
                  user_id = ${req.session.user.user_id},
                  title = '${title}',
                  content = '${content}',
                  coverPhoto = '${getS3Url.Location}',
                  price = ${price ? price : null},
                  summary = '${summary}'`
    conn.query(sql, function (err, result) {
      if (err) {
        res.send({
          'error': true,
          'message': '新增文章失敗'
        });
      }
      else {
        res.send({
          'ok': true,
          'article_id': result.insertId
        })
      }
    })
    pool.releaseConnection(conn);
  })
})


// 取得文章列表 最新-最舊
router.get('/api/articles', function (req, res) {
  let articles = [];
  let tags = [];
  pool.getConnection(function (err, conn) {


    if (req.session.user) {
      // 利用session判斷該使用者是否按過各篇文章的讚
      conn.query(`SELECT articles.*, 'no' AS user_liked, IFnull(COUNT(article_likes.article_id), 0) AS likes FROM articles
        LEFT JOIN article_likes
        ON articles.article_id = article_likes.article_id
        LEFT JOIN users
        ON article_likes.user_id = users.user_id
        GROUP BY articles.article_id
        limit 12`, function (err, result) {
        if (err) {
          res.send({
            'error': true,
            'message': '取得文章列表失敗'
          })
        }
        else {
          // // 分頁系統
          // res.send({
          //   'ok':true,
          //   'data':result,
          // })
          articles = result;
          // 取得tag
          conn.query(`SELECT * FROM tags`, function (err, result) {
            tags = result;
            // 檢查使用者按過哪篇讚 並將結果加進articles.user_isliked
            conn.query(`select * from articles
                          left join article_likes
                          on articles.article_id =  article_likes.article_id
                          where article_likes.user_id = ${req.session.user.user_id}
                          order by create_time asc`, function (err, likedArr) {
              // console.log(likedArr, 'like')
              likedArr.forEach(item => {
                articles[item.article_id - 1].user_isliked = 'yes'
              })
              res.send({
                'ok': true,
                'data': {
                  'articles': articles,
                  'tags': tags
                }
              })
            })
          })
        }


      })
    }
    else {
      conn.query(`select users.*, articles.*, IFNULL(count(article_likes.article_id), 0)  as likes from articles
                  left join article_likes
                  ON articles.article_id = article_likes.article_id
                  INNER JOIN users
                  ON articles.user_id = users.user_id
                  GROUP BY articles.article_id
                  ORDER BY articles.create_time DESC;`, function (err, result) {

        // // 分頁系統
        // res.send({
        //   'ok':true,
        //   'data':result,
        // })

        articles = result;
        // 取得
        conn.query(`SELECT * FROM tags`, function (err, result) {
          tags = result;

          res.send({
            'ok': true,
            'data': {
              'articles': articles,
              'tags': tags
            }
          })
        })

      })
    }
    pool.releaseConnection(conn);
  })
})


// 取得單筆文章 querystring
router.get('/api/article/:articleid', function (req, res) {
  let articleId = req.params.articleid;


  pool.getConnection((err, conn) => {
    conn.query(`SELECT arts.*,  users.user_id, users.username, users.avatar
                      FROM articles as arts
                      INNER JOIN users
                      ON arts.user_id = users.user_id
                      WHERE arts.article_id = ${articleId};`, function (err, result) {

      res.send({
        'ok': true,
        'data': {
          'article': {
            'article_id': result[0].article_id,
            'title': result[0].title,
            'content': result[0].content,
            'coverPhoto': result[0].coverPhoto,
            'create_time': result[0].create_time,
            'update_time': result[0].update_time,
            'author': {
              'user_id': result[0].user_id,
              'username': result[0].username,
              'avatar': result[0].avatar
            }
          },
        }
      });
    })

    pool.releaseConnection(conn);
  })
})



// 取得最新文章
router.get('/api/newarticles', function (req, res) {
  pool.getConnection(function (err, conn) {
    conn.query('SELECT * FROM articles ORDER BY create_time DESC LIMIT 1', function (err, result) {
      res.send(result);
    })
    pool.releaseConnection(conn);
  })
})



// // 取得按讚api
// // 要按讚須帶入userId, articleId
// router.post('/api/like', function (req, res) {
//   if (req.session.user) {
//     let articleId = req.body.article_id;

//     pool.getConnection(function (err, conn) {
//       conn.query(`SELECT like_id FROM article_likes WHERE article_id = ${articleId} AND  user_id = ${req.session.user.user_id}`, function (err, rows) {
//         // 利用query回傳的rows判斷使用者是否按過該文章讚 

//         let liked = rows.length ? rows[0].like_id : null;

//         // 根據liked決定要移除or新增讚
//         if (liked) {
//           conn.query(`DELETE FROM article_likes WHERE like_id = ${liked};`)
//         }
//         else {
//           conn.query(`INSERT INTO article_likes SET  
//                         article_id = ${articleId},
//                         user_id = ${req.session.user.user_id}`)
//         }
//         res.send({
//           'ok': true
//         });
//       })
//       pool.releaseConnection(conn);
//     })
//   }
//   // 未登入
//   else {
//     res.send({
//       'error': true,
//       'message': '請先登入才能使用會員功能'
//     });
//   }
// })

// 檢查使用者按過讚的文章 get出文章id
router.get('/api/like', function (req, res) {
  console.log(req.params.userid);

  if (req.session.user) {
    pool.getConnection((err, conn) => {
      conn.query(`SELECT like_id, article_id FROM article_likes WHERE user_id = ${req.session.user.user_id}`, (err, result) => {
        let responseData = {}
        result.forEach(item => {
          responseData[`${item.article_id}`] = item.like_id;
        })
        res.send({
          'user_likes': responseData
        })
      })

      pool.releaseConnection(conn)
    })

  }

})


// 取得熱門文章
router.get('/api/hotpost', function (req, res) {


  pool.getConnection((err, conn) => {


    conn.query(`SELECT articles.* , users.*, HotArticle.*
                FROM(
                    SELECT 
                      article_id, count(*) as likeQty
                    FROM
                      article_likes
                    GROUP BY article_id
                    ORDER BY count(*) desc
                    LIMIT 5
                  ) AS HotArticle
                INNER JOIN articles
                ON articles.article_id = HotArticle.article_id
                INNER JOIN users
                ON articles.user_id = users.user_id`, (err, result) => {


      let responseData = [];
      console.log(result.length);
      result.forEach(item => {
        responseData.push({
          'article': {
            'article_id': item.article_id,
            'title': item.title,
            'content': item.content,
            'coverPhoto': item.coverPhoto,
            'create_time': item.create_time,
            'update_time': item.update_time,
            'likeQty': item.likeQty,
            'author': {
              'user_id': item.user_id,
              'username': item.username,
              'avatar': item.avatar
            }
          },

        })
      })
      res.send({
        'ok': true,
        'data': responseData
      })
    })

    pool.releaseConnection(conn)
  })

})


// 取得最新貼文
router.get('/api/newpost', function (req, res) {


  pool.getConnection((err, conn) => {
    conn.query(`
        select * from articles
        order by create_time DESC
        LIMIT 5;`, (err, result) => {
      res.send(result)
    })

    pool.releaseConnection(conn)
  })

})


// 取得隨機文章
router.get('/api/randompost', function (req, res) {

  pool.getConnection((err, conn) => {
    conn.query(`SELECT * FROM articles
                ORDER BY RAND()
                LIMIT 5`, (err, result) => {
      res.send(result)
    })

    pool.releaseConnection(conn)
  })

})


module.exports = router



