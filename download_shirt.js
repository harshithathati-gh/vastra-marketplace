const https = require('https');
const fs = require('fs');

const url = 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/Group_1-03_28e7cab7-92f1-46f0-a5c0-30194b1ae35e.jpg?v=1665137073';
const dest = 'd:/PersonalProjects/Vastra/web/public/images/products/formal_shirt.png';
const file = fs.createWriteStream(dest);

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Shirt download complete');
        process.exit(0);
    });
}).on('error', (err) => {
    console.error(err);
    fs.unlink(dest, () => { });
    process.exit(1);
});
