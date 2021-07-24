const express = require('express');
const router  = express.Router();
const {pool}  = require('../mysql');

router.use(express.json());


// 檢查使用者有無追蹤當下會員
router.get('/api/follow/:followId', function(req, res){
    console.log('in get follow api');

    if(req.session.user){
        pool.getConnection((err, conn) => {
            if(err){
                res.send({
                    'error':true,
                    'message':'資料庫發生錯誤~'
                })
                return;
            }

            let followId = req.params.followId;
            let sql = `SELECT * FROM follows WHERE user_id = ${req.session.user.user_id} AND follow = ${followId}`
            
            conn.query(sql, (err, result)=>{
                if(result.length>0){
                    res.send({
                        'ok':true,
                        'data':{
                            'isFollowed':true
                        }
                    })
                }
                else{
                    res.send({
                        'ok':true,
                        'data':{
                            'isFollowed':false
                        }
                    })
                }
            })
            pool.releaseConnection(conn);
        })
    }
    else{
        res.send({
            'ok':true,
            'data':{
                'isFollowed':false
            }
        })
    }
})

router.post('/api/follow', function(req, res){
    console.log('in follow api');

    if(req.session.user){
        pool.getConnection((err, conn) => {
            if(err){
                res.send({
                    'error':true,
                    'message':'資料庫發生錯誤~'
                })
                return;
            }
            let followId = req.body.follow_id;

            let sql = `SELECT * FROM follows
                       WHERE user_id = ${req.session.user.user_id} AND follow = ${followId}`

            console.log(sql);
            conn.query(sql, (err, result) => {
                // 長度>0 取消追蹤
                if(result.length>0){
                    sql = `DELETE FROM follows WHERE id = ${result[0].id}`;
                }
                // 長度=0 新增追蹤
                else{
                    sql = `INSERT INTO follows set
                            user_id = ${req.session.user.user_id},
                            follow  = ${followId}`;
                }
                conn.query(sql, (err, result)=>{
                    if(err){
                        res.send({
                            'error':true,
                            'message':'追蹤功能執行錯誤'
                        })
                        return;
                    }

                    res.send({
                        'ok':true,
                        'message':'追蹤功能執行正常'
                    })
                })
            })

            pool.releaseConnection(conn);
        })
    }
    else{
        res.send({
            'error':true,
            'message':'登入後才能追蹤使用者~'
        })
    }
})



module.exports = router;