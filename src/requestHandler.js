const axios = require('axios');
const crypto = require('crypto');
const JSZip = require('jszip');
const { resizeImage } = require('./services/sharpService');
const { putObject, getObject, getDownloadURL } = require('./services/s3Service')
const { getURLRedis, storeURLRedis } = require('./services/redisService')

const validateRequest = (imageKey, resize, compression) => {

    console.log("Validating Request Body")

    console.log(`Key:${imageKey}, Resize: ${resize}, Compression: ${compression}`)

    if (!imageKey[0])
    {
        console.log(`Image Key is missing`)
        throw { statusCode: 400, error: "ImageKeyMissing"}
    }

    if (!resize)
    {
        console.log(`Resize is missing`)
        throw { statusCode: 400, error: "ResizeMissing"}
    }

    if (!compression)
    {
        console.log(`Compression Level is missing`)
        throw { statusCode: 400, error: "CompressionLevelMissing"}
    }

    console.log("Validation Success")
}

const handleRequest = async (images, resize, compression) => {

    const zip = new JSZip();

    const result = await Promise.all(images.map(async (uuID) => {

        const {Body, ContentType} = await getObject(uuID);

        const checksum = generateChecksum(Body);

        const extension = uuID.split(".")[1];

        const processedKey = `${checksum}-x${resize}-${compression}.${extension}`;

        const redisURL = await getURLRedis(processedKey)

        if(redisURL)
        {
            console.log(`Found ${processedKey} in redis`)
            const { data } = await axios.get(redisURL, { responseType: 'arraybuffer'});
            zip.file(processedKey, data)
            return {key: processedKey, url: redisURL}
        }

        const data = await checkExistingProcessedImageS3(processedKey)

        if (data) {
            console.log(`Found ${processedKey} in S3`)
            storeURLRedis(processedKey, data.url);
            zip.file(processedKey, data.imageBuffer)
            return {key: processedKey, url: data.url}
        }

        const processedData = await processImage(+resize, +compression, Body)
        await putObject(processedKey, processedData.imageBuffer, ContentType);
        const processedDownloadURL = await getDownloadURL(processedKey);

        storeURLRedis(processedKey, processedDownloadURL);
        zip.file(processedKey, processedData.imageBuffer)

        return {key: processedKey, url: processedDownloadURL}
    }))

    const zipBuffer = await zip.generateAsync({type:'nodebuffer'})

    const key = `${generateChecksum(zipBuffer)}.zip`;

    await putObject(key, zipBuffer, 'application/zip');

    return await getDownloadURL(key);
}

const processImage = async (resize, compression, buffer) => {

    const processedImageBuffer = await resizeImage(buffer, resize, compression);

    return {imageBuffer: processedImageBuffer};
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

        const {Body} = await getObject(key);

        const url = await getDownloadURL(key);

        return {url, imageBuffer: Body};
    }
    catch (error) {
        return null;
    }
}

module.exports = { validateRequest, handleRequest, processImage };