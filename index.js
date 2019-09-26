const sharp = require('sharp');
const Busboy = require('busboy');

exports.webp = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    const busboy = new Busboy({headers: req.headers});
    const fields = {};
    let buffer;

    busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, filename) => {
        file.on('data', (data) => buffer = data);
    });

    busboy.on('finish', () => {
        let servername = fields.servername;
        let options = JSON.parse(fields.options);
        let start = new Date();
        sharp(buffer).webp({quality: options.quality}).toBuffer().then(function (data) {
            let before = buffer.byteLength;
            let after = data.byteLength;
            let percent = Math.round((1 - (after / before)) * 100);
            let end  = new Date();
            let time = end.getTime() - start.getTime();
            res.send(data);
            console.log(`Converted: ${servername}, q=${options.quality}, -${percent}% from ${formatBytes(before)} to ${formatBytes(after)} in ${time} ms`);
        })
    });
    busboy.end(req.rawBody);
};

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}