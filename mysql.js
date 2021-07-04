let mysql = require("mysql2");
require('dotenv').config();



// let connector = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"122090513"
// })

// connector.connect(function(err){
//     if (err) throw err;
//     console.log("Connected!");

//     connector.query(sql, function (err, result) {
//         if (err) throw err;
//         console.log("Result: " + result);
//       });
    
    
// });


const pool = mysql.createPool({
    host: process.env["MYSQL_HOST"],
    user: process.env["MYSQL_USER"],
    password: process.env["MYSQL_PASSWORD"],
    database: process.env["MYSQL_DATABASE"],
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  module.exports.pool = pool

// module.exports.connectPool = function(){
//     // For pool initialization, see above
//     pool.getConnection(function(err, conn) {
//         // Do something with the connection
//         conn.query(/* ... */);
//         // Don't forget to release the connection when finished!
//         pool.releaseConnection(conn);
//     })
// }
  

// pool.getConnection(function(err, conn) {
//     console.log('connectPool')
// })
