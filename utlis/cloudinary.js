
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dkskccoaj',
    api_key: '936414337849562',
    api_secret: 'x3Swx62Le9yMA0VyRV3DjHOkAoM',
});

module.exports = { cloudinary };