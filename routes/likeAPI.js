const express = require('express');
const { pool } = require('../mysql');
const router = express.Router();

router.use(express.json());

// 按文章讚api
// 要按讚須帶入userId, articleId
router.post('/api/like', function (req, res) {
    if (req.session.user) {
        let articleId = req.body.article_id;
        pool.getConnection(function (err, conn) {
            conn.query(`SELECT like_id FROM article_likes WHERE article_id = ${articleId} AND  user_id = ${req.session.user.user_id}`, function (err, rows) {
                if (err) {
                    res.send({
                        'error': true,
                        'message': '按讚失敗'
                    })
                }
                else {
                    // 利用query回傳的rows判斷使用者是否按過該文章讚 
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

// 要帶入articleId 取得文章按讚資訊
router.get('/api/like', function (req, res) {
    let articleId = req.query.articleid;
    pool.getConnection(function (err, conn) {
        let sql = `SELECT articles.article_id,
                IFNULL(count(article_likes.article_id), 0) as likeQty, 
                GROUP_CONCAT(IF(article_likes.user_id = ${req.session.user ? req.session.user.user_id : null}, 'yes', '') SEPARATOR '') AS user_is_liked 

                FROM articles
                LEFT JOIN article_likes
                ON articles.article_id = article_likes.article_id
                WHERE articles.article_id = ${articleId}
                GROUP BY articles.article_id`

        console.log(sql);
        conn.query(sql, function (err, result) {
            if (err) {
                res.send({
                    'error': true,
                    'message': '取得資料失敗'
                })
            }
            else {
                res.send({
                    'ok': true,
                    data:result
                });
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
                if (err) {
                    res.send({
                        'error': true,
                        'message': '按讚失敗'
                    })
                }
                else {
                    // 利用query回傳的rows判斷使用者是否按過該文章讚 
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


module.exports = router