const axios = require('axios');
const crypto = require('crypto');
const JSZip = require('jszip');
const { processImage } = require('./processImage')
const { putObject, getObject, getDownloadURL } = require('./services/s3Service')
const { getURLRedis, storeURLRedis } = require('./services/redisService')

const handleRequest = async (images, resize, compression) => {

    const zip = new JSZip();

    const result = await Promise.all(images.map(async (key) => {

        const {Body, ContentType} = await getObject(key);

        const checksum = generateChecksum(Body);

        const extension = key.split(".")[1];

        const processedKey = `${checksum}-x${resize}-${compression}.${extension}`;

        const url = await getURLRedis(processedKey)

        if(url)
        {
            console.log(`Found ${processedKey} in redis`)
            const { data } = await axios.get(url, { responseType: 'arraybuffer'});
            zip.file(processedKey, data)
            return {key: processedKey, url: url}
        }

        const data = await checkExistingProcessedImageS3(processedKey)

        if (data.url) {
            console.log(`Found ${processedKey} in S3`)
            storeURLRedis(processedKey, data.url);
            zip.file(processedKey, data.imageBuffer)
            return {key: processedKey, url: url}
        }

        const processedData = await processImage(key, +resize, +compression, Body, ContentType)

        storeURLRedis(processedKey, processedData.url);
        zip.file(processedKey, processedData.imageBuffer)

        return processedData;
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

        const imageBuffer = await getObject(key);

        const url = await getDownloadURL(key);

        return {url, imageBuffer};
    }
    catch (error) {
        return null;
    }
}

module.exports = { handleRequest };