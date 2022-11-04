// require('dotenv').config()
const AWS = require("aws-sdk")

// const region = process.env.AWS_REGION;
const region = "ap-southeast-2"
const bucketName = "cab432-a2-n9748792";

// AWS.config.getCredentials((err) => {
//     if (err) console.log(err.stack);
//     else {
//         // console.log("get Credentials Success")
//         // console.log("Access key:", AWS.config.credentials.accessKeyId);
//         // console.log("Secret access key:", AWS.config.credentials.secretAccessKey)
//     }
// })

const s3 = new AWS.S3({apiVersion: '2006-03-01', region: region});

const putObject = async (key, body, contentType) => {
    console.log(`Uploading image to ${bucketName}/${key}`)

    const params = {Bucket: bucketName, 
                    Key: key, 
                    Body: body, 
                    ContentType: contentType};

    const res = await s3.putObject(params)
        .promise()
        .catch((err) => {
            console.log(`${err.code}: ${key}`)
            throw { statusCode: err.statusCode, error: err.code}
        });
    
    console.log(`Successfully uploaded image to ${bucketName}/${key}`)
    
    return res;
}

const getObject = async (key) => {
    console.log(`Getting image from ${bucketName}/${key}`)

    const params = {Bucket: bucketName, Key: key};

    const result = await s3.getObject(params)
        .promise()
        .catch((err) => {
            console.log(`${err.code}: ${key}`)
            throw { statusCode: err.statusCode, error: err.code}
        })

    console.log(`Successfully retrieved image`)

    return result;
}

const getDownloadURL = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60*60,
        ResponseContentType: 'binary/octet-stream' 
    }
    const result = await s3.getSignedUrlPromise('getObject', params)
        .catch((err) => {
            console.log(`${err.code}: ${key}`)
            throw { statusCode: err.statusCode, error: err.code}
        });
    return result;
}

const getUploadURL = async (key, contentType) => {
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60*60,
        ContentType: contentType
    }
    const result = await s3.getSignedUrlPromise('putObject', params)
        .catch((err) => {
            console.log(`${err.code}: ${key}`)
            throw { statusCode: err.statusCode, error: err.code}
        });
    return result;
}

module.exports = { putObject, getObject, getDownloadURL, getUploadURL };
