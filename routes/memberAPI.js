const express = require('express');
const router = express.Router();
const { pool } = require('../mysql');
const multer = require('multer');
const { uploadToS3 } = require('../AWS');
const upload = multer({ dest: 'uploads/' })

router.use(express.json());


// 會員頁
router.get('/api/member/:userid', function (req, res) {
    let userId = req.params.userid;
    pool.getConnection((err, conn) => {

        let responseData = {};
        // 取得會員檔案
        let sql = `SELECT username, avatar, description, IFNULL(count(follows.follow), 0) as followQty
                    FROM users 
                    LEFT JOIN follows
                    ON users.user_id = follows.follow
                    WHERE users.user_id = ${userId}
                    GROUP BY follow`

        conn.query(sql, (err, result) => {
            if(result.length === 0){
                res.send({
                    'error':true,
                    'message':'此會員不存在'
                })
                return;
            }
            responseData.memberData = result[0];

            // 取得會員文章以及讚數留言數
            sql = `SELECT 
                    memberPostsAndLikes.article_id,
                    memberPostsAndLikes.coverPhoto,
                    memberPostsAndLikes.likeQty,
                    IFNULL(count(comments.article_id), 0) as commentQty
                    FROM(
                    SELECT  
                        articles.*,
                        users.username,
                        users.description,
                        IFNULL(count(article_likes.article_id), 0) as likeQty
                    FROM users
                    INNER JOIN articles
                    ON users.user_id = articles.user_id
                    LEFT JOIN article_likes
                    ON articles.article_id = article_likes.article_id
                    WHERE users.user_id = ${userId}
                    GROUP BY articles.article_id) AS memberPostsAndLikes
                    LEFT JOIN comments
                    ON memberPostsAndLikes.article_id = comments.article_id
                    GROUP BY memberPostsAndLikes.article_id
                    ORDER BY memberPostsAndLikes.create_time DESC`

            conn.query(sql, function (err, result) {
                if (err) {
                    res.send({
                        'error': true,
                        'message': '伺服器錯誤'
                    })
                    return;
                }
                responseData.articles = result
                res.send({
                    'ok': true,
                    'data': responseData
                })
               
                
            })
        })

        pool.releaseConnection(conn)
    })
})


//編輯會員資料
router.post('/api/member', upload.single('newAvatar'), (req, res) => {

    if (req.session.user) {
        pool.getConnection(async (err, conn) => {

            let username = req.body.username;
            let description = req.body.story;
            let newAvatar = req.file;
            let sql = '';

            // 假如用戶有更新大頭貼照
            if (newAvatar) {
                let S3Url = await uploadToS3(newAvatar);
                S3Url = S3Url.Location;
                sql = `UPDATE users set
                        username = '${username}',
                        description = '${description}',
                        avatar = '${S3Url}'
                        WHERE user_id = ${req.session.user.user_id}`
            } else {
                sql = `UPDATE users set
                        username = '${username}',
                        description = '${description}'
                        WHERE user_id = ${req.session.user.user_id}`
            }

            conn.query(sql, (err, result) => {
                if (err) {
                    res.send({
                        'error': true,
                        'message': '編輯個人資料錯誤'
                    })
                    return;
                }
                // 修改資料完重新取得使用者資料並寫入session
                sql = `SELECT user_id, email,  description, username, avatar FROM users
                        WHERE user_id = ${req.session.user.user_id};`
                conn.query(sql, (err, result) => {
                    if(err){
                        res.send({
                            'error': true,
                            'message': '取得個人資料失敗'
                        })
                        return;
                    }
                    req.session.user = result[0];
                    res.send({
                        'ok': true,
                        'message': '編輯個人資料成功'
                    })
                })

            })
            pool.releaseConnection(conn);
        })
    }
    else {
        res.send({
            'error': true,
            'message': '未登入無法使用此功能'
        })
    }
})

module.exports = router;