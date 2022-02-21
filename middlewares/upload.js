const multer = require('multer');
const path = require('path');
var jimp = require('jimp');

const tempDir = path.join(__dirname, '../', 'tamp');

const multerConfig = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
    size: (async()=>{
        await image.resize(250, jimp.AUTO);
    })
});

const upload = multer({
    storage: multerConfig,
});

module.exports = upload;