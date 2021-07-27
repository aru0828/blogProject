
require('dotenv').config();
const AWS = require("aws-sdk");
const fs = require('fs');


let s3 = new AWS.S3({
  region:process.env["S3_REGION"],
  accessKeyId: process.env["S3_ACCESSKEYID"],
  secretAccessKey: process.env["S3_SECRETACCESSKEY"]
});

module.exports.uploadToS3 = function(file){
  
  // Configure the file stream and obtain the upload parameters
  let fileStream = fs.createReadStream(file.path);

  let uploadParams = {
    Bucket: process.env["S3_BUCKETNAME"],
    Body: fileStream,
    Key: file.filename,
    ContentType : file.mimetype, //<-- this is what you need!,
    // 設定權限
    ACL:'public-read'
  };
  // call S3 to retrieve upload file to specified bucket

  return s3.upload(uploadParams).promise()

  
  // s3.upload (uploadParams, function (err, data) {
  //   if (err) {
  //     console.log("Error", err);
  //   } if (data) {
  //     // 上傳成功回傳網址
  //     return data.Location
  //   }
  // })
}



  