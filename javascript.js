const uploaded_image = document.getElementById("preview");
const transcoded_image = document.getElementById("transcoded-preview");
const download_image = document.getElementById("download-image");

document.getElementById('imgFile').onchange = function() {
    document.getElementById('upload-image').click();
    Upload();
}
document.getElementById('transcode').addEventListener('click', Transcode);
document.getElementById('download-image').addEventListener('click', Download);

function Upload() {
    const input_image = document.getElementById("imgFile").files[0];  
    // Upload an image to transcode
    const reader = new FileReader();

    // const formData = new FormData();
    // formData.append("image", input_image)

    // const url = "/upload";
    // const options = {
    //     method: 'POST',
    //     body: formData
    // };

    // Display the uploaded image
    reader.addEventListener("load", () => {
        uploaded_image.src = reader.result;
    }, false);

    if (input_image) {
        reader.readAsDataURL(input_image);
    }
}

function Transcode() {
    // Replace this code to display transcoded image
    transcoded_image.src = uploaded_image.src;
}

function Download() {
    // Replace this code to download transcoded image
    download_image.href = transcoded_image.src
}