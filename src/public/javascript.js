const files = document.getElementById('image-files');
let imageFiles = [];
const upload = document.getElementById('upload-image');
const instruction = document.getElementById('instruction');
const imageTable = document.getElementById('image-table');
const transcode = document.getElementById('transcode');
const cancel = document.getElementById('cancel');
const resize = document.getElementById('resize-scale');
const compression = document.getElementById('compression-level');
const download = document.getElementById('download');

files.addEventListener('change', Upload);
transcode.addEventListener('click', Transcode);
download.addEventListener('click', Download)

// Upload one or multiple images to transcode
function Upload() {
    instruction.style.display = "none";

    for (const file of files.files) {
        if (!validFileType(file)) {
            instruction.innerText = "Invalid file type, please upload an image file"
            instruction.style.display = "block";
            continue;
        }
        else {
            const image = document.createElement('img');
            const reader = new FileReader();

            // Insert a row for each uploaded image
            reader.addEventListener("loadend", () => {
                image.src = reader.result;
                const row = imageTable.insertRow(imageTable.rows.length);
                row.insertCell(0).innerHTML =`${imageTable.rows.length}`;
                row.insertCell(1).innerHTML =`<img src="${image.src}">`;
                row.insertCell(2).innerHTML = `${file.name}`;
                row.insertCell(3).innerHTML = `${formatFileSize(file.size)}`;
                row.insertCell(4).innerHTML = `<input type="button" id="delete" value="Delete" onclick=deleteRow(this) class="btn"/>`;
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
            imageFiles.push(file);
        }
    }

    if (imageFiles.length > 0) {
        transcode.disabled = false;
    }
}

// Delete uploaded files
function deleteRow(row)
{
    let i = row.parentNode.parentNode.rowIndex;
    // Delete file from image files
    let index = imageFiles.findIndex(file => {
        return file.name === imageTable.rows[i].cells[2].innerHTML;
    });
    imageFiles.splice(index, 1);
    // Delete row from table
    document.getElementById('image-table').deleteRow(i);

    if (imageTable.rows.length === 0) {
        instruction.innerText = "Upload one or more images to resize, we support JPEG, PNG, WEBP, GIF, AVIF, TIFF, SVG"
        instruction.style.display = "block";
        transcode.disabled = true;
    }

    // Re-index rows
    for (let i = 0; i < imageTable.rows.length; i++) {
        imageTable.rows[i].cells[0].innerHTML = i + 1;
    }
}

// Check the uploaded file type
function validFileType(file) {
    const fileTypes = [
        "image/apng",
        "image/gif",
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/svg+xml",
        "image/tiff",
        "image/webp",
    ];
    return fileTypes.includes(file.type);
}

// Format file sizes for display purpose
function formatFileSize (bytes) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
};

async function uploadToS3(file) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contentType: file.type,
            extension: file.name.split('.')[1],
        })
    }
    const {uploadUrl, key} = await fetch('/upload', options).then(res => res.json());

    const body = new FormData();
    body.append('file', file)

    await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            "Content-Type": `${file.type}`
          },
        body: file
    });

    return key;
}

// Transcode image with specified size and compression level
async function Transcode() {
    transcode.innerText = "Transcoding...";
    transcode.disabled = true;
    files.style.display = "none";
    upload.style.display = "none";
    
    const keys = []
    for (const file of imageFiles) {
        keys.push(await uploadToS3(file));
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            keys: keys,
            resize: resize.value,
            compression: compression.value
        })
    }

    fetch('/process', options)
        .then(res => {
            if (res.ok) {
                download.style.display = "block";
            }  else {
                DisplayErrorMessage();
            }
            transcode.innerText = "Transcode";
            return res.json();
        })
        .then((data) => {
            download.href = data.downloadURL;
        })
}

// Download transcoded image
function Download() {
    download.style.display = "none";
    files.style.display = "block";
    upload.style.display = "block";
    imageFiles = [];
    imageTable.innerHTML = "";
    instruction.innerText = "Upload one or more images to resize, we support JPEG, PNG, WEBP, GIF, AVIF, TIFF, SVG"
    instruction.style.display = "block";
}

function DisplayErrorMessage() {
    imageFiles = [];
    imageTable.remove();
    download.style.display = "none";
    upload.style.display = "block";
    instruction.innerText = "Something went wrong, transcoding failed";
    instruction.style.display = "block";
}