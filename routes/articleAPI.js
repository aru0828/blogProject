const express = require('express');
const router = express.Router();
const { pool } = require('../mysql');
const { uploadToS3 } = require('../AWS');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

// 加上這行才能讀取json
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// 取得標籤
router.get('/api/tag', function (req, res) {
  pool.getConnection((err, conn) => {

    conn.query('SELECT * FROM tags', (err, result) => {
      res.send({
        'ok': true,
        'data': result
      })
    })

    pool.releaseConnection(conn);
  })
})

// 發布文章
router.post('/api/article', upload.single('coverPhoto'), async function (req, res) {

  let tagArray = req.body.tagArray.split(",");
  if (tagArray[0] === '') {
    tagArray = [];
  }
  let title = req.body.title;
  let coverPhoto = req.file;
  let content = req.body.content;
  let price = req.body.price;
  let summary = req.body.summary;


  let getS3Url = await uploadToS3(coverPhoto)


  if (req.session.user) {
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
          return;
        }
        else {
          // 新增文章成功後 利用result的id儲存標籤資料
          if (tagArray.length > 0) {
            tagArray.forEach(tagId => {
              sql = `INSERT INTO article_tags set article_id = ${result.insertId}, tag_id = ${parseInt(tagId)}`;
              conn.query(sql, (err, result) => {
                if (err) {
                  res.send({
                    'error': true,
                    'message': '新增標籤錯誤'
                  })
                  return;
                }
              });
            })
            res.send({
              'ok': true,
              'article_id': result.insertId
            })
            return;
          }
          res.send({
            'ok': true,
            'article_id': result.insertId
          })

        }
      })
      pool.releaseConnection(conn);
    })
  }
  else {
    res.send({
      'error': true,
      'message': '登入後才能使用發文功能'
    })
  }

})

// 編輯文章
router.patch('/api/article', async function (req, res) {



  if (req.session.user) {
    let articleId = req.body.article_id;
    let title = req.body.title;
    let summary = req.body.summary ? req.body.summary : '';
    let content = req.body.content;
    let price = req.body.price ? req.body.price : null;

    // 檢查要編輯的文章作品與目前使用者是否相符
    let sql = `SELECT * FROM articles WHERE article_id = ${articleId} AND user_id = ${req.session.user.user_id}`
    pool.getConnection((err, conn) => {
      conn.query(sql, (err, result) => {

        if (err) {
          res.send({
            'error': true,
            'message': '內部程式發生錯誤'
          })
          return;
        }

        // 確認文章及作者無誤 進行編輯
        if (result.length > 0) {
          sql = `UPDATE articles set 
                  title   = '${title}',
                  summary = '${summary}',
                  content = '${content}',
                  price   =  ${price}
                  WHERE article_id = ${articleId}`

          conn.query(sql, (err, result) => {
            if(err){
              res.send({
                'error': true,
                'message': '編輯失敗'
              })
              return;
            }
            res.send({
              'ok': true,
              'message': '成功編輯文章~'
            })
          })
        }
        else {
          res.send({
            'error': true,
            'message': '使用者錯誤或文章已不存在!'
          })
        }
      })
      pool.releaseConnection(conn);
    })
  }
  else {
    res.send({
      'error': true,
      'message': '未登入，權限不足'
    })
  }



})

// 刪除文章
// 傳入文章id 檢查與session使用者是否為作者
router.delete('/api/article', function (req, res) {

  let articleId = req.body.article_id;
  if (req.session.user) {
    let sql = `SELECT * FROM articles WHERE article_id = ${articleId} AND user_id = ${req.session.user.user_id}`
    pool.getConnection((err, conn) => {
      conn.query(sql, (err, result) => {

        if (err) {
          res.send({
            'error': true,
            'message': '內部程式發生錯誤'
          })
          return;
        }

        // 確認文章及作者無誤 進行刪除
        if (result.length > 0) {
          sql = `DELETE FROM articles WHERE article_id = ${articleId}`
          conn.query(sql, (err, result) => {
            if (err) {
              res.send({
                'error': true,
                'message': '刪除失敗'
              })
              return;
            }
            res.send({
              'ok': true,
              'message': '成功刪除文章~'
            })
          })
        }
        else {
          res.send({
            'error': true,
            'message': '文章作者才可以刪除文章~'
          })
        }
      })
      pool.releaseConnection(conn);
    })
  }
  else {
    res.send({
      'error': true,
      'message': '未登入，權限不足'
    })
  }

})


