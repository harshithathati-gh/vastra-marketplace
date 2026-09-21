const https = require('https');
const fs = require('fs');

const url = 'https://i.pinimg.com/originals/ff/72/31/ff7231b19d20c83f522cc64e6db882b4.jpg';
const dest = 'd:/PersonalProjects/Vastra/web/public/images/products/trousers.png';
const file = fs.createWriteStream(dest);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Trousers download complete');
        process.exit(0);
    });
}).on('error', (err) => {
    console.error(err);
    fs.unlink(dest, () => { });
    process.exit(1);
});
