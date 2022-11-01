const files = document.getElementById('image-files');
const instruction = document.getElementById('instruction');
const imageTable = document.getElementById('image-table');
const transcode = document.getElementById('transcode');
const cancel = document.getElementById('cancel');

files.addEventListener('change', Upload);
transcode.addEventListener('click', Transcode);

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
            row.insertCell(0).innerHTML =`<img src="${image.src}">`;
            row.insertCell(1).innerHTML = `${file.name}`;
            row.insertCell(2).innerHTML = `${formatFileSize(file.size)}`;
            row.insertCell(3).innerHTML = `<input type="button" id="delete" value="Delete" onclick="deleteRow(this)" class="btn"/>`;
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
}

// Transcode image with specified size and compression level
function Transcode() {
    transcode.style.display = "none";
    cancel.style.display = "block";
}

// Download transcoded image
function Download() {
    // Replace this code to download transcoded image
}