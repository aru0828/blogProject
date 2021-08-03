const express = require('express');
const router = express.Router();
const { pool } = require('../mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();

// 加上這行才能讀取json
router.use(express.json());

// 檢查登入狀況
router.get('/api/user', (req, res) => {

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
})

// 註冊
router.post('/api/user', (req, res) => {

    let source = req.body.source;
    let email = req.body.email;
    let emailRule = /^\S+@\S+\.\S+$/;
    let password = req.body.password;
    let name = req.body.name;
    // 基本驗證
    if (!emailRule.test(email)) {
        res.send({
            'error': true,
            'message': '信箱格式不正確'
        })
        return;
    }
    else if (password.length < 6) {
        res.send({
            'error': true,
            'message': '密碼長度不得小於6個字元'
        })
        return;
    }
    else if (name.length < 1) {
        res.send({
            'error': true,
            'message': '請輸入使用者名稱'
        })
        return;
    }
    // 通過後端驗證 執行註冊
    else {
        // 本地註冊
        if (source === 'local') {

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
    }

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
                            'avatar': result[0].avatar,
                            'description': result[0].description
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
        }
        pool.releaseConnection(conn);
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


function thirdPartyLogin() {
    let sql = `SELECT * FROM users WHERE email = '${email}' AND source = '${source}'`;
    conn.query(sql, (err, result) => {

        //驗證通過儲存SESSION並response
        if (result.length > 0) {
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
                'message': '登入失敗'
            })
        }
    })

}

module.exports = router;

