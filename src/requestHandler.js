const axios = require('axios');
const crypto = require('crypto');
const { putObject, getObject, getDownloadURL } = require('./services/s3Service')

const localURL = 'http://127.0.0.1:3001/';
const instanceURL = 'http://3.26.240.125:3000';
const lbURL = 'http://n9748792-n10658327-A2-LB-842639760.ap-southeast-2.elb.amazonaws.com';

const handleRequest = async (images, resize, compression) => {
    const result = await Promise.all(images.map(async ({originalname, buffer, mimetype}) => {
        
        const checksum = generateChecksum(buffer);

        const extension = originalname.split(".")[1];

        const key = `${checksum}.${extension}`;

        const processedKey = `${checksum}-x${resize}-${compression}.${extension}`;

        // CHECK REDIS

        let url = await checkExistingProcessedImageS3(processedKey)

        if (url) {
            console.log(`Found ${processedKey} in S3`)
            return {key: processedKey, url: url}
        }

        return await sendImageForResizing(key, buffer, mimetype, resize, compression);
    }))
    return result;
}

const generateChecksum = (str) => {
    return crypto
        .createHash('sha256')
        .update(str)
        .digest('hex');
}

const checkExistingProcessedImageS3 = async (key) => {
    try{
        console.log(`Checking for ${key} in S3`)

        await getObject(key);

        const url = await getDownloadURL(key);

        return url;
    }
    catch (error) {
        return null;
    }
}

const sendImageForResizing = async (key, buffer, mimetype, resize, compression) => {

    await putObject(key, buffer, mimetype);
    
    try {
        console.log ("Sending Image for Processing")

        const body = {
            key: key,
            resize: +resize,
            compression: +compression
        }

        const result = await axios.post(localURL, body);

        console.log(`${key} has been processed`)

        return result.data;
    }
    catch (error) {
        throw { statusCode: error.response.status, error: error.response.data.error}
    }
}

module.exports = { handleRequest };