const express = require('express');
const router  = express.Router();
const {pool}  = require('../mysql');
// const { response } = require('express');
router.use(express.json());



router.get('/api/member/:userid', function(req, res){
    
    console.log(req.params.userid);
    let userId = req.params.userid;
    pool.getConnection((err, conn) => {
        let sql = `select user_id, username, description, avatar, (select count(*) from articles WHERE user_id = ${userId}) as postNum
                     from users
                     WHERE user_id = ${userId}`
        let resObj = {};
        conn.query(sql, function(err, result){
            resObj.user = result[0];

            sql = `SELECT * FROM articles WHERE user_id = 1`
            conn.query(sql, function(err, result){
                resObj.articles = result;
            

                res.send({
                    'ok':true,
                    'data':resObj
                })
            })

            
        })
        pool.releaseConnection(conn)
    })

   

    
})


module.exports = router;