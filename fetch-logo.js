const https = require('https');
const fs = require('fs');

const url = "https://sdmntprcentralus.oaiusercontent.com/files/00000000-8e80-81f5-b3cd-28eb83ce46bc/raw?se=2026-09-22T15%3A25%3A35Z&sp=r&sv=2026-02-06&sr=b&scid=82aaa95b-cd8c-44ee-963b-b6c0b1663d33&skoid=3cb6de21-012a-49c9-9402-a1ebf8d0bd06&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-22T01%3A09%3A50Z&ske=2026-09-23T01%3A09%3A50Z&sks=b&skv=2026-02-06&sig=ooVYml47%2B15%2B2S1aPhVdg5tXbEEZoA5q28Ro1msTMbk%3D";
const dest = "d:/PersonalProjects/Vastra/web/public/logo.png";

https.get(url, (res) => {
    const fileStream = fs.createWriteStream(dest);
    res.pipe(fileStream);
    fileStream.on("finish", () => {
        fileStream.close();
        console.log("Download finish");
    });
}).on("error", (err) => {
    console.error("Error: ", err.message);
});
