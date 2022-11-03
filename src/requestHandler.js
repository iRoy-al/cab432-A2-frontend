const axios = require('axios');
const crypto = require('crypto');
const JSZip = require('jszip');
const { putObject, getObject, getDownloadURL } = require('./services/s3Service')
const { getURLRedis, storeURLRedis } = require('./services/redisService')

const localURL = 'http://127.0.0.1:3001/';
const instanceURL = 'http://3.26.240.125:3000';
const lbURL = 'http://n9748792-n10658327-A2-LB-842639760.ap-southeast-2.elb.amazonaws.com';

const handleRequest = async (images, resize, compression) => {
    const result = await Promise.all(images.map(async ({originalname, buffer, mimetype}) => {
        
        const checksum = generateChecksum(buffer);

        const extension = originalname.split(".")[1];

        const key = `${checksum}.${extension}`;

        const processedKey = `${checksum}-x${resize}-${compression}.${extension}`;

        let url = await getURLRedis(processedKey)

        if(url)
        {
            console.log(`Found ${processedKey} in redis`)
            return {key: processedKey, url: url}
        }

        url = await checkExistingProcessedImageS3(processedKey)

        if (url) {
            console.log(`Found ${processedKey} in S3`)
            storeURLRedis(processedKey, url);
            return {key: processedKey, url: url}
        }

        const processedData = await sendImageForResizing(key, buffer, mimetype, resize, compression)

        storeURLRedis(processedKey, processedData.url);

        return processedData;
    }))

    return await zipImagesAndUpload(result);
}

const zipImagesAndUpload = async (result) => {
    const zip = new JSZip();

    await Promise.all(result.map(async ({key, url}) => {
        const imgBuffer = await axios.get(url, { responseType: 'arraybuffer'});
        zip.file(key, imgBuffer.data)
    }))

    const zipBuffer = await zip.generateAsync({type:'nodebuffer'})

    const key = `${generateChecksum(zipBuffer)}.zip`;

    await putObject(key, zipBuffer, 'application/zip');

    return await getDownloadURL(key);
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