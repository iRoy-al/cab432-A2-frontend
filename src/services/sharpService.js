const sharp = require("sharp");

const resizeImage = async (imgBuffer, resize, compression) => {
    try {
        console.log(`Start processing image`)

        const resizedImageBuffer = await sharp(imgBuffer)
            .metadata()
                .then(({ width }) => sharp(imgBuffer)
                .resize(Math.round(width * resize))
                .png({ compressionLevel: compression, force: true})
                .toBuffer()
        );

        console.log(`Image Processing is successful`)

        return resizedImageBuffer;
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = { resizeImage };