// 取得文章列表 最新-最舊
router.get('/api/articles', function (req, res) {


  let page = parseInt(req.query.page);
  let sql = '';
  let dataLen = null;
  // 關鍵字搜尋
  if (req.query.keyword) {

    pool.getConnection((err, conn) => {
      conn.query(`SELECT count(*) AS dataLen FROM articles WHERE title like '%${req.query.keyword}%';`, (err, result) => {

        dataLen = result[0].dataLen;

        sql = `SELECT articleAndUsersAndLike.* , IFNULL(COUNT(comments.article_id), 0) as commentQty FROM
                  (
                  SELECT 
                    articles.article_id, articles.coverPhoto, articles.title, articles.summary, articles.price, articles.content,
                    CONVERT_TZ(articles.create_time, '+00:00', '+08:00') as create_time,
                    CONVERT_TZ(articles.update_time, '+00:00', '+08:00') as update_time,
                    users.user_id, users.username, users.avatar , 
                    IFNULL(COUNT(article_likes.article_id), 0) as likeQty,
                    GROUP_CONCAT(IF(article_likes.user_id = null, 'yes', '') SEPARATOR '' ) AS user_is_liked
                    FROM articles
                    INNER JOIN users
                    ON articles.user_id = users.user_id
                    LEFT JOIN article_likes
                    ON articles.article_id = article_likes.article_id
                    GROUP BY articles.article_id
                    ORDER BY articles.create_time DESC
                    
                  ) as articleAndUsersAndLike

                  LEFT JOIN comments
                  ON articleAndUsersAndLike.article_id = comments.article_id
                  WHERE articleAndUsersAndLike.title LIKE '%${req.query.keyword}%'
                  GROUP BY articleAndUsersAndLike.article_id
                  LIMIT ${page * 6}, 6 `
        conn.query(sql, (err, result) => {
          if (err) {
            res.send({
              'error': true,
              'message': '無法取得文章列表'
            })
            return;
          }
          else {
            let responseData = [];

            result.forEach(item => {
              responseData.push({
                'article_id': item.article_id,
                'title': item.title,
                'content': item.content,
                'coverPhoto': item.coverPhoto,
                'create_time': item.create_time,
                'update_time': item.update_time,
                'likeQty': item.likeQty,
                'commentQty': item.commentQty,
                'user_is_liked': item.user_is_liked,
                'summary': item.summary,
                'author': {
                  'user_id': item.user_id,
                  'username': item.username,
                  'avatar': item.avatar
                }
              })
            })
            res.send({
              'ok': true,
              'data': {
                'articles': responseData,
                'nextPage': (dataLen - ((page + 1) * 6)) > 0 ? parseInt(page) + 1 : null
              }
            })
          }
        })
      })
      pool.releaseConnection(conn);
    })

  }

  else if (req.query.tag) {
    let tag = parseInt(req.query.tag);
    // 取得資料長度 並用dataLen紀錄
    pool.getConnection((err, conn) => {
      conn.query(`SELECT count(*) as dataLen FROM articles
                    INNER JOIN article_tags
                    ON articles.article_id = article_tags.article_id
                    WHERE article_tags.tag_id = ${tag}`, (err, result) => {

        dataLen = result[0].dataLen;

        sql = `SELECT * FROM
            (SELECT articleAndUsersAndLike.* , IFNULL(COUNT(comments.article_id), 0) as commentQty FROM
                          (
                          SELECT
                            articles.article_id, articles.coverPhoto, articles.title, articles.summary, articles.price, articles.content,
                            CONVERT_TZ(articles.create_time, '+00:00', '+08:00') as create_time,
                            CONVERT_TZ(articles.update_time, '+00:00', '+08:00') as update_time,
                            users.user_id, users.username, users.avatar , 
                            IFNULL(COUNT(article_likes.article_id), 0) as likeQty,
                            GROUP_CONCAT(IF(article_likes.user_id =  ${req.session.user ? req.session.user.user_id : null},  'yes', '') SEPARATOR '' ) AS user_is_liked
                            FROM articles
                            INNER JOIN users
                            ON articles.user_id = users.user_id
                            LEFT JOIN article_likes
                            ON articles.article_id = article_likes.article_id
                            GROUP BY articles.article_id
                            ORDER BY articles.create_time DESC
                          ) as articleAndUsersAndLike
            
                          LEFT JOIN comments
                          ON articleAndUsersAndLike.article_id = comments.article_id
                          GROUP BY articleAndUsersAndLike.article_id) AS articles
            JOIN article_tags
            ON articles.article_id = article_tags.article_id
            WHERE article_tags.tag_id = ${tag}
            ORDER BY articles.create_time DESC
            LIMIT ${page * 6}, 6 `


        conn.query(sql, (err, result) => {

          if (err) {
            res.send({
              'error': true,
              'message': '無法取得文章列表'
            })
            return;
          }
          else {
            let responseData = [];

            result.forEach(item => {
              responseData.push({
                'article_id': item.article_id,
                'title': item.title,
                'content': item.content,
                'coverPhoto': item.coverPhoto,
                'create_time': item.create_time,
                'update_time': item.update_time,
                'likeQty': item.likeQty,
                'commentQty': item.commentQty,
                'summary': item.summary,
                'user_is_liked': item.user_is_liked,
                'author': {
                  'user_id': item.user_id,
                  'username': item.username,
                  'avatar': item.avatar
                }
              })
            })
            res.send({
              'ok': true,
              'data': {
                'articles': responseData,
                'nextPage': (dataLen - ((page + 1) * 6)) > 0 ? parseInt(page) + 1 : null
              }
            })
          }
        })
      })

      pool.releaseConnection(conn);
    })



  }
  else if (req.query.display === 'hot') {
    pool.getConnection((err, conn) => {
      conn.query(`SELECT count(*) as dataLen FROM articles ORDER BY create_time DESC`, (err, result) => {
        dataLen = result[0].dataLen;
        sql = `SELECT articleAndUsersAndLike.* , IFNULL(COUNT(comments.article_id), 0) as commentQty FROM
                (
                SELECT
                  articles.article_id, articles.coverPhoto, articles.title, articles.summary, articles.price, articles.content,
                  CONVERT_TZ(articles.create_time, '+00:00', '+08:00') as create_time,
                  CONVERT_TZ(articles.update_time, '+00:00', '+08:00') as update_time,
                  users.user_id, users.username, users.avatar , 
                  IFNULL(COUNT(article_likes.article_id), 0) as likeQty,
                  GROUP_CONCAT(IF(article_likes.user_id = ${req.session.user ? req.session.user.user_id : null}, 'yes', '') SEPARATOR '' ) AS user_is_liked
                  FROM articles
                  INNER JOIN users
                  ON articles.user_id = users.user_id
                  LEFT JOIN article_likes
                  ON articles.article_id = article_likes.article_id
                  GROUP BY articles.article_id
                  ORDER BY articles.create_time DESC
                  
                ) as articleAndUsersAndLike

                LEFT JOIN comments
                ON articleAndUsersAndLike.article_id = comments.article_id
                GROUP BY articleAndUsersAndLike.article_id
                ORDER BY articleAndUsersAndLike.likeQty DESC
                LIMIT ${page * 6}, 6 `
        conn.query(sql, (err, result) => {

          if (err) {
            res.send({
              'error': true,
              'message': '無法取得文章列表'
            })
            return;
          }
          else {
            let responseData = [];

            result.forEach(item => {
              responseData.push({
                'article_id': item.article_id,
                'title': item.title,
                'content': item.content,
                'coverPhoto': item.coverPhoto,
                'create_time': item.create_time,
                'update_time': item.update_time,
                'likeQty': item.likeQty,
                'commentQty': item.commentQty,
                'summary': item.summary,
                'user_is_liked': item.user_is_liked,
                'author': {
                  'user_id': item.user_id,
                  'username': item.username,
                  'avatar': item.avatar
                }
              })
            })
            res.send({
              'ok': true,
              'data': {
                'articles': responseData,
                'nextPage': (dataLen - ((page + 1) * 6)) > 0 ? parseInt(page) + 1 : null
              }
            })
          }
        })
      })
      pool.releaseConnection(conn);
    })


  }
  else if (req.query.display === 'following') {


    // 避免透過其他手段呼叫 沒有user_id會跳錯
    if (req.session.user) {
      sql = `SELECT follow FROM follows WHERE user_id = ${req.session.user.user_id}`
    }
    else {
      res.send({
        'error': true,
        'message': '登入後才能使用此功能'
      })
      return;
    }
    pool.getConnection((err, conn) => {
      conn.query(sql, (err, result) => {

        let whereSQL = ""
        // 取得 where 條件
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            whereSQL += `articleAndUsersAndLike.user_id = ${result[i].follow}`;
            if (i === result.length - 1) {
              break;
            }
            whereSQL += ' OR ';
          }
        }

        // 沒有追蹤使用者,直接回傳空資料
        if (whereSQL === "") {
          res.send({
            'ok': true,
            'data': {
              'articles': [],
              'nextPage': null
            }
          })
        }
        else {
          conn.query(`SELECT count(*) as dataLen FROM articles AS articleAndUsersAndLike WHERE ${whereSQL}`, (err, result) => {
            console.log(`SELECT count(*) as dataLen FROM articles AS articleAndUsersAndLike WHERE ${whereSQL}`)
            if (result.length > 0) {
              dataLen = result[0].dataLen;
              sql = `SELECT articleAndUsersAndLike.* , IFNULL(COUNT(comments.article_id), 0) as commentQty FROM
                    (
                      SELECT
    
                        articles.article_id, articles.coverPhoto, articles.title, articles.summary, articles.price, articles.content,
                        CONVERT_TZ(articles.create_time, '+00:00', '+08:00') as create_time,
                        CONVERT_TZ(articles.update_time, '+00:00', '+08:00') as update_time,
                        users.user_id, users.username, users.avatar , 
                        IFNULL(COUNT(article_likes.article_id), 0) as likeQty,
                        GROUP_CONCAT(IF(article_likes.user_id = ${req.session.user ? req.session.user.user_id : null}, 'yes', '') SEPARATOR '' ) AS user_is_liked
                   
                      FROM articles
                      INNER JOIN users
                      ON articles.user_id = users.user_id
                      LEFT JOIN article_likes
                      ON articles.article_id = article_likes.article_id
                      GROUP BY articles.article_id
                      ORDER BY articles.create_time DESC
                      ) as articleAndUsersAndLike
    
                    LEFT JOIN comments
                    ON articleAndUsersAndLike.article_id = comments.article_id
                    WHERE ${whereSQL}
                    GROUP BY articleAndUsersAndLike.article_id
                    ORDER BY articleAndUsersAndLike.create_time DESC
                    LIMIT ${page * 6}, 6`
              conn.query(sql, (err, result) => {
                if (err) {
                  res.send({
                    'error': true,
                    'message': '無法取得文章列表'
                  })
                  return;
                }
                else {
                  let responseData = [];

                  result.forEach(item => {
                    responseData.push({
                      'article_id': item.article_id,
                      'title': item.title,
                      'content': item.content,
                      'coverPhoto': item.coverPhoto,
                      'create_time': item.create_time,
                      'update_time': item.update_time,
                      'likeQty': item.likeQty,
                      'commentQty': item.commentQty,
                      'user_is_liked': item.user_is_liked,
                      'summary': item.summary,
                      'author': {
                        'user_id': item.user_id,
                        'username': item.username,
                        'avatar': item.avatar
                      }
                    })
                  })
                  res.send({
                    'ok': true,
                    'data': {
                      'articles': responseData,
                      'nextPage': (dataLen - ((page + 1) * 6)) > 0 ? parseInt(page) + 1 : null
                    }
                  })
                }
              })
            }

          })
        }

      })
      pool.releaseConnection(conn);

    })

  }
  else {
    // 取得資料長度 並用dataLen紀錄
    pool.getConnection((err, conn) => {
      conn.query(`SELECT count(*) as dataLen FROM articles ORDER BY create_time DESC`, (err, result) => {
        dataLen = result[0].dataLen;

        sql = `SELECT articleAndUsersAndLike.* , IFNULL(COUNT(comments.article_id), 0) as commentQty FROM
            (
            SELECT 

              articles.article_id, articles.coverPhoto, articles.title, articles.summary, articles.price, articles.content,
              CONVERT_TZ(articles.create_time, '+00:00', '+08:00') as create_time,
              CONVERT_TZ(articles.update_time, '+00:00', '+08:00') as update_time,
              users.user_id, users.username, users.avatar , 
              IFNULL(COUNT(article_likes.article_id), 0) as likeQty,
              GROUP_CONCAT(IF(article_likes.user_id = ${req.session.user ? req.session.user.user_id : null}, 'yes', '') SEPARATOR '' ) AS user_is_liked
              
              FROM articles
              INNER JOIN users
              ON articles.user_id = users.user_id
              LEFT JOIN article_likes
              ON articles.article_id = article_likes.article_id
              GROUP BY articles.article_id
              ORDER BY articles.create_time DESC
              LIMIT ${page * 6}, 6 
              ) as articleAndUsersAndLike

            LEFT JOIN comments
            ON articleAndUsersAndLike.article_id = comments.article_id
            GROUP BY articleAndUsersAndLike.article_id
            ORDER BY articleAndUsersAndLike.create_time DESC`

        conn.query(sql, (err, result) => {

          if (err) {
            res.send({
              'error': true,
              'message': '無法取得文章列表'
            })
            return;
          }
          else {
            let responseData = [];

            result.forEach(item => {
              responseData.push({
                'article_id': item.article_id,
                'title': item.title,
                'content': item.content,
                'coverPhoto': item.coverPhoto,
                'create_time': item.create_time,
                'update_time': item.update_time,
                'likeQty': item.likeQty,
                'commentQty': item.commentQty,
                'summary': item.summary,
                'user_is_liked': item.user_is_liked,
                'author': {
                  'user_id': item.user_id,
                  'username': item.username,
                  'avatar': item.avatar
                }
              })
            })
            res.send({
              'ok': true,
              'data': {
                'articles': responseData,
                'nextPage': (dataLen - ((page + 1) * 6)) > 0 ? parseInt(page) + 1 : null
              }
            })
          }
        })
      })

      pool.releaseConnection(conn);
    })


  }
})



