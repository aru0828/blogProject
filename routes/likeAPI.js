const express = require('express');
const { pool } = require('../mysql');
const router = express.Router();

router.use(express.json());

// 按文章讚api
// 要按讚須帶入userId, articleId
router.post('/api/like', function (req, res) {
    if (req.session.user) {
        let articleId = req.body.articleId;
        pool.getConnection(function (err, conn) {
            conn.query(`SELECT like_id FROM article_likes WHERE article_id = ${articleId} AND  user_id = ${req.session.user.user_id}`, function (err, rows) {
                // if (err) { throw err; }

                if (err) {
                    res.send({
                        'error': true,
                        'message': '按讚失敗'
                    })
                }
                else {
                    // 利用query回傳的rows判斷使用者是否按過該文章讚 
                    console.log(rows)
                    let liked = rows.length ? rows[0].like_id : null;

                    // 根據liked決定要移除or新增讚
                    if (liked) {
                        conn.query(`DELETE FROM article_likes WHERE like_id = ${liked};`)
                    }
                    else {
                        conn.query(`INSERT INTO article_likes SET  
                            article_id = ${articleId},
                            user_id = ${req.session.user.user_id}`)
                    }
                    res.send({
                        'ok': true
                    });
                }
            })
            pool.releaseConnection(conn);
        })
    }
    // 未登入
    else {
        res.send({
            'error': true,
            'message': '請先登入才能使用會員功能'
        });
    }
})


// 取得單篇文章的讚
router.get('/api/like/:articleid', function(req, res){
    
    
    let articleId = req.params.articleid;
    pool.getConnection((err, conn) => {

        let sql = `select likes.article_id, users.user_id from article_likes as likes
                    INNER JOIN users
                    ON likes.user_id = users.user_id
                    WHERE article_id = ${articleId}`
        conn.query(sql, (err, result) => {
            if(err){
                res.send({
                    'error':true,
                    'message':'取得文章按讚資訊失敗'
                })
            }
            else{
                res.send({
                    'ok':true,
                    'data':result,
                    'message':'取得文章按讚資訊'
                })
            }
        })

        pool.releaseConnection(conn);
    })
    
})




// 按留言讚api
// 要按讚須帶入userId, articleId
router.post('/api/commentlike', function (req, res) {
    if (req.session.user) {
        let commentId = req.body.comment_id;

        pool.getConnection(function (err, conn) {
            conn.query(`SELECT id FROM comment_likes WHERE comment_id = ${commentId} AND  user_id = ${req.session.user.user_id}`, function (err, rows) {
                // if (err) { throw err; }

                if (err) {
                    res.send({
                        'error': true,
                        'message': '按讚失敗'
                    })
                }
                else {
                    // 利用query回傳的rows判斷使用者是否按過該文章讚 
                    console.log(rows)
                    let liked = rows.length ? rows[0].id : null;

                    // 根據liked決定要移除or新增讚
                    if (liked) {
                        conn.query(`DELETE FROM comment_likes WHERE id = ${liked};`)
                    }
                    else {
                        conn.query(`INSERT INTO comment_likes SET  
                            comment_id = ${commentId},
                            user_id = ${req.session.user.user_id}`)
                    }
                    res.send({
                        'ok': true
                    });
                }
            })
            pool.releaseConnection(conn);
        })
    }
    // 未登入
    else {
        res.send({
            'error': true,
            'message': '請先登入才能使用會員功能'
        });
    }
})

// 取得該篇文章下的留言按讚資訊
router.get('/api/commentlike', function (req, res) {
   
        // let commentId = req.body.comment_id;

        pool.getConnection(function (err, conn) {
            let sql ='';

            // 登入情況下 多select一個當前使用者是否按過讚
            if(req.session.user){
                sql = `SELECT comments.comment_id, IFNULL(count(comment_likes.comment_id), 0) as likeQty, IF(comment_likes.user_id = ${req.session.user.user_id}, 'yes', 'no') as user_is_liked  FROM comments
                        LEFT JOIN comment_likes
                        ON comments.comment_id = comment_likes.comment_id
                        WHERE comments.article_id = 21
                        GROUP BY comments.comment_id`
                console.log(sql)
            }
            else{
                sql = `SELECT comments.comment_id, IFNULL(count(comment_likes.comment_id), 0) as likeQty FROM comments
                        LEFT JOIN comment_likes
                        ON comments.comment_id = comment_likes.comment_id
                        WHERE comments.article_id = 21
                        GROUP BY comments.comment_id`
            }
            

            
            conn.query(sql, function (err, result) {
                // if (err) { throw err; }
                
                if (err) {
                    res.send({
                        'error': true,
                        'message': '取得留言按讚資料失敗'
                    })
                }
                else {
                    res.send({
                        'ok': true,
                        'data':result
                    });
                }
            })
            pool.releaseConnection(conn);
        })
    
})

module.exports = router