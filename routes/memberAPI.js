const express = require('express');
const router = express.Router();
const { pool } = require('../mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const fetch = require('node-fetch');
const { request } = require('express');
require('dotenv').config();



router.use(session({
    secret: 'keyboard cat'
}))

// 加上這行才能讀取json
router.use(express.json());

// 檢查登入狀況
router.get('/api/user', (req, res) => {
    console.log('check')
    console.log(req.session.user)
    // console.log(req.session.user)
    if (req.session.user) {
        res.send({
            'data': req.session.user,
            'message': '登入中'
        })
    }
    else {
        res.send({
            'data': null,
            'message': '未登入'
        })
    }

    // pool.getConnection((err, conn) => {
    //     let sql =`select * from users
    //               WHERE user_id = 1;`
    //               console.log(sql)
    //     conn.query(sql, (err, result) => {
    //         console.log(result)
    //     })


    //     pool.releaseConnection(conn);
    // })
})

// 註冊
router.post('/api/user', (req, res) => {

    let source = req.body.source;


    // 本地註冊
    if (source === 'local') {
        let email = req.body.email;
        let password = req.body.password;
        let name = req.body.name;
        // bcrypt加密
        const hash = bcrypt.hashSync(password, saltRounds);

        pool.getConnection((err, conn) => {

            // 檢查相同source下的email是否註冊過
            let sql = `select * from users
                        WHERE email = '${email}' AND source = '${source}'`
            conn.query(sql, (err, result) => {
                if (result.length > 0) {
                    
                    res.send({
                        'error': true,
                        'message': '此帳號已經註冊過'
                    })
                }
                else {
                    sql = `INSERT INTO users set
                            email = '${email}',
                            password = '${hash}',
                            username = '${name}',
                            source = '${source}'`
                 
                    conn.query(sql, (err, result) => {
                        if (result) {
                            res.send({
                                'ok': true,
                                'message': '註冊成功'
                            })
                        }
                        else {
                            res.send({
                                'error': true,
                                'message': '註冊失敗，請重新嘗試'
                            })
                        }
                    })
                }
            })
            pool.releaseConnection(conn);
        })
    }
    // 第三方註冊
    else {
        let email = req.body.email;
        let name = req.body.name;
        let avatar = req.body.avatar;
        pool.getConnection((err, conn) => {
            // 檢查相同source下的email是否註冊過
            let sql = `select * from users
                        WHERE email = '${email}' AND source = '${source}'`
            conn.query(sql, (err, result) => {
                
                // 已註冊 轉為執行登入
                if (result.length > 0) {
                    let requestData = {
                        'email': email,
                        'source': source
                    }

                  
                    fetch(`${process.env["SERVER_URL"]}/api/user`, {
                        'method': 'PATCH',
                        'body': JSON.stringify(requestData),
                        'headers': {
                            'content-type': 'application/json'
                        }
                    })
                        .then(response => response.json())
                        .then(result => {
                            console.log(result);
                        })
                }
                // 尚未註冊
                else {
                    sql = `INSERT INTO users set
                            email = '${email}',
                            username = '${name}',
                            avatar = '${avatar}',
                            source = '${source}'`
         
                    conn.query(sql, (err, result) => {
                        if (result) {
                            res.send({
                                'ok': true,
                                'message': '註冊成功'
                            })
                        }
                        else {
                            res.send({
                                'error': true,
                                'message': '註冊失敗，請重新嘗試'
                            })
                        }
                    })
                }
            })
            pool.releaseConnection(conn);
        })
    }


    // 範例

    // let email = req.body.email;
    // let password = req.body.password;
    // let name = req.body.name;
    // // bcrypt加密
    // const hash = bcrypt.hashSync(password, saltRounds);

    // pool.getConnection((err, conn) => {

    //     // 檢查相同source下的email是否註冊過
    //     let sql =`select * from users
    //                  WHERE email = '${email}' AND source = '${source}'`
    //     conn.query(sql, (err, result) => {
    //         if(result.length > 0){
    //             console.log('if')
    //             res.send({
    //                 'error':true,
    //                 'message':'此帳號已經註冊過'
    //             })
    //         }
    //         else{
    //             sql =`INSERT INTO users set
    //                     email = '${email}',
    //                     password = '${hash}',
    //                     username = '${name}',
    //                     source = '${source}'`
    //             console.log(sql)
    //             conn.query(sql, (err, result) => {
    //                 if(result){
    //                     res.send({
    //                         'ok':true,
    //                         'message':'註冊成功'
    //                     })
    //                 }
    //                 else{
    //                     res.send({
    //                         'error':true,
    //                         'message':'註冊失敗，請重新嘗試'
    //                     })
    //                 }
    //             })
    //         }
    //     })



    //     pool.releaseConnection(conn);
    // })
})
// 登入
router.patch('/api/user', (req, res) => {

    let email = req.body.email;
    let source = req.body.source;


    pool.getConnection((err, conn) => {

        if (source === 'local') {
            let sql = `SELECT * FROM users WHERE email = '${email}' AND source = '${source}'`
            let password = req.body.password;
            // 加入第三方後要多判斷source
            // 取出在資料庫中的加密後密碼 再利用使用者輸入的明碼進行比對
            conn.query(sql, (err, result) => {
                //明碼比對hash驗證結果 回傳boolean
                //驗證通過儲存SESSION並response
                if (result.length) {
                    if (bcrypt.compareSync(password, result[0].password)) {
                        req.session.user = {
                            'user_id': result[0].user_id,
                            'email': result[0].email,
                            'username': result[0].username,
                        };
                        
                        res.send({
                            'ok': true,
                            'message': '登入成功'
                        })
                    }
                    else {
                        res.send({
                            'error': true,
                            'message': '密碼輸入錯誤'
                        })
                    }
                }
                else {
                    res.send({
                        'error': true,
                        'message': '帳號或密碼輸入錯誤'
                    })
                }
            })
            pool.releaseConnection(conn);
        }
    })
        

    pool.getConnection((err, conn) => {
        if (source !== 'local') {
            let sql = `SELECT * FROM users WHERE email = '${email}' AND source = '${source}'`;

            conn.query(sql, (err, result) => {

                //驗證通過儲存SESSION並response
                if (result.length>0) {
                    req.session.user = {
                        'user_id': result[0].user_id,
                        'email': result[0].email,
                        'username': result[0].username,
                    };
                    console.log(req.session.user)

                    res.send({
                        'ok': true,
                        'message': '登入成功'
                    })
                }
                else {
                    res.send({
                        'error': true,
                        'message': '登入失敗'
                    })
                }
            })
            pool.releaseConnection(conn);
        }
        
    })
           
        
})
// 登出
router.delete('/api/user', (req, res) => {
    // 刪除單筆session
    // delete req.session.user;
    req.session.destroy();
    res.send({
        'ok': true,
        'message': '登出成功'
    })
})


function findOrCreate() {

    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let source = req.body.source;
    // bcrypt加密
    const hash = bcrypt.hashSync(password, saltRounds);

    pool.getConnection((err, conn) => {

        // 檢查相同source下的email是否註冊過
        let sql = `select * from users
                     WHERE email = '${email}' AND source = '${source}'`
        conn.query(sql, (err, result) => {
            if (result.length > 0) {
                console.log('if')
                res.send({
                    'error': true,
                    'message': '此帳號已經註冊過'
                })
            }
            else {
                sql = `INSERT INTO users set
                        email = '${email}',
                        password = '${hash}',
                        username = '${name}',
                        source = '${source}'`
                console.log(sql)
                conn.query(sql, (err, result) => {
                    if (result) {
                        res.send({
                            'ok': true,
                            'message': '註冊成功'
                        })
                    }
                    else {
                        res.send({
                            'error': true,
                            'message': '註冊失敗，請重新嘗試'
                        })
                    }
                })
            }
        })
        pool.releaseConnection(conn);
    })
}

module.exports = router;

