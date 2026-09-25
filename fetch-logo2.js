const https = require('https');
const fs = require('fs');
const url = "https://sdmntprcentralus.oaiusercontent.com/files/00000000-8e80-81f5-b3cd-28eb83ce46bc/raw?se=2026-09-22T15%3A53%3A23Z&sp=r&sv=2026-02-06&sr=b&scid=4ce3fe89-0c7f-4732-8db1-132ab833231e&skoid=3cb6de21-012a-49c9-9402-a1ebf8d0bd06&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-22T13%3A26%3A13Z&ske=2026-09-23T13%3A26%3A13Z&sks=b&skv=2026-02-06&sig=dG7gxjL4l69aZ1n7SUqJ2xlU/j%2BRYwlFFhz0YtZ66gM%3D";
const file = fs.createWriteStream("d:/PersonalProjects/Vastra/web/public/logo.png");
https.get(url, (response) => { response.pipe(file); file.on('finish', () => file.close()); console.log('Done'); });