// 取得單筆文章 querystring
router.get('/api/article/:articleid', function (req, res) {
  let articleId = req.params.articleid;

  pool.getConnection((err, conn) => {

    // 假如登入狀態下 取得文章資料 順便帶上 該使用者是否按過讚
    if (req.session.user) {
      sql = `SELECT 

                arts.article_id, arts.coverPhoto, arts.title, arts.summary, arts.price, arts.content,
                CONVERT_TZ(arts.create_time, '+00:00', '+08:00') as create_time,
                CONVERT_TZ(arts.update_time, '+00:00', '+08:00') as update_time,
                users.user_id, users.avatar, users.username,
                IFNULL(count(art_likes.article_id), 0) as likeQty, -- arts.*,
                GROUP_CONCAT(IF(art_likes.user_id = ${req.session.user.user_id}, 'yes', '') SEPARATOR '' ) as user_is_liked
              
                FROM articles as arts
                INNER JOIN users
                ON arts.user_id = users.user_id
                LEFT JOIN article_likes as art_likes
                ON arts.article_id = art_likes.article_id
                WHERE arts.article_id = ${articleId}
                GROUP BY arts.article_id`
    }
    else {
      sql = `SELECT 

            arts.article_id, arts.coverPhoto, arts.title, arts.summary, arts.price, arts.content,
            CONVERT_TZ(arts.create_time, '+00:00', '+08:00') as create_time,
            CONVERT_TZ(arts.update_time, '+00:00', '+08:00') as update_time,
            users.user_id, users.avatar, users.username,
            IFNULL(count(art_likes.article_id), 0) as likeQty
            

            FROM articles as arts
            INNER JOIN users
            ON arts.user_id = users.user_id
            LEFT JOIN article_likes as art_likes
            ON arts.article_id = art_likes.article_id
            WHERE arts.article_id = ${articleId}
            GROUP BY arts.article_id
      `
    }

    conn.query(sql, function (err, result) {
      if (err) {
        res.send({
          'error': true,
          'message': '取得文章失敗~'
        })
        return;
      }

      if (result.length > 0) {

        let getTagsSQL = `SELECT tags.tag, tags.tag_id
                          FROM article_tags
                          INNER JOIN tags
                          ON article_tags.tag_id = tags.tag_id 
                          WHERE  article_id = ${articleId}`
        let artTags = [];
        conn.query(getTagsSQL, (err, tags) => {
          // if (tags.length > 0) {
          //   artTags = tags[0].tags.split(',');
          // }

  
          res.send({
            'ok': true,
            'data': {
              'article': {
                'article_id': result[0].article_id,
                'summary': result[0].summary,
                'price': result[0].price,
                'title': result[0].title,
                'content': result[0].content,
                'coverPhoto': result[0].coverPhoto,
                'create_time': result[0].create_time,
                'update_time': result[0].update_time,
                'likeQty': result[0].likeQty,
                'user_is_liked': result[0].user_is_liked,
                'author': {
                  'user_id': result[0].user_id,
                  'username': result[0].username,
                  'avatar': result[0].avatar
                },
                'tags':tags
              },
            }
          });

        })
        
      }
      else {
        res.send({
          'error': true,
          'message': '找不到此篇文章~'
        })
      }

    })

    pool.releaseConnection(conn);
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


// 取得首頁文章
router.get('/api/index', function (req, res) {

  pool.getConnection((err, conn) => {


    let sql = `SELECT * FROM articles ORDER BY create_time DESC  LIMIT 3`
    let responseData = {}
    // 取得最新文章
    conn.query(sql, (err, result) => {
      responseData.newestArticles = result;

      sql = `SELECT articles.*, IFNULL(count(article_likes.article_id), 0) AS likeQty 
             FROM articles
                  LEFT JOIN article_likes
                  ON articles.article_id = article_likes.article_id
                  WHERE date_add(current_timestamp, INTERVAL -7 day) < articles.create_time
                  GROUP BY articles.article_id
                  ORDER BY likeQty DESC
                  LIMIT 3
                  `
      // 一周內like最多的文章 如果like相同則以發布時間為先
      conn.query(sql, (err, result) => {
        responseData.popularArticles = result;


        // 一周內comment最多的文章 如果like相同則以發布時間為先
        sql = `SELECT articles.*, IFNULL(count(comments.article_id), 0) AS commentQty
               FROM articles
                LEFT JOIN comments
                ON articles.article_id = comments.article_id
                WHERE date_add(current_timestamp, INTERVAL -7 day) < articles.create_time
                GROUP BY articles.article_id
                ORDER BY commentQty DESC
                LIMIT 3`

        conn.query(sql, (err, result) => {
          responseData.discussionArticles = result;

          res.send({
            'ok': true,
            'data': responseData
          })
        })
      })
    })

    pool.releaseConnection(conn)
  })

})


module.exports = router



