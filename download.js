const https = require('https');
const fs = require('fs');

const url = 'https://i.pinimg.com/originals/9b/3c/7b/9b3c7ba7224d1661884cf051c0c3caca.jpg';
const dest = 'd:/PersonalProjects/Vastra/web/public/images/products/blouse.png';
const file = fs.createWriteStream(dest);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download complete');
        process.exit(0);
    });
}).on('error', (err) => {
    console.error(err);
    fs.unlink(dest, () => { });
    process.exit(1);
});
