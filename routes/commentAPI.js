const express = require('express');
const router  = express.Router();
const {pool}  = require('../mysql');
const session = require('express-session');
router.use(express.json());


router.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))


//   利用articleid 取得文章留言
router.get('/api/comments/:articleid', function(req, res){
    let articleid = req.params.articleid;
    
    pool.getConnection((err, conn)=>{

        // let sql = `SELECT comments.* , users.username, users.avatar, users.user_id FROM comments 
        //         INNER JOIN users 
        //         ON comments.user_id = users.user_id
        //         WHERE comments.article_id = ${articleid} AND ISNULL(parent)
        //         ORDER BY comments.create_time ASC;`
        let sql ='';
        if(req.session.user){
            sql = `select CommentAndAuthor.*,  IFNULL(count(comment_likes.comment_id), 0) as likeQty , GROUP_CONCAT(IF(comment_likes.user_id = ${req.session.user.user_id}, 'yes', '') SEPARATOR  '' ) as user_is_liked from
                    (SELECT comments.* , users.username, users.avatar FROM comments 
                                    INNER JOIN users 
                                    ON comments.user_id = users.user_id
                                    WHERE comments.article_id = ${articleid} AND comments.parent IS NULL
                                    ORDER BY comments.create_time ASC) as CommentAndAuthor
                    LEFT JOIN comment_likes
                    ON CommentAndAuthor.comment_id = comment_likes.comment_id 
                    GROUP BY CommentAndAuthor.comment_id`
        }
        else{
            sql = `select CommentAndAuthor.*,  IFNULL(count(comment_likes.comment_id), 0) as likeQty  from
            (SELECT comments.* , users.username, users.avatar FROM comments 
                            INNER JOIN users 
                            ON comments.user_id = users.user_id
                            WHERE comments.article_id = ${articleid} AND comments.parent IS NULL
                            ORDER BY comments.create_time ASC) as CommentAndAuthor
            LEFT JOIN comment_likes
            ON CommentAndAuthor.comment_id = comment_likes.comment_id
            GROUP BY CommentAndAuthor.comment_id`
        }

        // if空陣列等於沒有留言
        conn.query(sql, (err, result) => {
            if(err){
                res.send({
                    'error':true,
                    'message':'取得留言資料失敗!'
                })
            }
            else{
                res.send({
                    'ok':true,
                    'data':result
                });
            }
           
        })

        pool.releaseConnection(conn);
    })
    
})

//   利用parentid 取得子層留言
router.get('/api/childcomments/:parentid', function(req, res){
    let parentid = req.params.parentid;
    // let sql = `SELECT comments.* , users.username, users.avatar, users.user_id FROM comments 
    //             INNER JOIN users 
    //             ON comments.user_id = users.user_id
    //             WHERE comments.comment_id = ${parentid} OR parent = ${parentid}
    //             ORDER BY comments.create_time ASC;`
    let sql = '';
    if(req.session.user){
        sql = `select CommentAndAuthor.*,  IFNULL(count(comment_likes.comment_id), 0) as likeQty , GROUP_CONCAT(IF(comment_likes.user_id = ${req.session.user.user_id}, 'yes', '') SEPARATOR  '' ) as user_is_liked from
                (SELECT comments.* , users.username, users.avatar,  users.user_id AS who_liked FROM comments 
                INNER JOIN users 
                ON comments.user_id = users.user_id
                WHERE comments.comment_id = ${parentid} OR parent = ${parentid}
                ORDER BY comments.create_time ASC) as CommentAndAuthor
                LEFT JOIN comment_likes
                ON CommentAndAuthor.comment_id = comment_likes.comment_id 
                GROUP BY CommentAndAuthor.comment_id`
    }
    else{
        sql = `select CommentAndAuthor.*,  IFNULL(count(comment_likes.comment_id), 0) as likeQty from
                (SELECT comments.* , users.username, users.avatar,  users.user_id AS who_liked FROM comments 
                INNER JOIN users 
                ON comments.user_id = users.user_id
                WHERE comments.comment_id = ${parentid} OR parent = ${parentid}
                ORDER BY comments.create_time ASC) as CommentAndAuthor
                LEFT JOIN comment_likes
                ON CommentAndAuthor.comment_id = comment_likes.comment_id 
                GROUP BY CommentAndAuthor.comment_id`
    }
    pool.getConnection((err, conn)=>{
        conn.query(sql, (err, result) => {
            if(err){
                res.send({
                    'error':true,
                    'message':'取得子層留言資料失敗!'
                })
            }
            else{
                res.send({
                    'ok':true,
                    'data':result
                })
            }
            
        })
        pool.releaseConnection(conn)
    })
})
 
 



// 新增評論
// 利用session判斷目前留言的人
router.post('/api/comment', function(req, res){
    
    let user = req.session.user;
    
    if(user){
        

        let comment = req.body.comment;
        let article_id = req.body.article_id;
        let parent = req.body.parent;
        let sql =`INSERT INTO comments set 
                    user_id = ${user.user_id},
                    article_id = ${article_id},
                    comment = '${comment}'`
        if(parent){
            sql = `INSERT INTO comments set 
                        user_id = ${user.user_id},
                        article_id = ${article_id},
                        parent = ${parent},
                        comment = '${comment}'`
        }
        
        pool.getConnection((err, conn) => {
           
            conn.query(sql, (err, result)=>{
                if(err){
                    res.send({
                        'error':true,
                        'message':'新增留言失敗!'
                    })
                }
                else{
                    res.send({
                        'ok':true,
                        'message':'留言成功'
                    })
                }
                
            })
            pool.releaseConnection(conn)
        })
        
    }
    else{
        res.send({
            'error':true,
            'message':'登入才能回覆'
        })
    }
    
})







module.exports = router