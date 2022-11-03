const files = document.getElementById('image-files');
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
// download.addEventListener('click', () => {
//     download.style.display = "none";
//     upload.style.display = "block";
// })

// Upload one or multiple images to transcode
function Upload() {
    instruction.style.display = "none";
    const imageFiles = files.files;
    
    for (const file of imageFiles) {
        if (!validFileType(file)) continue;
        const image = document.createElement('img');
        const reader = new FileReader();

        // Insert a row for each uploaded image
        reader.addEventListener("load", () => {
            image.src = reader.result;
            const row = imageTable.insertRow(imageTable.rows.length);
            row.insertCell(0).innerHTML =`${imageTable.rows.length}`;
            row.insertCell(1).innerHTML =`<img src="${image.src}">`;
            row.insertCell(2).innerHTML = `${file.name}`;
            row.insertCell(3).innerHTML = `${formatFileSize(file.size)}`;
            row.insertCell(4).innerHTML = `<input type="button" id="delete" value="Delete" onclick="deleteRow(this)" class="btn"/>`;
        }, false);

        if (file) {
            reader.readAsDataURL(file);
        }
    }
}

// Check the uploaded file type
function validFileType(file) {
    const fileTypes = [
        "image/apng",
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/svg+xml",
        "image/tiff",
        "image/webp",
        "image/x-icon"
    ];
    return fileTypes.includes(file.type);
}

// Format file sizes for display purpose
function formatFileSize (bytes) {
    const sufixes = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sufixes[i]}`;
};

// Delete uploaded files
function deleteRow(row)
{
    let i = row.parentNode.parentNode.rowIndex;
    document.getElementById('image-table').deleteRow(i);

    if (imageTable.rows.length === 0) {
        instruction.style.display = "block";
    }

    // Re-index rows
    for (let i = 0; i < imageTable.rows.length; i++) {
        imageTable.rows[i].cells[0].innerHTML = i + 1;
    }
}

function apiCall(options) {
    const url = '/process'

    fetch(url, options)
    .then((res) => {
        return(res.json());
    })
    .then((data) => {
        download.href = data.downloadURL;
    })
}

// Transcode image with specified size and compression level
function Transcode() {
    const imageFiles = files.files;

    const formData = new FormData();

    for (let file of imageFiles) {
        formData.append("image", file)
    }

    formData.append("resize", resize.value)
    formData.append("compression", compression.value)

    const options = {
        method: 'POST',
        body: formData
    }

    apiCall(options)

    files.style.display = "none";
    upload.style.display = "none";
    download.style.display = "block";
}