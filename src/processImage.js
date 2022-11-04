const { resizeImage } = require('./services/sharpService');
const { putObject, getDownloadURL } = require('./services/s3Service')

const processImage = async (key, resize, compression, buffer, ContentType) => {
    
    validateRequest(key, resize, compression);

    const processedImageBuffer = await resizeImage(buffer, resize, compression);

    const processedImageKey = generateProcessedKey(key, resize, compression);

    await putObject(processedImageKey, processedImageBuffer, ContentType);

    const downloadURL = await getDownloadURL(processedImageKey)

    return {key: processedImageKey, url: downloadURL};
}

const validateRequest = (imageKey, resize, compression) => {

    console.log("Validating Request Body")

    console.log(`Key:${imageKey}, Resize: ${resize}, Compression: ${compression}`)

    if (!imageKey)
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

const generateProcessedKey = (key, resize, compression) => {

    const keyArr = key.split(".");

    const base = keyArr[0]

    const extension = keyArr[1];

    return `${base}-x${resize}-${compression}.${extension}`;
}

module.exports = { processImage };